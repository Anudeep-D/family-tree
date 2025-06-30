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

    // Listening to the queue defined in application.properties (e.g., tree_event_queue)
    @RabbitListener(queues = "${rabbitmq.queue.name}")
    public void forwardNotificationToStomp(NotificationEvent event) {
        if (event == null || event.getActorUserId() == null || event.getActorUserId().isEmpty()) {
            log.warn("Received event without actorUserId, cannot forward to user-specific STOMP queue: {}", event);
            return;
        }

        String destination = "/queue/notifications"; // Spring prepends /user/{username} automatically
        log.info("Forwarding notification event (ID: {}) for user: {} to STOMP destination: /user/{}/{}",
                event.getEventId(), event.getActorUserId(), event.getActorUserId(), destination);

        try {
            // The payload sent to the STOMP client will be the NotificationEvent object,
            // serialized to JSON by default.
            // The frontend's notificationService.ts uses addBackendNotification,
            // which expects fields like id, message, timestamp.
            // NotificationEvent has eventId, eventType, timestamp, etc.
            // We need to ensure the fields align or transform the event.
            // For now, sending the event as is. The frontend might need adjustment
            // or we create a dedicated DTO for the STOMP message.

            // Let's check the fields expected by addBackendNotification in notificationSlice.ts:
            // export interface Notification {
            //   id: string;
            //   message: string; // This needs to be constructed or mapped
            //   timestamp: string; // ISO string for date and time
            //   isRead: boolean;
            //   link?: string; // Optional link to navigate to
            // }
            // NotificationEvent has: eventId, eventType, treeId, actorUserId, timestamp, data.
            // We should map NotificationEvent to what the frontend expects.

            // Create a simple message string for now.
            // A more sophisticated approach would involve a proper DTO mapping.
            String messageText = String.format("Event: %s on tree %s", event.getEventType(), event.getTreeId());
            if (event.getData() != null && event.getData().containsKey("message")) {
                messageText = event.getData().get("message").toString();
            } else if (event.getData() != null && !event.getData().isEmpty()) {
                messageText = String.format("Event: %s on tree %s. Details: %s", event.getEventType(), event.getTreeId(), event.getData().toString());
            }


            // Constructing a payload that matches the frontend's Notification interface
            // (specifically what addBackendNotification expects: Omit<Notification, 'isRead'>)
            FrontendNotificationPayload payload = new FrontendNotificationPayload(
                    event.getEventId(),
                    messageText, // Using the constructed message
                    event.getTimestamp().toString() // Convert Instant to ISO string
                    // link can be added if available in event.getData()
            );

            messagingTemplate.convertAndSendToUser(
                    event.getActorUserId(), // User destination (Spring resolves this)
                    destination,            // The specific queue for that user
                    payload                 // The payload (NotificationEvent or a mapped DTO)
            );
            log.debug("Successfully forwarded notification event (ID: {}) to user {}", event.getEventId(), event.getActorUserId());
        } catch (Exception e) {
            log.error("Error forwarding notification event (ID: {}) to user {}: {}",
                    event.getEventId(), event.getActorUserId(), e.getMessage(), e);
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
