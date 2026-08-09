package dev.anudeep.familytree.config;

import dev.anudeep.familytree.domain.model.AuthenticatedUserClaims;
import dev.anudeep.familytree.domain.port.out.AuthProviderPort;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    private final AuthProviderPort authProviderPort;
    private final UserRepository userRepository;

    public CustomHandshakeInterceptor(AuthProviderPort authProviderPort,
                                       @Lazy UserRepository userRepository) {
        this.authProviderPort = authProviderPort;
        this.userRepository = userRepository;
        log.info("CustomHandshakeInterceptor initialized with AuthProviderPort: {}", authProviderPort.getProviderName());
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String requestUriString = request.getURI().toString();
        try {
            String idTokenString = extractTokenFromRequest(request);

            if (idTokenString == null || idTokenString.isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: No token found in query or headers.", requestUriString);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            AuthenticatedUserClaims claims = authProviderPort.verifyToken(idTokenString);
            if (claims == null || claims.getEmail() == null || claims.getEmail().isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: Token verification failed or email missing.", requestUriString);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            String email = claims.getEmail();
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: User with email {} not found in the database.", requestUriString, email);
                response.setStatusCode(HttpStatus.FORBIDDEN);
                return false;
            }

            String userElementId = userOptional.get().getElementId();
            if (userElementId == null || userElementId.isEmpty()) {
                log.error("WebSocket handshake DENIED for URI {}: User found for email {}, but their elementId is missing.", requestUriString, email);
                response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
                return false;
            }

            attributes.put("elementId", userElementId);
            log.info("WebSocket handshake AUTHORIZED for URI {}. User email: {}, internal elementId: {}.", requestUriString, email, userElementId);
            return true;

        } catch (Exception e) {
            log.error("WebSocket handshake DENIED for URI {}: Error during handshake process: {}", requestUriString, e.getMessage(), e);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            return false;
        }
    }

    private String extractTokenFromRequest(ServerHttpRequest request) {
        List<String> tokenParams = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams().get("token");
        if (tokenParams != null && !tokenParams.isEmpty() && tokenParams.get(0) != null && !tokenParams.get(0).isEmpty()) {
            return tokenParams.get(0);
        }

        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader != null && authHeader.toLowerCase().startsWith("bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, @Nullable Exception exception) {
        if (exception != null) {
            log.error("Exception occurred after WebSocket handshake was initiated for URI {}: {}", request.getURI(), exception.getMessage(), exception);
        }
    }
}
