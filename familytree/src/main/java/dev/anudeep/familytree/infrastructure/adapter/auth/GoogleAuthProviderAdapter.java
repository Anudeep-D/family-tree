package dev.anudeep.familytree.infrastructure.adapter.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import dev.anudeep.familytree.domain.model.AuthenticatedUserClaims;
import dev.anudeep.familytree.domain.port.out.AuthProviderPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j
@Component("googleAuthProvider")
public class GoogleAuthProviderAdapter implements AuthProviderPort {

    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthProviderAdapter(@Value("${google.clientId:}") String clientId) {
        try {
            if (clientId == null || clientId.trim().isEmpty()) {
                log.warn("Google Client ID is not configured. GoogleAuthProviderAdapter may fail token verification.");
            }
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(clientId)).build();
            log.info("GoogleAuthProviderAdapter initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize GoogleAuthProviderAdapter: {}", e.getMessage(), e);
            throw new IllegalStateException("Could not initialize Google ID Token Verifier", e);
        }
    }

    @Override
    public AuthenticatedUserClaims verifyToken(String idToken) {
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                log.warn("Google ID Token verification returned null.");
                throw new IllegalArgumentException("Invalid Google ID token");
            }
            GoogleIdToken.Payload payload = token.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String uid = payload.getSubject();

            log.info("Successfully verified Google ID token for email: {}", email);

            return AuthenticatedUserClaims.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .uid(uid)
                    .provider(getProviderName())
                    .build();
        } catch (Exception e) {
            log.error("Failed to verify Google ID token: {}", e.getMessage());
            throw new RuntimeException("Google token verification failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "GOOGLE";
    }
}
