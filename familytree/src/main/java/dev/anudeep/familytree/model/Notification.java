package dev.anudeep.familytree.model;

import dev.anudeep.familytree.dto.notification.EventType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate; // Spring Data common annotation
import org.springframework.data.annotation.LastModifiedDate; // Spring Data common annotation
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator; // For eventId if needed as primary or unique

import java.time.LocalDateTime;

@Node("Notification") // Specifies the label for the node in Neo4j
@Getter
@Setter
public class Notification {

    @Id @GeneratedValue // Neo4j internal ID, typically a Long
    private Long internalId; // Renamed from 'id' to avoid confusion if eventId is also considered an ID

    @Property("eventId") // Explicitly naming the property
    // @Id @GeneratedValue(generatorClass = UUIDStringGenerator.class) // Alternative: if eventId should be the true unique ID and generated
    private String eventId; // Original event ID from NotificationEvent, should be unique per user notification if used as a logical key

    @Property("recipientUserId")
    private String recipientUserId; // User's elementId

    @Property("eventType") // Enums are generally handled well by SDN
    private EventType eventType;

    @Property("treeId")
    private String treeId;

    @Property("treeName")
    private String treeName;

    @Property("actorUserId")
    private String actorUserId;

    @Property("actorUserName")
    private String actorUserName;

    @Property("messagePayload") // Neo4j properties can store large strings
    private String messagePayload; // JSON string of notification details

    @Property("status") // Enum for status
    private NotificationStatus status = NotificationStatus.UNREAD;

    // For auditing, @EnableNeo4jAuditing would be needed in a @Configuration class
    // And these fields would be automatically populated.
    // For now, assuming manual setting or that auditing is configured elsewhere.
    @CreatedDate // If auditing is enabled
    @Property("createdAt")
    private LocalDateTime createdAt;

    @LastModifiedDate // If auditing is enabled
    @Property("updatedAt")
    private LocalDateTime updatedAt;

    // Default constructor for Spring Data Neo4j
    public Notification() {
    }

    // Constructor for easier creation - ensure createdAt/updatedAt are handled
    public Notification(String eventId, String recipientUserId, EventType eventType, String treeId,
                        String treeName, String actorUserId, String actorUserName, String messagePayload) {
        this.eventId = eventId;
        this.recipientUserId = recipientUserId;
        this.eventType = eventType;
        this.treeId = treeId;
        this.treeName = treeName;
        this.actorUserId = actorUserId;
        this.actorUserName = actorUserName;
        this.messagePayload = messagePayload;
        this.status = NotificationStatus.UNREAD;
        // this.createdAt = LocalDateTime.now(); // Manual setting if auditing not configured
        // this.updatedAt = LocalDateTime.now(); // Manual setting
    }

    // Pre-persist and pre-update logic if not using auditing
    // This logic is better handled by Spring Data auditing features if available
    // or explicitly in the service layer before saving.
    public void setCreationTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
    }

    public void setUpdateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
