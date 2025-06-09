package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.RoleAssignmentRequest;
import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserProjectService;
import dev.anudeep.familytree.utils.Constants;
import dev.anudeep.familytree.utils.DateTimeUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@Tag(name = "Projects API", description = "Endpoints for projects related")
@RestController
@RequestMapping("/api/projects") // Assuming you changed this from "/projects"
@CrossOrigin(origins = "*")
public class ProjectController {
    private final UserProjectService userProjectService;
    private final CommonUtils commonUtils;
    // If CommonUtils needs UserService (Scenario 1), inject it here and pass to CommonUtils constructor

    public ProjectController(UserProjectService userProjectService, CommonUtils commonUtils) {
        this.userProjectService = userProjectService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/")
    public List<Project> getProjects() { // HttpSession removed
        log.info("ProjectController: get projects");
        commonUtils.accessCheck(null, null); // Perform basic authentication check via commonUtils

        User currentUser = commonUtils.getCurrentAuthenticatedUser(); // Get the authenticated user

        log.info("ProjectController: access check passed for user: {}", currentUser.getEmail());
        return userProjectService.getAllProjectsForUser(currentUser.getElementId());
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new project")
    public ResponseEntity<?> createProject(@RequestBody Project project) { // HttpSession removed
        User currentUser = commonUtils.getCurrentAuthenticatedUser(); // Get the authenticated user
        // commonUtils.accessCheck(null, new Role[]{Role.ADMIN, Role.EDITOR}); // Example: if creating projects needs a general role

        if (project.getCreatedBy() == null) {
            project.setCreatedBy(currentUser.getElementId());
        }
        log.info("ProjectController: User {} is creating project {}", currentUser.getEmail(), project);
        userProjectService.createProject(project);
        Project newProject = userProjectService.getProjectByDetails(project.getName(), DateTimeUtil.toIsoUtcString(project.getCreatedAt()),currentUser.getElementId());
        log.info("ProjectController: created project {}",newProject);
        log.info("ProjectController: creating {} relation between userId {} and projectId {}",Constants.ADMIN_REL, currentUser.getElementId(), newProject.getElementId());
        userProjectService.createRelationship(currentUser.getElementId(), newProject.getElementId(), Constants.ADMIN_REL);
        log.info("ProjectController: relation created");
        return ResponseEntity.ok().body(newProject);
    }

    @PostMapping("/{elementId}/addusers")
    @Operation(summary = "Add users to project")
    public ResponseEntity<?> addUsersToProject(@Parameter(description = "elementId of the project", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
                                         @PathVariable String elementId, @RequestBody List<RoleAssignmentRequest> users) { // HttpSession removed
        commonUtils.accessCheck(elementId, new Role[]{Role.ADMIN}); // Example: if creating projects needs a general role
        log.info("ProjectController: Users count {} adding to project {}", users.size(), elementId);
        users.forEach((user) -> {
            userProjectService.createRelationship(user.getElementId(), elementId, Constants.getRelForRole(user.getRole()));
        });
        return ResponseEntity.ok().body("success");
    }
}