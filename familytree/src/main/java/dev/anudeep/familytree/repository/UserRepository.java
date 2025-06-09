package dev.anudeep.familytree.repository;


import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends Neo4jRepository<User, String> {
    // Find users
    @Query("MATCH (p:User) RETURN p {.*, elementId: elementId(p) } AS person")
    List<User> findUsers();

    // Find user
    @Query("MATCH (p:User) WHERE elementId(p) = $elementId RETURN p {.*, elementId: elementId(p) } AS user")
    Optional<User> findByElementId(String elementId);

    // Find user by email
    @Query("MATCH (p:User {email : $email}) RETURN p {.*, elementId: elementId(p) } AS person")
    Optional<User> findByEmail(String email);

    @Query("""
        MATCH (u:User)-[r]->(p:Project)
        WHERE elementId(u) = $userId
        RETURN p {.*, elementId: elementId(p) } AS project
    """)
    List<Project> findAllProjectsForUser(String userId);

    @Query("""
        MATCH (u:User)-[r:$relationship]->(p:Project)
        WHERE elementId(u) = $userId
        RETURN p {.*, elementId: elementId(p) } AS project
    """)
    List<Project> findProjectsByRelationship(String userId, String relationship);

    @Query("""
        MATCH (u:User)-[r]->(p:Project)
        WHERE elementId(u) = $userId AND elementId(p) = $projectId
        RETURN type(r)
    """)
    Optional<String> findRelationshipBetweenUserAndProject(String userId, String projectId);
}
