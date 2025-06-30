package dev.anudeep.familytree.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        // Extract your idToken from headers (or cookies, etc.)
        List<String> tokenHeaders = request.getHeaders().get("Authorization");

        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
            String idToken = tokenHeaders.get(0).replace("Bearer ", "");

            // TODO: Verify and decode your token, e.g. using Google API or JWT parser
            // Extract user elementId from the token
            String elementId = extractElementIdFromToken(idToken);

            attributes.put("elementId", elementId);
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }

    private String extractElementIdFromToken(String token) {
        // Implement your logic here
        return "4:abc:12"; // Example
    }
}
