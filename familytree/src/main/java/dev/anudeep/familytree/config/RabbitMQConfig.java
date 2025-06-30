package dev.anudeep.familytree.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name:tree_events_exchange}")
    private String exchangeName;

    @Value("${rabbitmq.queue.name:tree_event_queue}")
    private String queueName;

    @Bean
    public Queue treeEventQueue() {
        // Durable queue
        return new Queue(queueName, true);
    }

    @Bean
    public TopicExchange treeEventsExchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Binding treeEventsBinding(Queue treeEventQueue, TopicExchange treeEventsExchange) {
        // Bind with routing key "tree.#" to catch all messages for trees
        return BindingBuilder.bind(treeEventQueue).to(treeEventsExchange).with("tree.#");
    }

    @Bean
    public Jackson2JsonMessageConverter producerJackson2MessageConverter() {
        // Ensure Java 8 time types are handled correctly if not using default Java 8 date/time module with Jackson
        // For Spring Boot 2.x, Jackson2JsonMessageConverter auto-configures JSR310 module.
        // For Spring Boot 3.x, this is also typically handled.
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(producerJackson2MessageConverter());
        return rabbitTemplate;
    }
}
