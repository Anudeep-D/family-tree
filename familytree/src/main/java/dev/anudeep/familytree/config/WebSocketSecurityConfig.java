package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // All STOMP messages (CONNECT, SUBSCRIBE, UNSUBSCRIBE, MESSAGE, SEND)
                // require the user to be authenticated.
                // The CONNECT message is implicitly handled by Spring Security if a token is present
                // and validated by an authentication provider or through the handshake interceptor setting a Principal.
                // Deny all messages by default if not explicitly permitted below.
                .nullDestMatcher().authenticated() // Require authentication for messages with no destination (e.g. certain heartbeats or system messages)
                // Users must be authenticated to subscribe to any destination under /user/queue/ or /topic/
                // (e.g., /user/queue/notifications, /topic/global-events)
                .simpSubscribeDestMatchers("/user/queue/**", "/topic/**").authenticated()
                // Users must be authenticated to send messages to application destinations (e.g., /app/**)
                .simpDestMatchers("/app/**").authenticated()
                // Any other message type (e.g. UNSUBSCRIBE, MESSAGE to broker) requires authentication.
                // Specific rules for MESSAGE to broker destinations (like /queue/, /topic/) are usually covered by enableStompBrokerRelay security.
                .anyMessage().authenticated();

        // Note: For STOMP CONNECT, authentication is typically handled by ensuring the WebSocket handshake
        // results in an authenticated Principal (e.g., via CustomHandshakeInterceptor and Spring Security context).
        // If the Principal is present by the time STOMP layer is reached, CONNECT is often allowed.
        // If more fine-grained control over CONNECT is needed, specific interceptors for STOMP CONNECT
        // frames might be required, or by ensuring that unauthenticated users cannot even complete the HTTP handshake.
        // The `CustomHandshakeInterceptor` returning false for unauthenticated users already prevents connection.
    }

    /**
     * Disables CSRF protection for WebSockets.
     * If your main security config already disables CSRF globally (as it does in this project),
     * this might be redundant but ensures it's explicitly off for WebSockets.
     * @return false to disable CSRF for WebSocket messages.
     */
    @Override
    protected boolean sameOriginDisabled() {
        // CSRF is already disabled globally in SecurityConfig.
        // Returning true here means "disable same origin check for WebSockets", effectively disabling CSRF for them.
        return true;
    }
}
