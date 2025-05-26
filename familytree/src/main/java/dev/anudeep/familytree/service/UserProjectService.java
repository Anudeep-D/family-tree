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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserProjectService {
    private final UserRepository userRepo;
    private final ProjectRepository projectRepo;
    private final Neo4jClient neo4jClient;

    public Optional<User> getUserByElementId(String elementId) {
        return userRepo.findAll().stream()
                .filter(u -> elementId.equals(u.getElementId()))
                .findFirst();
    }

    public Optional<Project> getProjectByElementId(String elementId) {
        return projectRepo.findAll().stream()
                .filter(p -> elementId.equals(p.getElementId()))
                .findFirst();
    }

    public Optional<Role> getRelationshipType(String userElementId, String projectElementId) {
        Optional<String> relation =  userRepo.findRelationshipBetweenUserAndProject(userElementId, projectElementId);
        if(relation.isPresent()){
            if(relation.get().equalsIgnoreCase("ADMIN_FOR")) return Optional.of(Role.ADMIN);
            if(relation.get().equalsIgnoreCase("EDITOR_FOR")) return Optional.of(Role.EDITOR);
            if(relation.get().equalsIgnoreCase("VIEWER_FOR")) return Optional.of(Role.VIEWER);
        }
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

    public Project createProject(String name) {
        return projectRepo.save(new Project(name));
    }

    public void createRelationship(String userId, String projectId, String relationType) {
        neo4jClient.query(String.format("""
            MATCH (u:User), (p:Project)
            WHERE elementId(u) = $userId AND elementId(p) = $projectId
            MERGE (u)-[:%s]->(p)
        """, relationType)).bindAll(Map.of("userId", userId, "projectId", projectId)).run();
    }
}
