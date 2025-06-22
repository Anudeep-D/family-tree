package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserTreeService;
import dev.anudeep.familytree.utils.Constants;
import dev.anudeep.familytree.utils.DateTimeUtil;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Slf4j
@Tag(name = "Users API", description = "Endpoints for users related")
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserTreeService userTreeService;
    private final CommonUtils commonUtils;
    // If CommonUtils needs UserService (Scenario 1), inject it here and pass to CommonUtils constructor

    public UserController(UserTreeService userTreeService, CommonUtils commonUtils) {
        this.userTreeService = userTreeService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/")
    public List<User> getUsers() { // HttpSession removed
        log.info("UserController: get users");
        commonUtils.accessCheck(null, null); // Perform basic authentication check via commonUtils
        return userTreeService.getUsers();
    }

    @GetMapping("/{treeId}")
    public List<User> getUsersAccessWithTree(@Parameter(description = "elementId of the tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
                                             @PathVariable String treeId) { // HttpSession removed
        log.info("UserController: get users including access");
        try {
            commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        } catch (Exception e) {
            log.error("Don't have access", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access denied – you currently don’t have access to this tree.", e);
        }
        List<User> allUsers = userTreeService.getUsersAccessWithTree(treeId);
        allUsers.forEach((user) -> {
            if(user.getAccess()!=null)
                user.setAccess(Constants.getRoleForRel(user.getAccess()));
        });
        return allUsers;
    }
}