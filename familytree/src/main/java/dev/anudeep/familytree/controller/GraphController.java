package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.dto.FlowGraphDTO;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Graph API", description = "Endpoints for managing family graphs")
@RestController
@RequestMapping("/api/graph")
@CrossOrigin(origins = "*") // Allow frontend requests
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/{elementId}/family")
    @Operation(summary = "Get Family of a person by elementId")
    public List<Person> getFamily(
            @Parameter(description = "elementId of the person to retrieve family of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        log.info("GraphController: Fetching immediate family of a person by elementId {}", elementId);
        return graphService.getFamily(elementId);
    }

    @GetMapping("/{elementId}/familytree")
    @Operation(summary = "Get Family tree of a person by elementId")
    public FlowGraphDTO getFamilyTree(
            @Parameter(description = "ElementId of the person to retrieve family tree of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        log.info("GraphController: Fetching family tree of a person by elementId {}", elementId);
        return graphService.getFamilyTree(elementId);
    }
}
