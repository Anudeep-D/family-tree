package dev.anudeep.familytree.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String eventId; // Unique ID for this event instance
    private EventType eventType;
    private String treeId;
    private String actorUserId; // User who initiated the event (elementId of the User)
    private Instant timestamp;
    private Map<String, Object> data; // Event-specific payload

    public NotificationEvent(EventType eventType, String treeId, String actorUserId, Map<String, Object> data) {
        this.eventId = java.util.UUID.randomUUID().toString();
        this.eventType = eventType;
        this.treeId = treeId;
        this.actorUserId = actorUserId;
        this.timestamp = Instant.now();
        this.data = data;
    }
}
