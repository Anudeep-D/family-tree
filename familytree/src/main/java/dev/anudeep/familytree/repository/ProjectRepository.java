package dev.anudeep.familytree.repository;


import dev.anudeep.familytree.model.Project;
import dev.anudeep.familytree.model.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends Neo4jRepository<Project, String> {
    // Find project
    @Query("MATCH (p:Project) WHERE elementId(p) = $elementId RETURN p {.*, elementId: elementId(p) } AS project")
    Optional<Project> findByElementId(String elementId);

    @Query("""
        MATCH (u:User)-[r]->(p:Project)
        WHERE elementId(p) = $projectId
        RETURN u {.*, elementId: elementId(p) } AS users
    """)
    List<User> findAllUsersForProject(String projectId);

    @Query("""
        MATCH (u:User)-[r:$relationship]->(p:Project)
        WHERE elementId(p) = $projectId
        RETURN u {.*, elementId: elementId(p) } AS users
    """)
    List<User> findUsersByRelationship(String projectId, String relationship);

    @Query("""
        MATCH (p:Project)
        WHERE p.name = $name AND p.createdAt = $createdAt AND p.createdBy = $createdBy
        RETURN p {.*, elementId: elementId(p) } AS project
    """)
    Project findProjectByDetails(String name, String createdAt, String createdBy);
}
