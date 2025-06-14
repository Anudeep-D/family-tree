package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.TreeRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.utils.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;

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

}
