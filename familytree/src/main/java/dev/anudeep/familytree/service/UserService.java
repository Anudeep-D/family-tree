package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final GoogleIdTokenVerifier verifier;

    public UserService(UserRepository userRepository,
                       @Value("${google.clientId}") String clientId) throws Exception {
        this.userRepository = userRepository;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance()
        ).setAudience(Collections.singletonList(clientId)).build();
    }

    public User processGoogleToken(String token) {
        try {
            GoogleIdToken idToken = verifier.verify(token);
            log.info("Token verified");
            if (idToken == null) {
                throw new RuntimeException("Invalid ID token");
            }
            log.info("idToken not null");
            GoogleIdToken.Payload payload = idToken.getPayload();
            log.info("payload :{}", payload);
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            log.info("email :{}", email);
            return userRepository.findByEmail(email)
                    .orElseGet(() -> userRepository.save(new User(email, name, picture)));

        } catch (Exception e) {
            throw new RuntimeException("Failed to verify token: "+e.getMessage(), e);
        }
    }
}
