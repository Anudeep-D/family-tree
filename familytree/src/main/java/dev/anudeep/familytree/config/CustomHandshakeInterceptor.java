package dev.anudeep.familytree.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    private final GoogleIdTokenVerifier verifier;

    // It's better to inject this from application.properties
    // @Value("${google.oauth.client-id}")
    // private String googleClientId;
    // For now, using the one from the logs. User should configure this in properties.
    private static final String GOOGLE_CLIENT_ID = "319883510416-0jbnd19i9d55p9ta53i739iet6het482.apps.googleusercontent.com";

    public CustomHandshakeInterceptor(/*@Value("${google.oauth.client-id}") String clientId*/) {
        // String clientIdToUse = (clientId != null && !clientId.isEmpty()) ? clientId : GOOGLE_CLIENT_ID;
        // if (clientIdToUse == null || clientIdToUse.isEmpty()) {
        //     log.error("Google Client ID is not configured. WebSocket authentication will fail.");
        //     // Or throw an exception to prevent startup without proper config
        // }
        // log.info("Initializing GoogleIdTokenVerifier with Client ID: {}", clientIdToUse);
        try {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    // Optionally, specify the issuer: .setIssuer("https://accounts.google.com")
                    .build();
        } catch (Exception e) {
            log.error("Failed to initialize GoogleIdTokenVerifier. WebSocket authentication may fail.", e);
            throw new RuntimeException("Failed to initialize GoogleIdTokenVerifier", e);
        }
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String idTokenString = null;
        try {
            List<String> tokenParams = UriComponentsBuilder.fromHttpRequest(request)
                    .build().getQueryParams().get("token");
            if (tokenParams != null && !tokenParams.isEmpty() && tokenParams.get(0) != null && !tokenParams.get(0).isEmpty()) {
                idTokenString = tokenParams.get(0);
                log.debug("Extracted token from 'token' query parameter for WebSocket handshake.");
            }

            if (idTokenString == null) {
                List<String> tokenHeaders = request.getHeaders().get("Authorization");
                if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                    String authHeader = tokenHeaders.get(0);
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        idTokenString = authHeader.substring(7);
                        log.debug("Extracted token from 'Authorization' header for WebSocket handshake.");
                    } else {
                        log.warn("Authorization header found, but not in 'Bearer <token>' format for WebSocket handshake.");
                    }
                }
            }

            if (idTokenString != null && !idTokenString.isEmpty()) {
                log.debug("Attempting to validate Google ID token for WebSocket handshake. Token snippet: {}",
                        idTokenString.substring(0, Math.min(idTokenString.length(), 60)) + "...");

                GoogleIdToken googleIdToken = null;
                try {
                    googleIdToken = verifier.verify(idTokenString);
                } catch (Exception e) {
                    log.warn("Google ID Token verification failed with exception: {}", e.getMessage());
                    // It's important to log the exception details if it's not just an invalid token
                    // For example, network issues fetching public keys, clock skew, etc.
                    // log.debug("Token verification exception details:", e); // Uncomment for more verbose debugging
                }

                if (googleIdToken != null) {
                    GoogleIdToken.Payload payload = googleIdToken.getPayload();
                    String userId = payload.getSubject(); // 'sub' claim, unique Google user ID
                    String email = payload.getEmail();    // 'email' claim

                    if (userId != null && !userId.isEmpty()) {
                        // The 'elementId' attribute is used by WebSocketConfig's DefaultHandshakeHandler
                        // to determine the Principal for the WebSocket session.
                        // Using email as it's often more human-readable for logs, but 'sub' is more stable.
                        // Ensure this matches what your application expects for user identification.
                        attributes.put("elementId", email != null ? email : userId); // Prefer email if available, else sub
                        log.info("Successfully validated Google ID token for WebSocket. User email: {}, User ID (sub): {}. Setting elementId to: {}",
                                email, userId, attributes.get("elementId"));
                        return true; // Allow handshake
                    } else {
                        log.warn("Google ID Token validated, but user ID (sub) was missing or empty. Denying handshake. Email: {}", email);
                    }
                } else {
                    log.warn("Invalid Google ID Token provided for WebSocket handshake. Token could not be verified.");
                }
            } else {
                log.warn("No token found in query parameter or Authorization header for WebSocket handshake.");
            }
        } catch (Exception e) {
            // Catch broader exceptions during the process, e.g., from UriComponentsBuilder
            log.error("Error during WebSocket handshake interception: {}", e.getMessage(), e);
        }

        log.warn("WebSocket handshake denied.");
        response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED); // Set 401 status
        return false; // Deny handshake
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("Exception after WebSocket handshake: {}", exception.getMessage(), exception);
        }
    }

    // This method is no longer directly called as logic is moved into beforeHandshake
    // private String extractElementIdFromToken(String token) {
    //     // Implement your logic here
    //     // THIS IS A CRITICAL PLACEHOLDER AND MUST BE REPLACED
    //     // For demonstration, if token is "valid-token:user123", extract "user123"
    //     if (token.startsWith("valid-token:")) {
    //         return token.substring("valid-token:".length());
    //     }
    //     log.warn("Token format not recognized for elementId extraction: {}", token);
    //     return null; // Or throw an exception
    // }
}
