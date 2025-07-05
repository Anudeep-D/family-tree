package dev.anudeep.familytree.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import dev.anudeep.familytree.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserSubscriptionListener implements ApplicationListener<SessionSubscribeEvent> {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper; // Ensure this is the same configured ObjectMapper

    private static final String NOTIFICATION_DESTINATION = "/user/queue/notifications";
    // The actual destination prefix a client subscribes to for user-specific queues is often just "/queue/notifications"
    // Spring prepends "/user/{username}" automatically. So we check for the suffix.
    private static final String USER_SPECIFIC_NOTIFICATION_SUFFIX = "/queue/notifications";


    @Override
    public void onApplicationEvent(SessionSubscribeEvent event) {
        log.debug("onApplicationEvent triggered");
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = headerAccessor.getUser();
        String destination = headerAccessor.getDestination();

        if (userPrincipal == null) {
            log.debug("User principal is null for subscription to destination: {}. Cannot fetch pending notifications.", destination);
            return;
        }

        String userElementId = userPrincipal.getName();

        // Check if the subscription is for the user-specific notification queue
        // User subscribes to "/user/queue/notifications", STOMP resolves this to "/user/{userElementId}/queue/notifications"
        // The destination in the event might be the fully resolved one or the one client sent.
        // Let's check if the destination *is* the user's personal notification queue.
        // The 'destination' from the event is the one the client sent, e.g., "/user/queue/notifications".
        // We should compare against this known destination string.
        if (destination != null && destination.equals(NOTIFICATION_DESTINATION)) {
            log.info("User {} subscribed to {}. Fetching pending notifications.", userElementId, NOTIFICATION_DESTINATION);

            try {
                List<Notification> pendingNotifications = notificationRepository.findByRecipientUserIdAndStatusOrderByCreatedAtDesc(
                        userElementId, NotificationStatus.UNREAD);

                if (pendingNotifications.isEmpty()) {
                    log.info("No pending UNREAD notifications for user {}.", userElementId);
                    return;
                }

                log.info("Found {} UNREAD notifications for user {}. Sending them now.", pendingNotifications.size(), userElementId);

                for (Notification dbNotification : pendingNotifications) {
                    try {
                        // Reconstruct NotificationEvent for the 'eventDetails' part of the payload
                        NotificationEvent reconstructedEvent = new NotificationEvent();
                        reconstructedEvent.setEventId(dbNotification.getEventId());
                        reconstructedEvent.setEventType(dbNotification.getEventType());
                        reconstructedEvent.setTreeId(dbNotification.getTreeId());
                        reconstructedEvent.setTreeName(dbNotification.getTreeName());
                        reconstructedEvent.setActorUserId(dbNotification.getActorUserId());
                        reconstructedEvent.setActorUserName(dbNotification.getActorUserName());
                        // Timestamps should be in a consistent format, ideally ISO 8601
                        // dbNotification.getCreatedAt() is LocalDateTime, convert to Instant assuming UTC
                        reconstructedEvent.setTimestamp(dbNotification.getCreatedAt().atZone(ZoneOffset.UTC).toInstant());


                        // Parse the stored messagePayload (JSON string) to get the 'details' map for NotificationEvent's data field
                        Map<String, Object> messagePayloadMap = objectMapper.readValue(dbNotification.getMessagePayload(), new TypeReference<Map<String, Object>>() {});
                        Object detailsData = messagePayloadMap.get("details");
                        if (detailsData instanceof Map) {
                            reconstructedEvent.setData((Map<String, Object>) detailsData);
                        }


                        // Reconstruct FrontendNotificationPayload (mirroring StompNotificationForwarder.FrontendNotificationPayload)
                        // Assuming StompNotificationForwarder.FrontendNotificationPayload is accessible or we redefine it here.
                        // For now, let's use a local Map or a dedicated DTO if that class is not easily reusable.
                        // Let's assume we can create an instance of that payload.
                        // We need access to StompNotificationForwarder.FrontendNotificationPayload
                        // For now, let's construct a map and let SimpMessagingTemplate handle serialization.

                        StompNotificationForwarder.FrontendNotificationPayload payload =
                                new StompNotificationForwarder.FrontendNotificationPayload(
                                        dbNotification.getEventId(),
                                        dbNotification.getMessagePayload(), // This is the JSON string message
                                        dbNotification.getCreatedAt().atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT), // Consistent timestamp format
                                        reconstructedEvent
                                );

                        // Send to the user's specific queue destination
                        messagingTemplate.convertAndSendToUser(userElementId, USER_SPECIFIC_NOTIFICATION_SUFFIX, payload);
                        log.info("Sent pending notification (DB ID: {}, Event ID: {}) to user {}.", dbNotification.getInternalId(), dbNotification.getEventId(), userElementId);

                        // Optionally, mark the notification as READ after sending
                        // dbNotification.setStatus(NotificationStatus.READ);
                        // notificationRepository.save(dbNotification);
                        // For now, this will be handled by a separate "mark as read" user action.

                    } catch (Exception e) {
                        log.error("Error processing and sending pending notification (DB ID: {}) for user {}: {}",
                                dbNotification.getInternalId(), userElementId, e.getMessage(), e);
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching or sending pending notifications for user {}: {}", userElementId, e.getMessage(), e);
            }
        } else {
            if (destination != null && destination.startsWith("/user/")) { // Log other user-specific subscriptions if needed
                log.debug("User {} subscribed to a different user-specific destination: {}", userElementId, destination);
            }
        }
    }
}
