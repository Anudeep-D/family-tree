package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import dev.anudeep.familytree.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import dev.anudeep.familytree.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationManagementService {

    private final NotificationRepository notificationRepository;


    @Transactional
    public boolean markNotificationAsRead(String userElementId, String eventId) {
        Optional<Notification> notificationOptional = notificationRepository.findByRecipientUserIdAndEventId(userElementId, eventId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            log.debug("Found notification to mark as read. ID: {}, Current status: {}", notification.getEventId(), notification.getStatus());
            if (notification.getStatus() == NotificationStatus.UNREAD) {
                LocalDateTime now = LocalDateTime.now();
                notificationRepository.updateNotificationStatusAndTimestamp(
                        userElementId,
                        eventId,
                        NotificationStatus.READ.name(), // Persist enum as string name
                        now);
                log.info("Attempted to update notification {} status to READ via custom query for user {}", eventId, userElementId);
                // Verification of this custom update would typically involve a subsequent read,
                // or trusting the direct Cypher execution. The next GET /api/notifications will be the test.
                return true;
            } else {
                log.info("Notification (Event ID: {}) for user {} was already READ. Status: {}",
                        eventId, userElementId, notification.getStatus());
                return false; // Indicates no change was made as it was already read
            }
        }
        log.warn("Notification with event ID {} not found for user {} to mark as read.", eventId, userElementId);
        return false; // Indicates not found
    }

    @Transactional
    public boolean markNotificationAsUnread(String userElementId, String eventId) {
        Optional<Notification> notificationOptional = notificationRepository.findByRecipientUserIdAndEventId(userElementId, eventId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            log.debug("Found notification to mark as UNREAD. ID: {}, Current status: {}", notification.getEventId(), notification.getStatus());
            if (notification.getStatus() == NotificationStatus.READ) {
                LocalDateTime now = LocalDateTime.now();
                notificationRepository.updateNotificationStatusAndTimestamp(
                        userElementId,
                        eventId,
                        NotificationStatus.UNREAD.name(), // Persist enum as string name
                        now);
                log.info("Attempted to update notification {} status to UNREAD via custom query for user {}", eventId, userElementId);
                return true;
            } else {
                log.info("Notification (Event ID: {}) for user {} was already UNREAD. Status: {}",
                        eventId, userElementId, notification.getStatus());
                return false; // Indicates no change was made as it was already unread
            }
        }
        log.warn("Notification with event ID {} not found for user {} to mark as unread.", eventId, userElementId);
        return false; // Indicates not found
    }

    @Transactional
    public boolean deleteNotification(String userElementId, String eventId) {
        Optional<Notification> notificationOptional = notificationRepository.findByRecipientUserIdAndEventId(userElementId, eventId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            notificationRepository.delete(notification);
            log.info("Deleted notification (DB internalID: {}, Event ID: {}) for user {}", notification.getInternalId(), eventId, userElementId);
            return true;
        }
        log.warn("Notification with event ID {} not found for user {} to delete.", eventId, userElementId);
        return false;
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(String userElementId) {
        log.debug("Fetching all notifications for user {}", userElementId);
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userElementId);
    }

    @Transactional
    public List<String> markAllNotificationsAsReadForUser(String userElementId) {
        log.info("Attempting to mark all unread notifications as read for user {}", userElementId);
        LocalDateTime now = LocalDateTime.now();
        List<String> updatedEventIds = notificationRepository.updateStatusForAllUnreadNotificationsByUser(userElementId, now);
        log.info("Marked {} notifications as read for user {}", updatedEventIds.size(), userElementId);
        return updatedEventIds;
    }

    @Transactional
    public void markNotificationsAsUnreadBatch(String userElementId, List<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            log.info("No event IDs provided to mark as unread for user {}. Skipping.", userElementId);
            return;
        }
        log.info("Attempting to mark {} notifications as unread for user {}", eventIds.size(), userElementId);
        LocalDateTime now = LocalDateTime.now();
        notificationRepository.markNotificationsAsUnreadBatch(userElementId, eventIds, now);
        log.info("Batch mark as unread operation completed for user {} for {} eventIds", userElementId, eventIds.size());
    }

    @Transactional
    public boolean deleteAllReadNotificationsForUser(String userElementId) throws Exception {
        log.info("Attempting to delete all read notifications for user {}", userElementId);
        // First, check if there are any read notifications to delete to avoid unnecessary logging if none exist.
        // This is an optimization and can be removed if direct delete is preferred.
        List<Notification> readNotifications = notificationRepository.findByRecipientUserIdAndStatus(userElementId, NotificationStatus.READ);
        if (readNotifications.isEmpty()) {
            log.info("No read notifications found to delete for user {}", userElementId);
            return false; // Or true, depending on whether "nothing to delete" is a success. Let's say false for "no action taken".
        }
        notificationRepository.deleteAllReadNotificationsByUser(userElementId);
        log.info("Successfully deleted all read notifications (count: {}) for user {}", readNotifications.size(), userElementId);
        return true;
    }
}
