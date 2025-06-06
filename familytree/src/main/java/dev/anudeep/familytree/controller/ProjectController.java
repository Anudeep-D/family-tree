package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.PersonService;
import dev.anudeep.familytree.service.UserProjectService;
import dev.anudeep.familytree.utils.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Projects API", description = "Endpoints for projects related")
@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*") // Allow frontend requests
public class ProjectController {
    private final UserProjectService userProjectService;
    private final CommonUtils commonUtils;
    public ProjectController(UserProjectService userProjectService, CommonUtils commonUtils) {
        this.userProjectService = userProjectService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/")
    public List<Project> getProjects(HttpSession session) {
        log.info("ProjectController: get projects");
        commonUtils.accessCheck(session,null,null);
        log.info("ProjectController: access check passed");
        User user = (User) session.getAttribute("user");
        return userProjectService.getAllProjectsForUser(user.getElementId());
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public Project createProject(
            @RequestBody Project project,
            HttpSession session) {
        User user = (User) session.getAttribute("user");
        if(project.getCreatedBy()==null){
            project.setCreatedBy(user);
        }
        log.info("ProjectController: Creating project {}", project);
        Project newProject = userProjectService.createProject(project);
        userProjectService.createRelationship(user.getElementId(),newProject.getElementId(), Constants.ADMIN_REL);
        return newProject;
    }
}
