package dev.anudeep.familytree.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;
// Assuming you have a service for token validation, e.g., JwtService or GoogleTokenVerifier
// import dev.anudeep.familytree.service.auth.TokenValidationService; // Example

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    // Example: Inject a service to validate tokens and extract user info
    // @Autowired
    // private TokenValidationService tokenValidationService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String idToken = null;
        try {
            // 1. Try to get token from query parameter "token"
            List<String> tokenParams = UriComponentsBuilder.fromHttpRequest(request)
                    .build().getQueryParams().get("token");
            if (tokenParams != null && !tokenParams.isEmpty() && tokenParams.get(0) != null && !tokenParams.get(0).isEmpty()) {
                idToken = tokenParams.get(0);
                log.debug("Extracted token from 'token' query parameter for WebSocket handshake.");
            }

            // 2. If not found in query param, try 'Authorization' header (less likely for SockJS initial handshake)
            if (idToken == null) {
                List<String> tokenHeaders = request.getHeaders().get("Authorization");
                if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                    String authHeader = tokenHeaders.get(0);
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        idToken = authHeader.substring(7); // Remove "Bearer " prefix
                        log.debug("Extracted token from 'Authorization' header for WebSocket handshake.");
                    } else {
                        log.warn("Authorization header found, but not in 'Bearer <token>' format.");
                    }
                }
            }

            if (idToken != null && !idToken.isEmpty()) {
                log.debug("Attempting to validate token for WebSocket handshake. Token: {}", idToken);

                // --- THIS IS THE CRITICAL SECTION THAT NEEDS PROPER IMPLEMENTATION ---
                // TODO: Replace this with actual, secure token validation and user ID extraction.
                // This could involve:
                // 1. Verifying the token's signature (e.g., using a JWT library and public keys).
                // 2. Checking token expiration, issuer, audience.
                // 3. Extracting the user identifier (elementId) from the token claims.
                //
                // Example using a hypothetical TokenValidationService:
                // if (tokenValidationService.isValid(idToken)) {
                //     String elementId = tokenValidationService.extractUserId(idToken);
                //     if (elementId != null && !elementId.isEmpty()) {
                //         attributes.put("elementId", elementId);
                //         log.info("Successfully set elementId '{}' for WebSocket session.", elementId);
                //         return true; // Allow handshake
                //     } else {
                //         log.warn("elementId could not be extracted from valid token.");
                //     }
                // } else {
                //     log.warn("Invalid token provided for WebSocket handshake.");
                // }

                // Placeholder logic (REMOVE FOR PRODUCTION):
                // For demonstration, if token is "dummy-valid-token:user123", extract "user123"
                // if (idToken.startsWith("dummy-valid-token:")) {
                //     String elementId = idToken.substring("dummy-valid-token:".length());
                //     if (!elementId.isEmpty()) {
                //         attributes.put("elementId", elementId);
                //         log.info("Placeholder: Successfully set elementId '{}' for WebSocket session from dummy token.", elementId);
                //         return true; // Allow handshake
                //     } else {
                //         log.warn("Placeholder: Extracted empty elementId from dummy token.");
                //     }
                // } else {
                //      log.warn("Placeholder: Token does not match dummy format. Full token: {}", idToken);
                // }
                // --- END OF ORIGINAL PLACEHOLDER ---

                // --- REINSTATED PLACEHOLDER (NON-PRODUCTION) ---
                // This section provides a basic way to test connectivity if you send a token prefixed with "dummy-valid-token:".
                // It is NOT secure and does NOT validate real tokens (e.g., Google JWTs).
                //
                // TODO: CRITICAL - REPLACE THIS ENTIRE 'if (idToken != null ...)' BLOCK with robust,
                //  secure validation of the actual ID token (e.g., Google ID Token).
                //  This includes:
                //      1. Verifying the token's signature against Google's public keys.
                //      2. Checking the token's issuer ('iss') and audience ('aud' - should be your Google Client ID).
                //      3. Verifying the token is not expired ('exp').
                //      4. Extracting a stable user identifier (e.g., 'sub' or 'email') from the token's claims
                //         to use as 'elementId'. This 'elementId' will be the Principal name for the WebSocket session.
                //  Consider creating a dedicated TokenValidationService for this logic.

                if (idToken.startsWith("dummy-valid-token:")) {
                    String extractedElementId = idToken.substring("dummy-valid-token:".length());
                    if (!extractedElementId.isEmpty()) {
                        attributes.put("elementId", extractedElementId);
                        log.info("Placeholder: Successfully set elementId '{}' for WebSocket session using DUMMY token.", extractedElementId);
                        return true; // Allow handshake with dummy token
                    } else {
                        log.warn("Placeholder: Extracted empty elementId from DUMMY token. Denying handshake.");
                    }
                } else {
                    // If a real token is received, it will be logged here but will fail validation by this placeholder.
                    log.warn("Placeholder: Received a token that does not match the 'dummy-valid-token:' format. " +
                            "Handshake will be denied by this placeholder logic. Implement proper token validation. " +
                            "Token snippet: {}", idToken.substring(0, Math.min(idToken.length(), 60)));
                }
                // --- END OF REINSTATED PLACEHOLDER ---

            } else {
                log.warn("No token found in query parameter or Authorization header for WebSocket handshake.");
            }
        } catch (Exception e) {
            log.error("Error during WebSocket handshake interception: {}", e.getMessage(), e);
            // Fall through to return false by default if an error occurs or no valid token found
        }

        log.warn("WebSocket handshake denied due to missing or invalid token.");
        // If elementId is not set, the DefaultHandshakeHandler in WebSocketConfig
        // might fail or set a null principal. Denying handshake here is safer.
        return false; // Deny handshake if token is invalid or not present
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
