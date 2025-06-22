package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.RelationChangeSummary;
import dev.anudeep.familytree.dto.RoleAssignmentRequest;
import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.UserTreeService;
import dev.anudeep.familytree.utils.Constants;
import dev.anudeep.familytree.dto.DeleteMultipleTreesRequestDto;
import dev.anudeep.familytree.utils.DateTimeUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Slf4j
@Tag(name = "Trees API", description = "Endpoints for trees related")
@RestController
@RequestMapping("/api/trees") // Assuming you changed this from "/trees"
@CrossOrigin(origins = "*")
public class TreeController {
    private final UserTreeService userTreeService;
    private final CommonUtils commonUtils;
    // If CommonUtils needs UserService (Scenario 1), inject it here and pass to CommonUtils constructor

    public TreeController(UserTreeService userTreeService, CommonUtils commonUtils) {
        this.userTreeService = userTreeService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/{elementId}")
    public ResponseEntity<?> getTree(@Parameter(description = "elementId of the tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
                                     @PathVariable String elementId) { // HttpSession removed
        log.info("TreeController: get tree");
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        try {
            commonUtils.accessCheck(elementId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        } catch (Exception e) {
            log.error("Don't have access", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access denied – you currently don’t have access to this tree.", e);
        }
        try {
            Optional<Tree> tree = userTreeService.getTreeWithAccess(currentUser.getElementId(),elementId);
            if(tree.isPresent()){
                Tree localTree = tree.get();
                localTree.setAccess(Constants.getRoleForRel(localTree.getAccess()));
                return ResponseEntity.ok().body(localTree);
            }
            return ResponseEntity.ok().body(tree.orElseThrow());
        } catch (Exception e) {
            log.error("Failed to fetch tree", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error getting tree", e);
        }
    }

    @GetMapping("/")
    public ResponseEntity<?> getTrees() { // HttpSession removed
        log.info("TreeController: get trees");
        User currentUser = commonUtils.getCurrentAuthenticatedUser(); // Get the authenticated user
        log.info("TreeController: access check passed for user: {}", currentUser.getEmail());
        List<Tree> allTrees = userTreeService.getAllTreesForUser(currentUser.getElementId());
        allTrees.forEach((tree) -> {
            tree.setAccess(Constants.getRoleForRel(tree.getAccess()));
            tree.setCreatedAt(DateTimeUtil.readableDate(tree.getCreatedAt()));
            Optional<User> creator = userTreeService.getUserByElementId(tree.getCreatedBy());
            creator.ifPresent(user -> tree.setCreatedBy(String.format("%s (%s)", user.getName(), user.getEmail())));
            log.info("Tree  {}", tree);
        });
        return ResponseEntity.ok().body(allTrees);
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new tree")
    public ResponseEntity<?> createTree(@RequestBody Tree tree) { // HttpSession removed
        User currentUser = commonUtils.getCurrentAuthenticatedUser(); // Get the authenticated user
        // commonUtils.accessCheck(null, new Role[]{Role.ADMIN, Role.EDITOR}); // Example: if creating trees needs a general role

        if (tree.getCreatedBy() == null) {
            tree.setCreatedBy(currentUser.getElementId());
        }
        log.info("TreeController: User {} is creating tree {}", currentUser.getEmail(), tree);
        userTreeService.createTree(tree);
        Tree newTree = userTreeService.getTreeByDetails(tree.getName(), DateTimeUtil.toIsoUtcString(tree.getCreatedAt()),currentUser.getElementId());
        log.info("TreeController: created tree {}",newTree);
        log.info("TreeController: creating {} relation between userId {} and treeId {}",Constants.ADMIN_REL, currentUser.getElementId(), newTree.getElementId());
        userTreeService.createRelationship(currentUser.getElementId(), newTree.getElementId(), Constants.ADMIN_REL);
        log.info("TreeController: relation created");
        return ResponseEntity.ok().body(newTree);
    }

    @PostMapping("/{elementId}/addusers")
    @Operation(summary = "Add users to tree")
    public ResponseEntity<?> addUsersToTree(@Parameter(description = "elementId of the tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
                                            @PathVariable String elementId, @RequestBody List<RoleAssignmentRequest> users) { // HttpSession removed
        log.info("addusers:tree {}", elementId);
        commonUtils.accessCheck(elementId, new Role[]{Role.ADMIN}); // Example: if creating trees needs a general role
        log.info("TreeController: Users count {} adding to tree {}", users.size(), elementId);
        users.forEach((user) -> {
            userTreeService.createRelationship(user.getElementId(), elementId, Constants.getRelForRole(user.getRole()));
        });
        return ResponseEntity.ok().body("success");
    }

    @PostMapping("/{elementId}/updateusers")
    @Operation(summary = "Update users to tree")
    public ResponseEntity<Map<String,Integer>> updateUsersToTree(@Parameter(description = "elementId of the tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
                                            @PathVariable String elementId, @RequestBody List<RoleAssignmentRequest> users) { // HttpSession removed
        log.info("updateusers:tree {}", elementId);
        try {
            commonUtils.accessCheck(elementId, new Role[]{Role.ADMIN}); // Example: if creating trees needs a general role
        } catch (Exception e) {
            log.error("Don't have access", e);  // log stack trace
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access denied – you currently don’t have access to this tree.", e);
        }
        users.forEach((user) -> {
            user.setRelation(Constants.getRelForRole(user.getRole()));
        });
        log.info("TreeController: Users count {} updating to tree {}", users.size(), elementId);
        try {
            RelationChangeSummary summary = userTreeService.updateUsersRelationShip(elementId, users);
            Map<String,Integer> counts = new HashMap<>();
            counts.putIfAbsent("updated", summary.getUpdatedCount());
            counts.putIfAbsent("removed", summary.getPermanentlyDeletedCount());
            counts.putIfAbsent("created", summary.getNewlyCreatedCount());
            return ResponseEntity.ok().body(counts);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating user access: "+e.getMessage(), e);
        }
    }

    @DeleteMapping("/{elementId}")
    @Operation(summary = "Delete a single tree by its elementId")
    public ResponseEntity<Void> deleteTree(
            @Parameter(description = "elementId of the tree to delete", required = true)
            @PathVariable String elementId) {
        log.info("TreeController: Request to delete tree with elementId: {}", elementId);
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        // commonUtils.accessCheck(elementId, new Role[]{Role.ADMIN}); // Service layer will do the definitive ownership/admin check
        userTreeService.deleteTree(elementId, currentUser);
        log.info("TreeController: Tree with elementId: {} successfully deleted by user: {}", elementId, currentUser.getEmail());
        return ResponseEntity.ok().build(); // Or ResponseEntity.noContent().build();
    }

    @PostMapping("/delete-multiple")
    @Operation(summary = "Delete multiple trees by their elementIds")
    public ResponseEntity<Void> deleteMultipleTrees(
            @Parameter(description = "List of tree elementIds to delete", required = true)
            @RequestBody DeleteMultipleTreesRequestDto request) {
        log.info("TreeController: Request to delete multiple trees. Count: {}", request.getIds() != null ? request.getIds().size() : 0);
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        // No generic accessCheck here as permissions are per-tree and handled in service
        userTreeService.deleteMultipleTrees(request.getIds(), currentUser);
        log.info("TreeController: Multiple trees deletion process completed for user: {}", currentUser.getEmail());
        return ResponseEntity.ok().build(); // Or return a body with summary if service provides it
    }
}