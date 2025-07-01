package dev.anudeep.familytree.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    private final GoogleIdTokenVerifier verifier;
    private final String clientId;

    public CustomHandshakeInterceptor(@Value("${google.clientId}") String clientId) {
        if (clientId == null || clientId.isEmpty()) {
            log.error("Google Client ID is not configured. WebSocket authentication will fail.");
            throw new IllegalStateException("Missing Google Client ID for WebSocket handshake.");
        }

        this.clientId = clientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance()) // ✅ Use GsonFactory here
                .setAudience(Collections.singletonList(clientId))
                .build();

        log.info("GoogleIdTokenVerifier initialized with clientId: {}", clientId);
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            String idTokenString = extractTokenFromRequest(request);

            if (idTokenString == null || idTokenString.isEmpty()) {
                log.warn("No token found in query or headers for WebSocket handshake.");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            GoogleIdToken googleIdToken = verifier.verify(idTokenString);
            if (googleIdToken == null) {
                log.warn("Google ID Token verification failed.");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String userId = payload.getSubject(); // sub claim
            String email = payload.getEmail();

            if (userId == null || userId.isEmpty()) {
                log.warn("Google ID token is valid but user ID is missing. Denying handshake.");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            String identifier = (email != null && !email.isEmpty()) ? email : userId;
            attributes.put("elementId", identifier);
            log.info("WebSocket handshake authorized for user: {}", identifier);

            return true;

        } catch (Exception e) {
            log.error("Error during WebSocket handshake: {}", e.getMessage(), e);
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    private String extractTokenFromRequest(ServerHttpRequest request) {
        // Try query param: ?token=...
        List<String> tokenParams = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams().get("token");

        if (tokenParams != null && !tokenParams.isEmpty()) {
            return tokenParams.get(0);
        }

        // Try Authorization header: Authorization: Bearer <token>
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("Exception after WebSocket handshake: {}", exception.getMessage(), exception);
        }
    }
}
