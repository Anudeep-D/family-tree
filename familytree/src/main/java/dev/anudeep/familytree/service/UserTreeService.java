package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.TreeRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.utils.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
// import java.util.stream.Collectors; // For potential future use with results, not needed now

@Slf4j
@Service
@RequiredArgsConstructor
public class UserTreeService {
    private final UserRepository userRepo;
    private final TreeRepository treeRepo;
    private final Neo4jClient neo4jClient;

    public Optional<User> getUserByElementId(String elementId) {
        return userRepo.findByElementId(elementId);
    }

    public List<User> getUsers() {
        return userRepo.findUsers();
    }

    public Optional<Tree> getTreeByElementId(String elementId) {
        return treeRepo.findByElementId(elementId);
    }

    
    public Optional<Tree> getTreeWithAccess(String userId, String treeId) {
        return treeRepo.findUserAccessforTree(userId, treeId);
    }

    public Optional<Role> getRelationshipType(String userElementId, String treeElementId) {
        Optional<String> relation =  userRepo.findRelationshipBetweenUserAndTree(userElementId, treeElementId);
        if(relation.isPresent()){
            log.info("Relationship for User {}  tree {} is {}", userElementId, treeElementId, relation.get());
            if(relation.get().equalsIgnoreCase(Constants.ADMIN_REL)) return Optional.of(Role.ADMIN);
            if(relation.get().equalsIgnoreCase(Constants.EDITOR_REL)) return Optional.of(Role.EDITOR);
            if(relation.get().equalsIgnoreCase(Constants.VIEWER_REL)) return Optional.of(Role.VIEWER);
        }
        log.info("No Relationship found for User {}  tree {}", userElementId, treeElementId);
        return Optional.empty();
    }

    public List<Tree> getAllTreesForUser(String userElementId) {
        return treeRepo.findAllTreesForUser(userElementId);
    }

    public List<Tree> getTreesForUserByType(String userElementId, String type) {
        return treeRepo.findTreesByRelationship(userElementId, type);
    }

    public List<User> getUsersForTree(String treeElementId) {
        return treeRepo.findAllUsersForTree(treeElementId);
    }

    public List<User> getUsersForTreeByType(String treeElementId, String type) {
        return treeRepo.findUsersByRelationship(treeElementId, type);
    }

    public User createUser(String name, String email,String picture) {
        return userRepo.save(new User(name, email, picture));
    }

    public void createTree(Tree tree) {
        treeRepo.save(tree);
    }

    public Tree getTreeByDetails(String name, String createdAt, String createdBy){
        return treeRepo.findTreeByDetails(name, createdAt, createdBy);
    }

    public void createRelationship(String userId, String treeId, String relationType) {
        neo4jClient.query(String.format("""
            MATCH (u:User)
            WHERE elementId(u) = $userId
            MATCH (t:Tree)
            WHERE elementId(t) = $treeId
            MERGE (u)-[:%s]->(t)
        """, relationType)).bindAll(Map.of("userId", userId, "treeId", treeId)).run();
    }

    @Transactional // Recommended for operations that modify data
    public void deleteTree(String elementId, User currentUser) {
        log.info("Attempting to delete tree {} by user {}", elementId, currentUser.getEmail());
        Tree tree = treeRepo.findByElementId(elementId)
                .orElseThrow(() -> new EntityNotFoundException("Tree not found with elementId: " + elementId));

        Optional<Role> userRoleOpt = getRelationshipType(currentUser.getElementId(), tree.getElementId());
        if (userRoleOpt.isEmpty() || userRoleOpt.get() != Role.ADMIN) {
            log.warn("User {} attempted to delete tree {} without ADMIN access. Actual role: {}",
                    currentUser.getEmail(), elementId, userRoleOpt.map(Enum::name).orElse("NONE"));
            throw new AccessDeniedException("User does not have Admin access to delete this tree.");
        }

        // Assuming deleteById handles relationships or they are not an issue for this model.
        // If relationships block deletion, a custom DETACH DELETE query in TreeRepository would be needed.
        treeRepo.detachAndDeleteByElementId(elementId);
        log.info("Tree {} deleted successfully (with detach) by user {}", elementId, currentUser.getEmail());
    }

    @Transactional // Recommended for operations that modify data
    public void deleteMultipleTrees(List<String> elementIds, User currentUser) {
        if (elementIds == null || elementIds.isEmpty()) {
            log.info("No tree IDs provided for bulk deletion by user {}.", currentUser.getEmail());
            return;
        }
        log.info("Attempting to delete multiple trees by user {}. Provided IDs: {}", currentUser.getEmail(), elementIds);
        List<String> idsToDelete = new ArrayList<>();
        List<String> skippedIdsLog = new ArrayList<>(); // To log which ones were skipped

        for (String elementId : elementIds) {
            Optional<Tree> treeOpt = treeRepo.findByElementId(elementId);
            if (treeOpt.isEmpty()) {
                log.warn("Tree with elementId {} not found during bulk delete attempt by user {}. Skipping.", elementId, currentUser.getEmail());
                skippedIdsLog.add(elementId + " (Not found)");
                continue;
            }

            Tree tree = treeOpt.get();
            Optional<Role> userRoleOpt = getRelationshipType(currentUser.getElementId(), tree.getElementId());

            if (userRoleOpt.isPresent() && userRoleOpt.get() == Role.ADMIN) {
                idsToDelete.add(elementId); // Add the elementId for deletion
            } else {
                log.warn("User {} does not have ADMIN access for tree {} during bulk delete. Actual role: {}. Skipping.",
                        currentUser.getEmail(), elementId, userRoleOpt.map(Enum::name).orElse("NONE"));
                skippedIdsLog.add(elementId + " (Access denied)");
            }
        }

        if (!idsToDelete.isEmpty()) {
            // Similar to deleteTree, ensure deleteAllById works as expected with elementIds.
            // If these are custom IDs and not the internal Neo4j ID, a custom query is safer:
            // e.g., @Query("MATCH (t:Tree) WHERE t.elementId IN $elementIds DETACH DELETE t")
            // For now, proceeding with deleteAllById assuming it's configured for elementId or is a list of actual entities.
            // A safer approach if deleteAllById expects entities or internal IDs:
            // List<Tree> treesToDeleteObjects = treeRepo.findAllByElementIdIn(idsToDelete); // Assuming such a method exists or can be added
            // treeRepo.deleteAll(treesToDeleteObjects);
            // For this exercise, using deleteAllById as per prompt's structure, assuming it works with a list of elementIds.
            // However, Spring Data JPA/Neo4j deleteAllById typically expects a list of internal IDs.
            // A more robust way for custom IDs is to fetch entities then delete, or use a custom query.
            // Let's assume for now treeRepo.deleteAllById can handle a list of custom @Id annotated fields or it's a custom method.
            // If elementId is the actual @Id field in the Tree entity, then deleteAllById(idsToDelete) should work.
            treeRepo.detachAndDeleteAllByElementIdIn(idsToDelete);
            log.info("Successfully deleted (with detach) trees with IDs: {} by user {}.", idsToDelete, currentUser.getEmail());
        } else {
            log.info("No trees were eligible for deletion by user {} from the provided list.", currentUser.getEmail());
        }

        if(!skippedIdsLog.isEmpty()){
            log.info("Skipped tree IDs during bulk deletion by user {}: {}", currentUser.getEmail(), skippedIdsLog);
        }
    }
}
