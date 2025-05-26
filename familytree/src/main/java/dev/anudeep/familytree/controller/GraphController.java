package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.FlowGraphDTO;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.GraphService;
import dev.anudeep.familytree.service.UserProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;


@Slf4j
@Tag(name = "Graph API", description = "Endpoints for managing family graphs")
@RestController
@RequestMapping("/api/projects/{projectId}/graph")
@CrossOrigin(origins = "*") // Allow frontend requests
public class GraphController {

    private final GraphService graphService;
    private final CommonUtils commonUtils;
    public GraphController(GraphService graphService, CommonUtils commonUtils) {
        this.graphService = graphService;
        this.commonUtils=commonUtils;
    }

    @GetMapping("/")
    @Operation(summary = "Get full graph")
    public FlowGraphDTO getGraph(
            @Parameter(description = "Project Id of a project", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String projectId,
            HttpSession session
    ) {
        commonUtils.accessCheck(session,projectId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        try {
            log.info("GraphController: Fetching the complete graph");
            return graphService.getGraph();
        } catch (Exception e) {
            log.error("Failed to fetch full graph", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error generating graph", e);
        }
    }

    @GetMapping("/{elementId}/family")
    @Operation(summary = "Get Family of a person by elementId")
    public List<Person> getFamily(
            @Parameter(description = "Project Id of a project", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String projectId,
            @Parameter(description = "elementId of the person to retrieve family of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(session,projectId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("GraphController: Fetching immediate family of a person by elementId {}", elementId);
        return graphService.getFamily(elementId);
    }


    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN') or hasRole('VIEWER')")
    @GetMapping("/{elementId}/familytree")
    @Operation(summary = "Get Family tree of a person by elementId")
    public FlowGraphDTO getFamilyTree(
            @Parameter(description = "Project Id of a project", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String projectId,
            @Parameter(description = "ElementId of the person to retrieve family tree of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(session,projectId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("Requesting family tree for Person {}", elementId);
        // ✅ You can now use `role` to allow/disallow operations
        return graphService.getFamilyTree(elementId);
    }
}
