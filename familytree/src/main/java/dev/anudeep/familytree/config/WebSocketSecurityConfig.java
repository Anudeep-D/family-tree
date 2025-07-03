package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.context.AuthenticationPrincipalArgumentResolver;

import java.util.List;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new AuthenticationPrincipalArgumentResolver());
    }

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        // Define authorization rules.
        // CSRF protection is enabled by default by @EnableWebSocketSecurity.
        // We are relying on it to use the CookieCsrfTokenRepository configured in SecurityConfig.
        messages
                .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.HEARTBEAT).permitAll()
                .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE).authenticated()
                .simpTypeMatchers(SimpMessageType.UNSUBSCRIBE, SimpMessageType.DISCONNECT).authenticated()
                .simpDestMatchers("/app/**").authenticated()
                .simpSubscribeDestMatchers("/user/**", "/topic/**").authenticated()
                .anyMessage().authenticated();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // Align with .setAllowedOriginPatterns("*") in WebSocketConfig
        return true;
    }
}