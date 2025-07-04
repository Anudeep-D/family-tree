package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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

        List<User> usersToNotify = userTreeService.getUsersForTree(event.getTreeId());

        if (usersToNotify == null || usersToNotify.isEmpty()) {
            log.info("No users found with access to treeId: {} for eventId: {}. No STOMP notifications will be sent.", event.getTreeId(), event.getEventId());
            return;
        }

        String userQueueSuffix = "/queue/notifications";

        // Build HTML message
        StringBuilder detailsHtml = new StringBuilder();
        Map<String, Object> data = event.getData();

        if (data != null && !data.isEmpty()) {
            detailsHtml.append("<ul style=\"margin-top: 0;\">");
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                detailsHtml.append(String.format(
                        "<li><strong>%s:</strong> %s</li>",
                        entry.getKey(),
                        entry.getValue()
                ));
            }
            detailsHtml.append("</ul>");
        }

        String detailsSection = !detailsHtml.isEmpty()
                ? "<strong>Details:</strong><br />" + detailsHtml
                : "";

        String messageText = String.format(
                "<div>" +
                        "<strong>Event:</strong> %s<br />" +
                        "<strong>Tree:</strong> %s<br />" +
                        "%s" +
                        "</div>",
                event.getEventType(),
                event.getTreeId(),
                detailsSection
        );

        FrontendNotificationPayload payload = new FrontendNotificationPayload(
                event.getEventId(),
                messageText,
                event.getTimestamp().toString()
        );

        log.info("List of users to notify: {}",usersToNotify.toString());
        log.info("Preparing to forward notification event (ID: {}) for treeId: {} to {} users.",
                event.getEventId(), event.getTreeId(), usersToNotify.size());

        for (dev.anudeep.familytree.model.User user : usersToNotify) {
            if (user.getElementId() == null || user.getElementId().isEmpty()) {
                log.warn("User object found for treeId {} has no elementId, skipping STOMP notification for this user object.", event.getTreeId());
                continue;
            }
            log.info("Forwarding notification event (ID: {}) for user: {} to STOMP destination: /user/{}{}",
                    event.getEventId(), user.getElementId(), user.getElementId(), userQueueSuffix);
            try {
                messagingTemplate.convertAndSendToUser(
                        user.getElementId(),
                        userQueueSuffix,
                        payload
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
