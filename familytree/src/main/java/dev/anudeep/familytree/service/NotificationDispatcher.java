package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@RabbitListener(queues = "${rabbitmq.queue.name:tree_event_queue}") // Queue name to be defined in properties
public class NotificationDispatcher {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserTreeService userTreeService;
    // We need to ensure User model's principal name used in STOMP matches what UserTreeService returns.
    // Typically, Spring Security principal.getName() is used for user destinations.

    @RabbitHandler
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Received notification event via RabbitMQ: eventId={}, treeId={}, type={}",
                event.getEventId(), event.getTreeId(), event.getEventType());

        if (event.getTreeId() == null) {
            log.warn("Notification event (eventId: {}) has no treeId, cannot dispatch.", event.getEventId());
            return;
        }

        List<User> usersToNotify = userTreeService.getUsersForTree(event.getTreeId());

        if (usersToNotify == null || usersToNotify.isEmpty()) {
            log.info("No users found with access to treeId: {} for eventId: {}", event.getTreeId(), event.getEventId());
            return;
        }

        log.debug("Dispatching event (eventId: {}) for treeId: {} to {} users.",
                event.getEventId(), event.getTreeId(), usersToNotify.size());

        for (User user : usersToNotify) {
            // Ensure the user object has the identifier used by Spring Security for STOMP user destinations.
            // This is typically the 'name' of the authenticated Principal.
            // If User.getElementId() is what's stored as principal name:
            String principalName = user.getElementId(); // Or user.getEmail() if that's the principal

            // Filter out the actor from receiving their own notification, unless desired.
            // For now, sending to all, including the actor. This can be refined.
            // if (user.getElementId().equals(event.getActorUserId())) {
            //     log.debug("Skipping notification for actor {} for eventId: {}", user.getElementId(), event.getEventId());
            //     continue;
            // }

            String destination = "/user/" + principalName + "/queue/notifications";
            try {
                log.debug("Sending WebSocket message for eventId: {} to user: {} at destination: {}",
                        event.getEventId(), principalName, destination);
                messagingTemplate.convertAndSendToUser(principalName, "/queue/notifications", event);
                log.info("Successfully sent WebSocket notification for eventId: {} to user: {}", event.getEventId(), principalName);
            } catch (Exception e) {
                log.error("Error sending WebSocket message for eventId: {} to user: {}: {}",
                        event.getEventId(), principalName, e.getMessage(), e);
            }
        }
    }
}
