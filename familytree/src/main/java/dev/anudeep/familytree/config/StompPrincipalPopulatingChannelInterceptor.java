package dev.anudeep.familytree.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
// import org.springframework.stereotype.Component; // Commented out
// import org.springframework.core.Ordered; // Commented out
// import org.springframework.core.annotation.Order; // Commented out


import java.security.Principal;

//@Component // Commented out to disable
@Slf4j
// Ensure this interceptor runs before Spring Security's own interceptors
// Spring Security's AuthorizationChannelInterceptor runs at ChannelInterceptor.SECURITY_AUTHORIZATION_ORDER (typically quite late)
// We want to run very early to ensure the SecurityContext is populated.
//@Order(Ordered.HIGHEST_PRECEDENCE + 100) // Commented out
public class StompPrincipalPopulatingChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        SimpMessageType messageType = accessor.getMessageType();

        // We are interested in the CONNECT message to establish authentication for the session.
        if (SimpMessageType.CONNECT.equals(messageType)) {
            Principal userPrincipal = accessor.getUser();

            if (userPrincipal != null && userPrincipal.getName() != null) { // Check name not null
                Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
                if (currentAuth == null || !userPrincipal.getName().equals(currentAuth.getName())) {
                    PreAuthenticatedAuthenticationToken authentication =
                            new PreAuthenticatedAuthenticationToken(userPrincipal, "N/A", // Credentials can be null or "N/A"
                                    AuthorityUtils.createAuthorityList("ROLE_USER"));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("Populated SecurityContext with PreAuthenticatedAuthenticationToken for user: {} upon STOMP CONNECT", userPrincipal.getName());
                } else if (currentAuth != null) { // currentAuth is not null here
                    log.debug("SecurityContext already contains Authentication for user: {}", userPrincipal.getName());
                }
            } else {
                // This case should ideally not happen if CustomHandshakeInterceptor and DefaultHandshakeHandler worked.
                // If userPrincipal is null, it means it wasn't set on the STOMP headers from the WebSocket session.
                log.warn("No Principal (or Principal without a name) found on STOMP CONNECT message via accessor.getUser(). " +
                         "Cannot populate SecurityContext. WebSocket session Principal: {}", accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().get("simpUser") : "N/A");
            }
        }
        // For SUBSCRIBE or MESSAGE types, the SecurityContext should already be populated from CONNECT.
        // If not, the AuthorizationChannelInterceptor would deny them anyway if they require authentication.
        return message;
    }

    // getOrder() method is not needed if using @Order annotation
}