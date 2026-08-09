package dev.anudeep.familytree.service;

import dev.anudeep.familytree.domain.model.AuthenticatedUserClaims;
import dev.anudeep.familytree.domain.port.out.AuthProviderPort;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthProviderPort authProviderPort;

    public UserService(UserRepository userRepository, AuthProviderPort authProviderPort) {
        this.userRepository = userRepository;
        this.authProviderPort = authProviderPort;
    }

    /**
     * Processes an incoming authentication ID token using the active AuthProviderPort adapter
     * (Firebase or Google) and registers or fetches the user in Neo4j.
     *
     * @param token Raw ID token from frontend
     * @return User domain entity
     */
    public User processToken(String token) {
        log.info("Processing auth token via active provider: {}", authProviderPort.getProviderName());
        AuthenticatedUserClaims claims = authProviderPort.verifyToken(token);
        
        String email = claims.getEmail();
        String name = claims.getName() != null ? claims.getName() : email;
        String picture = claims.getPicture();

        log.info("Verified user claims for email: {}, provider: {}", email, claims.getProvider());

        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(new User(email, name, picture)));
    }

    /**
     * Backward-compatible alias for processToken.
     */
    public User processGoogleToken(String token) {
        return processToken(token);
    }
}
