package dev.anudeep.familytree.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.service.NotificationManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationManagementService notificationManagementService;

    @GetMapping
    public ResponseEntity<?> getAllNotificationsForUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("User not authenticated.");
        }
        String userElementId = principal.getName();
        log.info("Request received to fetch all notifications for user {}", userElementId);
        try {
            List<Notification> notifications = notificationManagementService.getNotificationsForUser(userElementId);
            if (log.isDebugEnabled()) { // Avoid expensive serialization if not debugging
                try {
                    ObjectMapper objectMapper = new ObjectMapper(); // Or inject if already available
                    objectMapper.findAndRegisterModules(); // To handle Java 8 date/time types
                    log.debug("Notifications fetched for user {}: {}", userElementId, objectMapper.writeValueAsString(notifications));
                } catch (Exception e) {
                    log.warn("Could not serialize notifications to JSON for logging for user {}: {}", userElementId, e.getMessage());
                }
            }
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userElementId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing request.");
        }
    }

    @PostMapping("/{eventId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable String eventId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("User not authenticated.");
        }
        String userElementId = principal.getName();
        log.info("Request received to mark notification with event ID {} as read for user {}", eventId, userElementId);
        try {
            boolean success = notificationManagementService.markNotificationAsRead(userElementId, eventId);
            if (success) {
                return ResponseEntity.ok().body("Notification marked as read.");
            } else {
                // Returning 200 OK even if already read, as the state is achieved.
                // Client might prefer 409 Conflict or a specific message if it needs to distinguish.
                return ResponseEntity.ok().body("Notification was already read or not found for this user.");
            }
        } catch (Exception e) {
            log.error("Error marking notification {} as read for user {}: {}", eventId, userElementId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing request.");
        }
    }

    @PostMapping("/{eventId}/unread")
    public ResponseEntity<?> markNotificationAsUnread(@PathVariable String eventId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("User not authenticated.");
        }
        String userElementId = principal.getName();
        log.info("Request received to mark notification with event ID {} as unread for user {}", eventId, userElementId);
        try {
            boolean success = notificationManagementService.markNotificationAsUnread(userElementId, eventId);
            if (success) {
                return ResponseEntity.ok().body("Notification marked as unread.");
            } else {
                // Returning 200 OK even if already unread, as the state is achieved.
                return ResponseEntity.ok().body("Notification was already unread or not found for this user.");
            }
        } catch (Exception e) {
            log.error("Error marking notification {} as unread for user {}: {}", eventId, userElementId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing request.");
        }
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteNotification(@PathVariable String eventId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("User not authenticated.");
        }
        String userElementId = principal.getName();
        log.info("Request received to delete notification with event ID {} for user {}", eventId, userElementId);
        try {
            boolean success = notificationManagementService.deleteNotification(userElementId, eventId);
            if (success) {
                return ResponseEntity.ok().body("Notification deleted.");
            } else {
                return ResponseEntity.status(404).body("Notification not found.");
            }
        } catch (Exception e) {
            log.error("Error deleting notification {} for user {}: {}", eventId, userElementId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error processing request.");
        }
    }
}
