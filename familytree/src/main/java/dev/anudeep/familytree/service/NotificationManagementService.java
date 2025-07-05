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
                return false;
            }
        }
        log.warn("Notification with event ID {} not found for user {} to mark as read.", eventId, userElementId);
        return false;
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
                return false;
            }
        }
        log.warn("Notification with event ID {} not found for user {} to mark as unread.", eventId, userElementId);
        return false;
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
}
