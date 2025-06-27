package dev.anudeep.familytree.controller.common;

import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserTreeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Optional;
import java.util.function.Predicate;

@Slf4j
@Component
public class CommonUtils {
    private final UserTreeService userTreeService;

    // Constructor: Inject UserTreeService (and other services if needed here)
    public CommonUtils(UserTreeService userTreeService) {
        this.userTreeService = userTreeService;
    }

    /**
     * Retrieves the currently authenticated custom User object from Spring Security's context.
     * Throws ResponseStatusException if not authenticated or principal is not the expected User type.
     *
     * @return The authenticated User object.
     */
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if authentication is null, not authenticated, or principal is anonymousUser string
        if (authentication == null || !authentication.isAuthenticated() ||
                (authentication.getPrincipal() instanceof String && "anonymousUser".equals(authentication.getPrincipal()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated or session expired");
        }
        String userId = (String) authentication.getPrincipal();
        Optional<User> user = userTreeService.getUserByElementId(userId);
        return user.orElse(null);
    }

    /**
     * Performs access checks. If treeId and rolesCheck are provided, it verifies tree-specific roles.
     * Relies on getCurrentAuthenticatedUser() to ensure user is authenticated.
     *
     * @param treeId     The ID of the tree to check against (can be null if not a tree-specific check).
     * @param rolesCheck An array of Roles required for the operation (can be null).
     */
    public void accessCheck(String treeId, Role[] rolesCheck) { // HttpSession parameter removed
        User currentUser = getCurrentAuthenticatedUser(); // Get user from SecurityContext
        log.info("accessCheck: currentUser {}, tree {}, roles {}", currentUser, treeId, rolesCheck);
        // You might want to add a check here if currentUser itself is null, though getCurrentAuthenticatedUser should throw first.
        if (currentUser.getElementId() == null) { // Or any other essential check on your User object
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User details are incomplete or invalid");
        }

        // Tree-specific role check
        if (treeId != null && rolesCheck != null && rolesCheck.length > 0) {
            Role treeRole = userTreeService.getRelationshipType(currentUser.getElementId(), treeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "User does not have a defined role for this tree or tree not found."));
            log.info("treeRole: {}", treeRole);
            Predicate<Role> isRoleMatch = requiredRole -> requiredRole == treeRole;
            if (Arrays.stream(rolesCheck).noneMatch(isRoleMatch)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User does not have the required permission ('" + treeRole + "') for this action on the tree. Required one of: " + Arrays.toString(rolesCheck));
            }
        }
    }
}