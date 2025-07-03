package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.notification.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name:tree_events_exchange}") // Define in application.properties or use default
    private String exchangeName;

    public void sendNotification(NotificationEvent event) {
        if (event == null || event.getTreeId() == null || event.getEventType() == null) {
            log.warn("Attempted to send an invalid notification event: {}", event);
            return;
        }

        // Routing key format: tree.<treeId>.<eventType>
        // Example: tree.xyz123.TREE_STRUCTURE_MODIFIED
        String routingKey = String.format("tree.%s.%s", event.getTreeId(), event.getEventType().name());

        try {
            log.info("Attempting to send notification event to RabbitMQ. Exchange: '{}', RoutingKey: '{}', EventId: '{}', TreeId: '{}', EventType: '{}'",
                    exchangeName, routingKey, event.getEventId(), event.getTreeId(), event.getEventType());
            rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
            log.info("Successfully sent notification event to RabbitMQ. Exchange: '{}', RoutingKey: '{}', EventId: '{}'",
                    exchangeName, routingKey, event.getEventId());
            log.debug("Full notification event details: {}", event);
        } catch (Exception e) {
            log.error("Error sending notification event (eventId: {}) to RabbitMQ. Exchange: '{}', RoutingKey: '{}'. Error: {}",
                    event.getEventId(), exchangeName, routingKey, e.getMessage(), e);
            // Depending on requirements, might re-throw or handle (e.g., dead-letter queue)
        }
    }
}
