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
        log.info("NotificationDispatcher: Received event from RabbitMQ queue '{}'. EventId: {}, TreeId: {}, EventType: {}",
                "${rabbitmq.queue.name:tree_event_queue}", event.getEventId(), event.getTreeId(), event.getEventType());
        log.debug("Full received event details: {}", event);

        if (event.getTreeId() == null) {
            log.warn("Notification event (eventId: {}) has no treeId, cannot dispatch.", event.getEventId());
            return;
        }

        List<User> usersToNotify = userTreeService.getUsersForTree(event.getTreeId());

        if (usersToNotify == null || usersToNotify.isEmpty()) {
            log.warn("NotificationDispatcher: No users found with access to treeId: {} for eventId: {}. Cannot dispatch WebSocket notification.",
                    event.getTreeId(), event.getEventId());
            return;
        }

        log.info("NotificationDispatcher: Found {} users to notify for treeId: {}. Users: {}",
                usersToNotify.size(), event.getTreeId(), usersToNotify.stream().map(User::getElementId).collect(java.util.stream.Collectors.toList()));

        for (User user : usersToNotify) {
            String principalName = user.getElementId(); // This should be the name of the Principal object for the user's STOMP session.
            if (principalName == null || principalName.trim().isEmpty()) {
                log.warn("NotificationDispatcher: User object (elementId: {}, email: {}) has a null or empty principalName (getElementId). Skipping WebSocket send for this user for eventId: {}.",
                        user.getElementId(), user.getEmail(), event.getEventId());
                continue;
            }

            // Optional: Filter out the actor from receiving their own notification, if desired.
            // if (principalName.equals(event.getActorUserId())) {
            //     log.info("NotificationDispatcher: Skipping notification for actor {} (self) for eventId: {}", principalName, event.getEventId());
            //     continue;
            // }

            String destination = "/queue/notifications"; // Correct destination for SimpMessagingTemplate.convertAndSendToUser
            log.info("NotificationDispatcher: Attempting to send WebSocket message for eventId: {} to user principal: {} (destination: '/user/{}/queue/notifications').",
                    event.getEventId(), principalName, principalName);
            try {
                messagingTemplate.convertAndSendToUser(principalName, destination, event);
                log.info("NotificationDispatcher: Successfully sent WebSocket message for eventId: {} to user principal: {}",
                        event.getEventId(), principalName);
            } catch (Exception e) {
                log.error("NotificationDispatcher: Error sending WebSocket message for eventId: {} to user principal: {}. Error: {}",
                        event.getEventId(), principalName, e.getMessage(), e);
            }
        }
    }
}
