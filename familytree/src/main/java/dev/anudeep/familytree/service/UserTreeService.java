package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.dto.RelationChangeSummary;
import dev.anudeep.familytree.dto.RoleAssignmentRequest;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.dto.notification.EventType;
import dev.anudeep.familytree.dto.notification.NotificationEvent;
import dev.anudeep.familytree.repository.TreeRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.utils.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
// import java.util.stream.Collectors; // For potential future use with results, not needed now

@Slf4j
@Service
@RequiredArgsConstructor
public class UserTreeService {
    private final UserRepository userRepo;
    private final TreeRepository treeRepo;
    private final Neo4jClient neo4jClient;
    private final NotificationService notificationService; // Added NotificationService

    public Optional<User> getUserByElementId(String elementId) {
        return userRepo.findByElementId(elementId);
    }

    public List<User> getUsers() {
        return userRepo.findUsers();
    }

    public List<User> getUsersAccessWithTree(String treeId) {
        return userRepo.findUsersAccessWithTree(treeId);
    }

    public Optional<Tree> getTreeByElementId(String elementId) {
        return treeRepo.findByElementId(elementId);
    }


    public Optional<Tree> getTreeWithAccess(String userId, String treeId) {
        return treeRepo.findUserAccessforTree(userId, treeId);
    }

    public Optional<Role> getRelationshipType(String userElementId, String treeElementId) {
        Optional<String> relation = userRepo.findRelationshipBetweenUserAndTree(userElementId, treeElementId);
        if (relation.isPresent()) {
            log.info("Relationship for User {}  tree {} is {}", userElementId, treeElementId, relation.get());
            if (relation.get().equalsIgnoreCase(Constants.ADMIN_REL)) return Optional.of(Role.ADMIN);
            if (relation.get().equalsIgnoreCase(Constants.EDITOR_REL)) return Optional.of(Role.EDITOR);
            if (relation.get().equalsIgnoreCase(Constants.VIEWER_REL)) return Optional.of(Role.VIEWER);
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

    public User createUser(String name, String email, String picture) {
        return userRepo.save(new User(name, email, picture));
    }

    public void createTree(Tree tree) {
        treeRepo.save(tree);
        // Notify about tree creation
        if (tree.getElementId() != null && tree.getCreatedBy() != null) {
            User creator = userRepo.findByElementId(tree.getCreatedBy())
                    .orElse(new User(null, "Unknown User", null)); // Fallback user

            List<String> usersToNotify = Collections.singletonList(tree.getCreatedBy());

            NotificationEvent event = new NotificationEvent(
                    EventType.TREE_CREATED,
                    tree.getElementId(),
                    tree.getName(),
                    tree.getCreatedBy(), // Actor's elementId
                    creator.getName(),   // Actor's name
                    usersToNotify,
                    null // No legacy data map needed
            );
            notificationService.sendNotification(event);
        }
    }

    public Tree getTreeByDetails(String name, String createdAt, String createdBy) {
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

        // Notify about user access change
        String actorUserElementId = SecurityContextHolder.getContext().getAuthentication().getName(); // Assumes principal is user elementId
        User actor = userRepo.findByElementId(actorUserElementId)
                .orElse(new User(null, "Unknown User", null)); // Fallback for actor name
        Tree affectedTree = treeRepo.findByElementId(treeId)
                .orElse(new Tree(null, "Unknown Tree", null, null)); // Fallback for tree name

        List<String> usersToNotify = Collections.singletonList(userId); // Notify only the affected user

        Map<String, Object> eventData = new HashMap<>(); // Keep other relevant data if any
        eventData.put("affectedUserElementId", userId);
        eventData.put("newRole", relationType);
        eventData.put("changeType", "GRANT");


        NotificationEvent event = new NotificationEvent(
                EventType.USER_ACCESS_CHANGED,
                treeId,
                affectedTree.getName(),
                actorUserElementId,
                actor.getName(),
                usersToNotify,
                eventData
        );
        notificationService.sendNotification(event);
    }

    public RelationChangeSummary updateUsersRelationShip(String treeId, List<RoleAssignmentRequest> users) throws Exception {

        List<Map<String, String>> userMaps = users.stream()
                .map(user -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("elementId", user.getElementId());
                    map.put("relation", user.getRelation());
                    return map;
                })
                .collect(Collectors.toList());
        log.info("Users to update {} for treeId {}", userMaps, treeId);
        RelationChangeSummary summary = treeRepo.updateUsersRelationShip(treeId, userMaps);

        // Notify for each user whose role might have been changed
        String actorUserElementId = SecurityContextHolder.getContext().getAuthentication().getName(); // Assumes principal is user elementId
        User actor = userRepo.findByElementId(actorUserElementId)
                .orElse(new User(null, "Unknown User", null)); // Fallback for actor name
        Tree affectedTree = treeRepo.findByElementId(treeId)
                .orElse(new Tree(null, "Unknown Tree", null, null)); // Fallback for tree name

        for (RoleAssignmentRequest userRole : users) {
            List<String> usersToNotify = Collections.singletonList(userRole.getElementId()); // Notify only the affected user

            Map<String, Object> eventData = new HashMap<>();
            eventData.put("affectedUserElementId", userRole.getElementId());
            eventData.put("newRole", userRole.getRelation());
            eventData.put("changeType", "UPDATE");

            NotificationEvent event = new NotificationEvent(
                    EventType.USER_ACCESS_CHANGED,
                    treeId,
                    affectedTree.getName(),
                    actorUserElementId,
                    actor.getName(),
                    usersToNotify,
                    eventData
            );
            notificationService.sendNotification(event);
        }
        return summary;
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
        // Fetch users who had access BEFORE deletion
        List<String> usersToNotify = treeRepo.findAllUsersForTree(elementId).stream()
                .map(User::getElementId)
                .collect(Collectors.toList());

        treeRepo.detachAndDeleteByElementId(elementId);
        log.info("Tree {} deleted successfully (with detach) by user {}", elementId, currentUser.getEmail());

        // Notify about tree deletion
        NotificationEvent event = new NotificationEvent(
                EventType.TREE_DELETED,
                elementId, // treeId is elementId here
                tree.getName(), // treeName
                currentUser.getElementId(), // actorUserId
                currentUser.getName(), // actorUserName
                usersToNotify,
                null // No legacy data map
        );
        notificationService.sendNotification(event);
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
        Map<String, Tree> treesPendingDeletion = new HashMap<>(); // To store tree objects for notification

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
                treesPendingDeletion.put(elementId, tree); // Store for notification
            } else {
                log.warn("User {} does not have ADMIN access for tree {} during bulk delete. Actual role: {}. Skipping.",
                        currentUser.getEmail(), elementId, userRoleOpt.map(Enum::name).orElse("NONE"));
                skippedIdsLog.add(elementId + " (Access denied)");
            }
        }

        if (!idsToDelete.isEmpty()) {
            // Fetch users for all trees to be deleted BEFORE actual deletion
            Map<String, List<String>> usersToNotifyByTreeId = new HashMap<>();
            for (String treeId : idsToDelete) {
                List<String> users = treeRepo.findAllUsersForTree(treeId).stream()
                        .map(User::getElementId)
                        .collect(Collectors.toList());
                usersToNotifyByTreeId.put(treeId, users);
            }

            treeRepo.detachAndDeleteAllByElementIdIn(idsToDelete);
            log.info("Successfully deleted (with detach) trees with IDs: {} by user {}.", idsToDelete, currentUser.getEmail());

            // Notify for each deleted tree
            for (String deletedTreeId : idsToDelete) {
                Tree deletedTree = treesPendingDeletion.get(deletedTreeId); // Get stored tree
                List<String> usersForThisTree = usersToNotifyByTreeId.getOrDefault(deletedTreeId, Collections.emptyList());

                if (deletedTree == null) { // Should not happen if logic is correct
                    log.error("Could not find tree details for {} during bulk delete notification.", deletedTreeId);
                    continue;
                }

                NotificationEvent event = new NotificationEvent(
                        EventType.TREE_DELETED,
                        deletedTreeId,
                        deletedTree.getName(), // treeName
                        currentUser.getElementId(), // actorUserId
                        currentUser.getName(), // actorUserName
                        usersForThisTree, // usersToNotify
                        null // No legacy data map
                );
                notificationService.sendNotification(event);
            }
        } else {
            log.info("No trees were eligible for deletion by user {} from the provided list.", currentUser.getEmail());
        }

        if (!skippedIdsLog.isEmpty()) {
            log.info("Skipped tree IDs during bulk deletion by user {}: {}", currentUser.getEmail(), skippedIdsLog);
        }
    }
}
