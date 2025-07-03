package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.notification.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StompNotificationForwarder {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserTreeService userTreeService; // To get all users for a tree

    // Listening to the queue defined in application.properties (e.g., tree_event_queue)
    @RabbitListener(queues = "${rabbitmq.queue.name}")
    public void forwardNotificationToStomp(NotificationEvent event) {
        if (event == null || event.getTreeId() == null || event.getTreeId().isEmpty()) {
            log.warn("Received event without treeId, cannot determine recipients: {}", event);
            return;
        }

        // Get all users who should be notified for this tree event
        // This part was missing and is crucial for notifying users other than just the actor.
        java.util.List<dev.anudeep.familytree.model.User> usersToNotify = userTreeService.getUsersForTree(event.getTreeId());

        if (usersToNotify == null || usersToNotify.isEmpty()) {
            log.info("No users found with access to treeId: {} for eventId: {}. No STOMP notifications will be sent.", event.getTreeId(), event.getEventId());
            return;
        }

        String userQueueSuffix = "/queue/notifications"; // Path suffix for user-specific queue

        // Construct message payload once
        String messageText = String.format("Event: %s on tree %s", event.getEventType(), event.getTreeId());
        if (event.getData() != null && event.getData().containsKey("message")) {
            messageText = event.getData().get("message").toString();
        } else if (event.getData() != null && !event.getData().isEmpty()) {
            messageText = String.format("Event: %s on tree %s. Details: %s", event.getEventType(), event.getTreeId(), event.getData().toString());
        }

        FrontendNotificationPayload payload = new FrontendNotificationPayload(
                event.getEventId(),
                messageText,
                event.getTimestamp().toString()
        );

        log.info("Preparing to forward notification event (ID: {}) for treeId: {} to {} users.",
                event.getEventId(), event.getTreeId(), usersToNotify.size());

        for (dev.anudeep.familytree.model.User user : usersToNotify) {
            if (user.getElementId() == null || user.getElementId().isEmpty()) {
                log.warn("User object found for treeId {} has no elementId, skipping STOMP notification for this user object.", event.getTreeId());
                continue;
            }
            // Log the conceptual full path correctly
            log.info("Forwarding notification event (ID: {}) for user: {} to STOMP destination: /user/{}{}",
                    event.getEventId(), user.getElementId(), user.getElementId(), userQueueSuffix);
            try {
                messagingTemplate.convertAndSendToUser(
                        user.getElementId(),    // User destination (Spring resolves this)
                        userQueueSuffix,        // The specific queue for that user
                        payload                 // The payload
                );
                log.debug("Successfully forwarded notification event (ID: {}) to user {}", event.getEventId(), user.getElementId());
            } catch (Exception e) {
                log.error("Error forwarding notification event (ID: {}) to user {}: {}",
                        event.getEventId(), user.getElementId(), e.getMessage(), e);
            }
        }
    }

    // Inner class for the payload to match frontend expectations
    // This could also be a top-level DTO in the dto.notification package
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    static class FrontendNotificationPayload {
        private String id; // Corresponds to NotificationEvent.eventId
        private String message;
        private String timestamp; // ISO String
        private String link; // Optional

        public FrontendNotificationPayload(String id, String message, String timestamp) {
            this.id = id;
            this.message = message;
            this.timestamp = timestamp;
        }
    }
}
