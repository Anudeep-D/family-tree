package dev.anudeep.familytree.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.Nullable; // For @Nullable on exception
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    private final GoogleIdTokenVerifier verifier;
    private final String clientId;
    private final UserRepository userRepository;

    public CustomHandshakeInterceptor(@Value("${google.clientId}") String clientId,
                                      @Lazy UserRepository userRepository) {
        if (clientId == null || clientId.isEmpty()) {
            log.error("Google Client ID is not configured. WebSocket authentication will likely fail during handshake.");
            throw new IllegalStateException("Missing Google Client ID for WebSocket handshake.");
        }
        this.clientId = clientId;
        this.userRepository = userRepository;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();
        log.info("GoogleIdTokenVerifier initialized with clientId: {}", clientId);
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String requestUriString = request.getURI().toString(); // For logging
        try {
            String idTokenString = extractTokenFromRequest(request);

            if (idTokenString == null || idTokenString.isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: No token found in query or headers.", requestUriString);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            GoogleIdToken googleIdToken = verifier.verify(idTokenString);
            if (googleIdToken == null) {
                log.warn("WebSocket handshake DENIED for URI {}: Google ID Token verification failed.", requestUriString);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();

            if (email == null || email.isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: Google ID token is valid but email is missing.", requestUriString);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                log.warn("WebSocket handshake DENIED for URI {}: User with email {} not found in the database.", requestUriString, email);
                response.setStatusCode(HttpStatus.FORBIDDEN);
                return false;
            }

            String userElementId = userOptional.get().getElementId();
            if (userElementId == null || userElementId.isEmpty()) {
                log.error("WebSocket handshake DENIED for URI {}: User found for email {}, but their elementId is missing or empty.", requestUriString, email);
                response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
                return false;
            }

            attributes.put("elementId", userElementId);
            log.info("WebSocket handshake AUTHORIZED for URI {}. User email: {}, internal elementId: {}. Added to attributes.", requestUriString, email, userElementId);
            return true;

        } catch (Exception e) {
            // Log generic exceptions that might occur during the process
            log.error("WebSocket handshake DENIED for URI {}: Error during handshake process: {}", requestUriString, e.getMessage(), e);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            return false;
        }
    }

    private String extractTokenFromRequest(ServerHttpRequest request) {
        List<String> tokenParams = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams().get("token");
        if (tokenParams != null && !tokenParams.isEmpty() && tokenParams.get(0) != null && !tokenParams.get(0).isEmpty()) {
            log.debug("Extracted token from query parameter for URI: {}", request.getURI());
            return tokenParams.get(0);
        }

        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader != null && authHeader.toLowerCase().startsWith("bearer ")) {
                log.debug("Extracted token from Authorization header for URI: {}", request.getURI());
                return authHeader.substring(7);
            }
        }
        log.debug("No token found in query parameters or Authorization header for URI: {}", request.getURI());
        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler
                                       wsHandler, @Nullable Exception exception) {
        if (exception != null) {
            log.error("Exception occurred after WebSocket handshake was initiated for URI {} but before connection was fully established. Exception: {}",
                    request.getURI(), exception.getMessage(), exception);
        } else {
            // If beforeHandshake returned true and exception is null,
            // it implies the handshake proceeded to the WebSocketHandler.
            log.debug("WebSocket handshake processing completed for URI: {}. No exceptions reported to afterHandshake.", request.getURI());
        }
    }
}
