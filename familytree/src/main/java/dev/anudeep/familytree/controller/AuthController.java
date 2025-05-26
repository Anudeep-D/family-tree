package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.dto.TokenRequest;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Slf4j
@Tag(name = "Auth API", description = "Endpoints for authentication related")
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend requests
public class AuthController {

    private final UserService userService;
    public AuthController(UserService userService){
        this.userService= userService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody TokenRequest tokenRequest,
                                                    HttpServletRequest request) throws GeneralSecurityException, IOException {
        User user = userService.processGoogleToken(tokenRequest.getToken());
        log.info("User Processed");
        // 💡 Invalidate old session and create a new one
        // request.getSession().invalidate(); // destroys current session
        // log.info("Session invalidated");
        HttpSession newSession = request.getSession(true); // creates new session
        log.info("Created session ID: {}", newSession.getId());
        newSession.setAttribute("user", user.getElementId());   // store user in session
        log.info("Created session ID: {}", newSession.getAttribute("user"));
        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession().invalidate(); // kills session on logout
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSessionUser(HttpSession session) {
        String userId = (String) session.getAttribute("user");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired");
        }
        return ResponseEntity.ok(userId);
    }

}
