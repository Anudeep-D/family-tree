package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserProjectService;
import dev.anudeep.familytree.utils.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Users API", description = "Endpoints for users related")
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserProjectService userProjectService;
    private final CommonUtils commonUtils;
    // If CommonUtils needs UserService (Scenario 1), inject it here and pass to CommonUtils constructor

    public UserController(UserProjectService userProjectService, CommonUtils commonUtils) {
        this.userProjectService = userProjectService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/")
    public List<User> getUsers() { // HttpSession removed
        log.info("UserController: get users");
        commonUtils.accessCheck(null, null); // Perform basic authentication check via commonUtils
        return userProjectService.getUsers();
    }
}