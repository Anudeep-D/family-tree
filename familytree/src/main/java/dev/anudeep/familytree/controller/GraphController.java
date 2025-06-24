package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.FlowGraphDTO;
import dev.anudeep.familytree.dto.GraphDiffDTO;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Slf4j
@Tag(name = "Graph API", description = "Endpoints for managing family graphs")
@RestController
@RequestMapping("/api/trees/{treeId}/graph")
@CrossOrigin(origins = "*") // Allow frontend requests
public class GraphController {

    private final GraphService graphService;
    private final CommonUtils commonUtils;
    public GraphController(GraphService graphService, CommonUtils commonUtils) {
        this.graphService = graphService;
        this.commonUtils=commonUtils;
    }

    @GetMapping
    @Operation(summary = "Get full graph")
    public FlowGraphDTO getGraph(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            HttpSession session
    ) {
        log.info("GraphController: entered complete graph mode");
        try {
            commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
            log.info("GraphController: Fetching the complete graph");
            return graphService.getGraph(treeId);
        } catch (Exception e) {
            log.error("Failed to fetch full graph", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error generating graph", e);
        }
    }

    @GetMapping("/{elementId}/family")
    @Operation(summary = "Get Family of a person by elementId")
    public List<Person> getFamily(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve family of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("GraphController: Fetching immediate family of a person by elementId {}", elementId);
        return graphService.getFamily(elementId);
    }


    @PreAuthorize("hasRole('EDITOR') or hasRole('ADMIN') or hasRole('VIEWER')")
    @GetMapping("/{elementId}/familytree")
    @Operation(summary = "Get Family tree of a person by elementId")
    public FlowGraphDTO getFamilyTree(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "ElementId of the person to retrieve family tree of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("Requesting family tree for Person {}", elementId);
        // ✅ You can now use `role` to allow/disallow operations
        return graphService.getFamilyTree(elementId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')") // Ensure roles are checked correctly based on SecurityConfig
    @Operation(summary = "Update graph", description = "Applies changes (add, update, delete) to the graph for a given tree.")
    public ResponseEntity<Void> updateGraph(
            @Parameter(description = "Tree Id of a tree", required = true) @PathVariable String treeId,
            @RequestBody GraphDiffDTO diff,
            HttpSession session) { // HttpSession might still be needed if commonUtils.accessCheck uses it implicitly,
        // or if you plan to use session attributes directly.
        // If accessCheck is purely based on Spring Security context, session might be omitted.

        // Perform access check using commonUtils, ensuring user has EDITOR or ADMIN role for this treeId.
        // The PreAuthorize annotation provides method-level security,
        // but commonUtils.accessCheck might perform more granular checks (e.g., specific tree ownership or shared access)
        // It's good practice to keep it if it adds value beyond role checking.
        // Ensure Role.EDITOR and Role.ADMIN are correctly referenced.
        commonUtils.accessCheck(treeId, new Role[]{Role.EDITOR, Role.ADMIN});

        log.info("GraphController: Received request to update graph for treeId: {}", treeId);
        try {
            graphService.updateGraph(treeId, diff);
            log.info("GraphController: Graph update successful for treeId: {}", treeId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("GraphController: Invalid arguments for graph update for treeId {}: {}", treeId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            log.error("GraphController: Failed to update graph for treeId {}: {}", treeId, e.getMessage(), e); // Log full stack trace
            // Consider a more specific exception if possible, or a generic internal server error.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating graph: "+e.getMessage(), e);
        }
    }
}
