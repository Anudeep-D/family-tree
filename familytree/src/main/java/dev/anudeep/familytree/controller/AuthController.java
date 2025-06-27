package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.TokenRequest;
import dev.anudeep.familytree.dto.UserSessionDetailsDTO;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Slf4j
@Tag(name = "Auth API", description = "Endpoints for authentication related")
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final CommonUtils commonUtils;

    public AuthController(UserService userService, CommonUtils commonUtils) {
        this.userService = userService;
        this.commonUtils = commonUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody TokenRequest tokenRequest,
                                                    HttpServletRequest request) throws GeneralSecurityException, IOException {
        User user = userService.processGoogleToken(tokenRequest.getToken()); // Your custom User object
        log.info("User Processed: {}", user.getEmail());

        // Create an Authentication object for Spring Security
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getElementId(), // Principal: user's email or unique ID
                null,            // Credentials: null as token is already verified
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) // Authorities/Roles
        );

        // Set the Authentication in the SecurityContext
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Invalidate old session and create a new one
        request.getSession().invalidate();
        HttpSession newSession = request.getSession(true);

        // Store the SecurityContext in the new session for Spring Security to find
        newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
        newSession.setAttribute("idToken", tokenRequest.getToken());
        log.info("Stored idToken in session: {}", tokenRequest.getToken());

        // Optionally, store your custom user object if needed elsewhere
        // newSession.setAttribute("user", user);
        // Note: The 'user' object from CommonUtils.accessCheck will now be null unless you also store it here.
        // Or, your CommonUtils.accessCheck should retrieve the principal from the SecurityContext.

        log.info("Created new session ID: {}", newSession.getId());
        log.info("Authenticated user '{}' and set SecurityContext in session.", user.getEmail());

        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession().invalidate(); // kills session on logout
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/session")
    public ResponseEntity<UserSessionDetailsDTO> getSessionUser(HttpSession session) {
        String idToken = (String) session.getAttribute("idToken");
        log.info("Retrieved idToken from session: {}", idToken);
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        if (currentUser == null || currentUser.getElementId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        UserSessionDetailsDTO sessionDetails = new UserSessionDetailsDTO(currentUser, idToken);
        return ResponseEntity.ok(sessionDetails);
    }

}
