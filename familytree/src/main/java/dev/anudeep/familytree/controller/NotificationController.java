package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.service.NotificationManagementService; // This service will be created
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationManagementService notificationManagementService; // To be created

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
                return ResponseEntity.status(404).body("Notification not found or already read.");
            }
        } catch (Exception e) {
            log.error("Error marking notification {} as read for user {}: {}", eventId, userElementId, e.getMessage(), e);
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

    // Maybe an endpoint to get all (e.g., recent or unread) notifications for a user via HTTP as well?
    // For now, focusing on read/delete.
}
