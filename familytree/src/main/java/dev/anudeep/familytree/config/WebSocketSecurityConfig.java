package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager.Builder;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        Builder messages = MessageMatcherDelegatingAuthorizationManager.builder();

        // Require authentication for STOMP CONNECT
        messages
                .simpTypeMatchers(SimpMessageType.CONNECT).authenticated()

                // Require authentication for /user/queue/** and /topic/**
                .simpSubscribeDestMatchers("/user/queue/**", "/topic/**").authenticated()

                // Require authentication for sending messages to /app/**
                .simpDestMatchers("/app/**").authenticated()

                // Require authentication for any other message
                .anyMessage().authenticated();

        return messages.build();
    }
}
