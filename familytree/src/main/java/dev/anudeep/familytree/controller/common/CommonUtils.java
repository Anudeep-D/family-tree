package dev.anudeep.familytree.controller.common;

import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.GraphService;
import dev.anudeep.familytree.service.UserProjectService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.function.Predicate;

@Component
public class CommonUtils {
    private final UserProjectService userProjectService;
    public CommonUtils(UserProjectService userProjectService) {
        this.userProjectService = userProjectService;
    }
    public void accessCheck(HttpSession session, String projectId, Role[] rolesCheck){
        User user = (User) session.getAttribute("user");
        if (user.getElementId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired or not logged in");
        }
        if(projectId!=null && rolesCheck!=null){
            Role role =  userProjectService.getRelationshipType(user.getElementId(), projectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No access to this project"));
            Predicate<Role>  isRole = r -> r==role;
            if(Arrays.stream(rolesCheck).noneMatch(isRole))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this project");
        }
    }
}
