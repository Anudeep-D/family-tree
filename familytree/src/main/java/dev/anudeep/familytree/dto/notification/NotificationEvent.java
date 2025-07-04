package dev.anudeep.familytree.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String eventId; // Unique ID for this event instance
    private EventType eventType;
    private String treeId;
    private String treeName; // Name of the tree
    private String actorUserId; // User who initiated the event (elementId of the User)
    private String actorUserName; // Name of the user who initiated the event
    private Instant timestamp;
    private List<String> usersToNotify; // List of user elementIds to receive this notification
    private Map<String, Object> data; // Event-specific payload (kept for compatibility, new fields preferred)

    // Constructor for creating new events with all fields
    public NotificationEvent(EventType eventType, String treeId, String treeName, String actorUserId, String actorUserName, List<String> usersToNotify, Map<String, Object> data) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.treeId = treeId;
        this.treeName = treeName;
        this.actorUserId = actorUserId;
        this.actorUserName = actorUserName;
        this.timestamp = Instant.now();
        this.usersToNotify = usersToNotify;
        this.data = data; // Can be null or empty if not needed
    }

    // Existing constructor, updated to initialize new fields to null or empty.
    // Or, it could be removed if all call sites are updated. For now, keeping it and initializing.
    public NotificationEvent(EventType eventType, String treeId, String actorUserId, Map<String, Object> data) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.treeId = treeId;
        this.actorUserId = actorUserId;
        this.timestamp = Instant.now();
        this.data = data;
        // Initialize new fields to default/null values
        this.treeName = null;
        this.actorUserName = null;
        this.usersToNotify = null; // Or new ArrayList<>() if preferred
    }
}
