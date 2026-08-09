package dev.anudeep.familytree.infrastructure.adapter.auth;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import dev.anudeep.familytree.domain.model.AuthenticatedUserClaims;
import dev.anudeep.familytree.domain.port.out.AuthProviderPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Slf4j
@Component("firebaseAuthProvider")
public class FirebaseAuthProviderAdapter implements AuthProviderPort {

    @Value("${firebase.projectId:family-tree-b6210}")
    private String projectId;

    @PostConstruct
    public void init() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setProjectId(projectId)
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("FirebaseApp initialized with project ID: {}", projectId);
            } catch (Exception e) {
                log.error("Error initializing FirebaseApp: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    public AuthenticatedUserClaims verifyToken(String idToken) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            String picture = decodedToken.getPicture();
            String uid = decodedToken.getUid();

            log.info("Successfully verified Firebase ID token for email: {}", email);

            return AuthenticatedUserClaims.builder()
                    .email(email)
                    .name(name != null ? name : email)
                    .picture(picture)
                    .uid(uid)
                    .provider(getProviderName())
                    .build();
        } catch (Exception e) {
            log.error("Failed to verify Firebase ID token: {}", e.getMessage());
            throw new RuntimeException("Firebase token verification failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "FIREBASE";
    }
}
