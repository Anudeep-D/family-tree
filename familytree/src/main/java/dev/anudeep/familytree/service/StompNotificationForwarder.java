package dev.anudeep.familytree.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class StompNotificationForwarder {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserTreeService userTreeService; // To get all users for a tree
    private final ObjectMapper objectMapper; // Added for JSON conversion

    // Listening to the queue defined in application.properties (e.g., tree_event_queue)
    @RabbitListener(queues = "${rabbitmq.queue.name}")
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
            log.info("Forwarding notification event (ID: {}) for user: {} to STOMP destination: /user/{}{}",
                    event.getEventId(), userElementId, userElementId, userQueueSuffix);
            try {
                // Sending the FrontendNotificationPayload which now includes the original event
                messagingTemplate.convertAndSendToUser(
                        userElementId,
                        userQueueSuffix,
                        payload // This payload wrapper is sent
                );
                // If the frontend is set up to directly consume NotificationEvent, then 'event' could be sent directly:
                // messagingTemplate.convertAndSendToUser(userElementId, userQueueSuffix, event);

                log.debug("Successfully forwarded notification event (ID: {}) to user {}", event.getEventId(), userElementId);
            } catch (Exception e) {
                log.error("Error forwarding notification event (ID: {}) to user {}: {}",
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
