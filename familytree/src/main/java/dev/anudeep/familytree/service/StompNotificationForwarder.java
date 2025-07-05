package dev.anudeep.familytree.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class StompNotificationForwarder {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserTreeService userTreeService; // To get all users for a tree
    private final ObjectMapper objectMapper; // Added for JSON conversion
    private final NotificationRepository notificationRepository; // Injected repository

    // Listening to the queue defined in application.properties (e.g., tree_event_queue)
    @RabbitListener(queues = "${rabbitmq.queue.name}")
    @Transactional // Ensure atomicity for saving notification and sending STOMP message
    public void forwardNotificationToStomp(NotificationEvent event) {
        if (event == null || event.getUsersToNotify() == null || event.getUsersToNotify().isEmpty()) {
            log.warn("Received event without usersToNotify list or list is empty, cannot dispatch: {}", event);
            return;
        }

        String userQueueSuffix = "/queue/notifications";

        // The frontend will now use event.getTreeName() and event.getActorUserName() directly.
        // The 'message' field in FrontendNotificationPayload can be simplified or made more generic,
        // as the frontend will have more structured data from the NotificationEvent object.
        // For now, we will pass the NotificationEvent object itself, assuming the frontend can adapt.
        // If a specific string message is still required, this part would need more complex formatting logic.

        // Option 1: Send the whole NotificationEvent (preferred if frontend can handle it)
        // The frontend would then be responsible for displaying event.getTreeName(), event.getActorUserName(), etc.

        // Option 2: Construct a simplified FrontendNotificationPayload if the frontend expects a simple string.
        // Construct messageText as a JSON string.
        Map<String, Object> messageJsonMap = new HashMap<>();
        messageJsonMap.put("eventType", event.getEventType().toString());
        messageJsonMap.put("treeId", event.getTreeId());
        messageJsonMap.put("treeName", event.getTreeName()); // Might be null, frontend should handle
        messageJsonMap.put("actorUserId", event.getActorUserId());
        messageJsonMap.put("actorUserName", event.getActorUserName()); // Might be null, frontend should handle

        // Include the 'data' map as a nested 'details' object in the JSON
        if (event.getData() != null && !event.getData().isEmpty()) {
            messageJsonMap.put("details", event.getData());
        } else {
            messageJsonMap.put("details", new HashMap<>()); // Empty details object
        }

        String messageTextJson;
        try {
            messageTextJson = objectMapper.writeValueAsString(messageJsonMap);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Error serializing messageText to JSON for eventId: {}. Error: {}", event.getEventId(), e.getMessage(), e);
            // Fallback to a simple string message or skip notification for this part
            messageTextJson = String.format("{\"error\":\"Could not generate notification details for event %s\"}", event.getEventType());
        }

        FrontendNotificationPayload payload = new FrontendNotificationPayload(
                event.getEventId(),
                messageTextJson, // This is now a JSON string
                event.getTimestamp().toString(),
                event // Include the full event object for the frontend
        );

        log.info("For event type: {}, targeting {} users. Tree: '{}', Actor: '{}'",
                event.getEventType(), event.getUsersToNotify().size(), event.getTreeName(), event.getActorUserName());

        for (String userElementId : event.getUsersToNotify()) {
            if (userElementId == null || userElementId.isEmpty()) {
                log.warn("User elementId is null or empty in usersToNotify list for eventId: {}. Skipping.", event.getEventId());
                continue;
            }

            // Create and save the notification entity
            // Ensure eventType is not null before creating Notification entity
            dev.anudeep.familytree.dto.notification.EventType eventType = event.getEventType(); // Corrected type
            if (eventType == null) {
                log.warn("Received NotificationEvent (ID: {}) with null eventType. Storing with UNKNOWN type.", event.getEventId());
                // Assuming EventType is an enum in dev.anudeep.familytree.dto.notification package.
                // And that it has an UNKNOWN member. If not, this line would need adjustment or a different default strategy.
                try {
                    eventType = dev.anudeep.familytree.dto.notification.EventType.valueOf("UNKNOWN");
                } catch (IllegalArgumentException e) {
                    log.error("CRITICAL: EventType enum does not have an UNKNOWN member. Cannot set default for null eventType from event ID: {}. Storing as null!", event.getEventId(), e);
                    // If UNKNOWN is not available, eventType will remain null here, and frontend will show "Content unavailable".
                    // Or, throw an exception / don't save notification if eventType is mandatory.
                }
            }

            Notification persistentNotification = new Notification(
                    event.getEventId(),
                    userElementId,
                    eventType, // Use the potentially defaulted eventType
                    event.getTreeId(),
                    event.getTreeName(),
                    event.getActorUserId(),
                    event.getActorUserName(),
                    messageTextJson // This is the JSON string payload
            );
            persistentNotification.setCreationTimestamp(); // Set createdAt and updatedAt
            try {
                notificationRepository.save(persistentNotification);
                log.info("Saved notification (EventID: {}) for user {} to database. DB internalID: {}",
                        persistentNotification.getEventId(), userElementId, persistentNotification.getInternalId());
            } catch (Exception e) {
                log.error("Error saving notification (EventID: {}) for user {} to database. Error: {}",
                        event.getEventId(), userElementId, e.getMessage(), e);
                // Decide if we should still try to send via STOMP if DB save fails
                // For now, we'll continue and attempt to send to active users
            }

            log.info("Attempting to forward notification event (ID: {}) for user: {} to STOMP destination: /user/{}{}",
                    event.getEventId(), userElementId, userElementId, userQueueSuffix);
            try {
                // Sending the FrontendNotificationPayload which now includes the original event
                messagingTemplate.convertAndSendToUser(
                        userElementId,
                        userQueueSuffix,
                        payload // This payload wrapper is sent
                );
                log.debug("Successfully forwarded notification event (ID: {}) to user {} via STOMP", event.getEventId(), userElementId);
            } catch (Exception e) {
                log.error("Error forwarding notification event (ID: {}) to user {} via STOMP: {}",
                        event.getEventId(), userElementId, e.getMessage(), e);
            }
        }
    }



    // Inner class for the payload to match frontend expectations
    // Updated to include the original NotificationEvent if needed by frontend for more details
    // This could also be a top-level DTO in the dto.notification package
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    static class FrontendNotificationPayload {
        private String id; // Corresponds to NotificationEvent.eventId
        private String message; // Simple text message summary
        private String timestamp; // ISO String
        private String link; // Optional
        private NotificationEvent eventDetails; // The full original event

        public FrontendNotificationPayload(String id, String message, String timestamp, NotificationEvent eventDetails) {
            this.id = id;
            this.message = message;
            this.timestamp = timestamp;
            this.eventDetails = eventDetails;
        }
    }
}
