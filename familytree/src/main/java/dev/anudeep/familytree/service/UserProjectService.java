package dev.anudeep.familytree.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.repository.ProjectRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.utils.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProjectService {
    private final UserRepository userRepo;
    private final ProjectRepository projectRepo;
    private final Neo4jClient neo4jClient;

    public Optional<User> getUserByElementId(String elementId) {
        return userRepo.findByElementId(elementId);
    }

    public List<User> getUsers() {
        return userRepo.findUsers();
    }

    public Optional<Project> getProjectByElementId(String elementId) {
        return projectRepo.findByElementId(elementId);
    }

    public Optional<Role> getRelationshipType(String userElementId, String projectElementId) {
        Optional<String> relation =  userRepo.findRelationshipBetweenUserAndProject(userElementId, projectElementId);
        if(relation.isPresent()){
            log.info("Relationship for User {}  project {} is {}", userElementId, projectElementId, relation.get());
            if(relation.get().equalsIgnoreCase(Constants.ADMIN_REL)) return Optional.of(Role.ADMIN);
            if(relation.get().equalsIgnoreCase(Constants.EDITOR_REL)) return Optional.of(Role.EDITOR);
            if(relation.get().equalsIgnoreCase(Constants.VIEWER_REL)) return Optional.of(Role.VIEWER);
        }
        log.info("No Relationship found for User {}  project {}", userElementId, projectElementId);
        return Optional.empty();
    }

    public List<Project> getAllProjectsForUser(String userElementId) {
        return userRepo.findAllProjectsForUser(userElementId);
    }

    public List<Project> getProjectsForUserByType(String userElementId, String type) {
        return userRepo.findProjectsByRelationship(userElementId, type);
    }

    public List<User> getUsersForProject(String projectElementId) {
        return projectRepo.findAllUsersForProject(projectElementId);
    }

    public List<User> getUsersForProjectByType(String projectElementId, String type) {
        return projectRepo.findUsersByRelationship(projectElementId, type);
    }

    public User createUser(String name, String email,String picture) {
        return userRepo.save(new User(name, email, picture));
    }

    public Project createProject(Project project) {
        return projectRepo.save(project);
    }

    public Project getProjectByDetails(String name, String createdAt, String createdBy){
        return projectRepo.findProjectByDetails(name, createdAt, createdBy);
    }

    public void createRelationship(String userId, String projectId, String relationType) {
        neo4jClient.query(String.format("""
            MATCH (u:User)
            WHERE elementId(u) = $userId
            MATCH (p:Project)
            WHERE elementId(p) = $projectId
            MERGE (u)-[:%s]->(p)
        """, relationType)).bindAll(Map.of("userId", userId, "projectId", projectId)).run();
    }

}
