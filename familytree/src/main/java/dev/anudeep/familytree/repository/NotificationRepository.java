package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.Notification;
import dev.anudeep.familytree.model.NotificationStatus;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends Neo4jRepository<Notification, Long> { // Extending Neo4jRepository, Long is type of @Id field (internalId)

    // Find by properties on the Node. Spring Data Neo4j can derive these.
    // Assumes properties in Notification node are named recipientUserId, status, eventId, createdAt.

    List<Notification> findByRecipientUserIdAndStatus(String recipientUserId, NotificationStatus status);

    // List<Notification> findByRecipientUserIdAndStatusOrderByCreatedAtDesc(String recipientUserId, NotificationStatus status);
    @Query("MATCH (n:Notification) WHERE n.recipientUserId = $recipientUserId AND n.status = $status " +
            "RETURN n ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientUserIdAndStatusOrderByCreatedAtDesc(String recipientUserId, NotificationStatus status);

    @Query("MATCH (n:Notification) WHERE n.recipientUserId = $recipientUserId " +
            "RETURN n ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId); // For fetching all notifications for a user

    // Finding a single notification by recipient and eventId (logical key)
    // Optional is generally preferred for single-result finders.
    Optional<Notification> findByRecipientUserIdAndEventId(String recipientUserId, String eventId);

    @Query("MATCH (n:Notification) WHERE n.recipientUserId = $userElementId AND n.eventId = $eventId " +
            "SET n.status = $statusValue, n.updatedAt = $updatedAtValue")
    void updateNotificationStatusAndTimestamp(
            @Param("userElementId") String userElementId,
            @Param("eventId") String eventId,
            @Param("statusValue") String statusValue,
            @Param("updatedAtValue") LocalDateTime updatedAtValue);


    // Example of a custom Cypher query if needed, though the above should work by convention.
    // @Query("MATCH (n:Notification) WHERE n.recipientUserId = $recipientUserId AND n.eventId = $eventId RETURN n")
    // Optional<Notification> findNotificationUsingCypher(String recipientUserId, String eventId);

    // For deletion, if we need to delete by logical key directly:
    // Note: Spring Data Neo4j might not support deleteBy... directly from method name for complex cases.
    // A custom @Query might be needed, or fetch then delete.
    // The current service logic (fetch then delete) is fine.
    // Long deleteByRecipientUserIdAndEventId(String recipientUserId, String eventId);
}
