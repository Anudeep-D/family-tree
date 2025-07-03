// WebSocketSecurityConfig.java
package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
// Import for new approach:
import org.springframework.security.messaging.context.AuthenticationPrincipalArgumentResolver;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer; // For adding argument resolvers
import java.util.List; // For List


@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer { // Implements WebSocketMessageBrokerConfigurer

    // This method is from WebSocketMessageBrokerConfigurer
    // It ensures that @AuthenticationPrincipal works correctly in @MessageMapping methods
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new AuthenticationPrincipalArgumentResolver());
    }

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        MessageMatcherDelegatingAuthorizationManager.Builder messages =
                MessageMatcherDelegatingAuthorizationManager.builder();

        messages
                // Explicitly permit CONNECT and HEARTBEAT, hoping CSRF interceptor respects this.
                .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.HEARTBEAT).permitAll()
                // All other STOMP messages require an authenticated user.
                .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE).authenticated()
                .simpTypeMatchers(SimpMessageType.UNSUBSCRIBE, SimpMessageType.DISCONNECT).authenticated()
                // Deny any other message types or destinations not explicitly configured.
                .anyMessage().denyAll();

        return messages.build();
    }
}