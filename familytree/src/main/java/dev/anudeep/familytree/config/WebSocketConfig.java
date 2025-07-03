package dev.anudeep.familytree.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.authority.AuthorityUtils; // Added
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken; // Added


import java.security.Principal;
import java.util.Map;
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final CustomHandshakeInterceptor customHandshakeInterceptor;
    // private final StompPrincipalPopulatingChannelInterceptor stompPrincipalPopulatingChannelInterceptor; // Commented out

    @Autowired
    public WebSocketConfig(CustomHandshakeInterceptor customHandshakeInterceptor) { // Removed StompPrincipalPopulatingChannelInterceptor from constructor
        this.customHandshakeInterceptor = customHandshakeInterceptor;
        // this.stompPrincipalPopulatingChannelInterceptor = stompPrincipalPopulatingChannelInterceptor; // Commented out
    }

    @Value("${spring.rabbitmq.host}")
    private String rabbitmqHost;

    @Value("${spring.rabbitmq.username}")
    private String rabbitmqUser;

    @Value("${spring.rabbitmq.password}")
    private String rabbitmqPassword;

    @Value("${spring.rabbitmq.stomp-port:61613}")
    private int rabbitmqStompPort;

    @Bean
    public ThreadPoolTaskScheduler sockJsTaskScheduler(){
        ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();
        threadPoolTaskScheduler.setPoolSize(Runtime.getRuntime().availableProcessors());
        threadPoolTaskScheduler.setThreadNamePrefix("sockjs-scheduler-");
        threadPoolTaskScheduler.initialize();
        return threadPoolTaskScheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(rabbitmqHost)
                .setRelayPort(rabbitmqStompPort)
                .setClientLogin(rabbitmqUser)
                .setClientPasscode(rabbitmqPassword)
                .setSystemLogin(rabbitmqUser)
                .setSystemPasscode(rabbitmqPassword);

        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws")
                .addInterceptors(customHandshakeInterceptor)
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        String elementId = (String) attributes.get("elementId");
                        log.info("DefaultHandshakeHandler: determineUser called. Attributes: {}", attributes);
                        if (elementId == null) {
                            log.warn("DefaultHandshakeHandler: 'elementId' is null in WebSocket attributes after handshake. Cannot create authenticated Principal. Request URI: {}", request.getURI());
                            // Returning null might lead to an anonymous user or connection rejection depending on further config.
                            // For user-specific messaging, a non-null Principal with a name is essential.
                            return null;
                        }

                        // Create a PreAuthenticatedAuthenticationToken. This token's getName() will return the first argument (elementId).
                        // This Principal will be associated with the WebSocket session and used for STOMP user destination resolution.
                        PreAuthenticatedAuthenticationToken authToken = new PreAuthenticatedAuthenticationToken(
                                elementId, null, AuthorityUtils.createAuthorityList("ROLE_USER")); // Credentials can be null
                        log.info("DefaultHandshakeHandler: Successfully created PreAuthenticatedAuthenticationToken for user principal name: '{}'. Request URI: {}", authToken.getName(), request.getURI());
                        return authToken;
                    }
                })
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setTaskScheduler(sockJsTaskScheduler());
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // registration.interceptors(stompPrincipalPopulatingChannelInterceptor); // Commented out
    }
}