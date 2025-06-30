package dev.anudeep.familytree.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private CustomHandshakeInterceptor customHandshakeInterceptor;

    @Value("${spring.rabbitmq.host}")
    private String rabbitmqHost;

    @Value("${spring.rabbitmq.username}")
    private String rabbitmqUser;

    @Value("${spring.rabbitmq.password}")
    private String rabbitmqPassword;

    // RabbitMQ STOMP port is typically 61613 if rabbitmq-stomp plugin is enabled.
    // Or 15674 for Web STOMP (requires enabling rabbitmq_web_stomp plugin)
    // For simplicity, if we use the default Spring in-memory broker or simple broker
    // and then bridge RabbitMQ events to WebSockets, direct STOMP relay might not be immediately needed
    // for version 1, but it's good for future scaling.
    // Let's assume for now we will use the default STOMP port for RabbitMQ if we enable the STOMP plugin.
    // The management plugin (port 15672) does not handle STOMP by default.
    // We'll need to ensure the rabbitmq:3-management image has STOMP enabled or use a different approach.
    // For now, setting a placeholder port. This will need verification.
    // Default RabbitMQ STOMP port is 61613.
    @Value("${spring.rabbitmq.stomp-port:61613}")
    private int rabbitmqStompPort;


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Configure STOMP broker relay to use RabbitMQ
        // "/topic" for broadcast messages (e.g., tree-wide updates if not user-specific)
        // "/queue" for point-to-point messages (often used for user-specific messages)
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(rabbitmqHost)
                .setRelayPort(rabbitmqStompPort) // Default STOMP port for RabbitMQ
                .setClientLogin(rabbitmqUser)
                .setClientPasscode(rabbitmqPassword)
                .setSystemLogin(rabbitmqUser)      // For the system's connection to RabbitMQ
                .setSystemPasscode(rabbitmqPassword);

        // Application-level messages (e.g., messages sent from client to server)
        // will be prefixed with /app
        registry.setApplicationDestinationPrefixes("/app");

        // Configure user-specific destinations. Spring will automatically
        // create and manage these destinations (e.g., /user/queue/notifications)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(customHandshakeInterceptor)
               .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        String elementId = (String) attributes.get("elementId");
                        return () -> elementId; // Set Principal name = elementId
                    }
                })
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
