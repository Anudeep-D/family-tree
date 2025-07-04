package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import dev.anudeep.familytree.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            if (notification.getStatus() == NotificationStatus.UNREAD) {
                notification.setStatus(NotificationStatus.READ);
                notification.setUpdateTimestamp(); // Update the 'updatedAt' timestamp
                notificationRepository.save(notification);
                log.info("Marked notification (DB internalID: {}, Event ID: {}) as READ for user {}", notification.getInternalId(), eventId, userElementId);
                return true;
            } else {
                log.info("Notification (DB internalID: {}, Event ID: {}) for user {} was already READ", notification.getInternalId(), eventId, userElementId);
                return false; // Or true, if "already read" is considered a success for this operation
            }
        }
        log.warn("Notification with event ID {} not found for user {} to mark as read.", eventId, userElementId);
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
}
