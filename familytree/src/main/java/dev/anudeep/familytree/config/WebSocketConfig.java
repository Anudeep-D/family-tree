package dev.anudeep.familytree.config;

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
                        if (elementId == null) {
                            // log.warn("elementId is null in determineUser. Cannot create Authentication token.");
                            return null;
                        }
                        // Create a PreAuthenticatedAuthenticationToken directly.
                        // This Authentication object will be set as the Principal for the WebSocket session.
                        // Spring Security's SecurityContextChannelInterceptor should then pick this up.
                        PreAuthenticatedAuthenticationToken authToken = new PreAuthenticatedAuthenticationToken(
                                elementId, "N/A", AuthorityUtils.createAuthorityList("ROLE_USER"));
                        // log.info("DefaultHandshakeHandler: Determined user and created PreAuthenticatedAuthenticationToken for: {}", elementId);
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