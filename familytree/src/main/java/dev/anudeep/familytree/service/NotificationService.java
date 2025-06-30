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
            log.info("Sending notification to exchange: {}, routingKey: {}, eventId: {}", exchangeName, routingKey, event.getEventId());
            rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
            log.debug("Notification event sent successfully: {}", event);
        } catch (Exception e) {
            log.error("Error sending notification event (eventId: {}): {}", event.getEventId(), e.getMessage(), e);
            // Depending on requirements, might re-throw or handle (e.g., dead-letter queue)
        }
    }
}
