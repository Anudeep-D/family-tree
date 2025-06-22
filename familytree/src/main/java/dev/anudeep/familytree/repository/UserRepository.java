package dev.anudeep.familytree.repository;


import dev.anudeep.familytree.model.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends Neo4jRepository<User, String> {
    // Find users
    @Query("MATCH (p:User) RETURN p {.*, elementId: elementId(p) } AS person")
    List<User> findUsers();

    // Find users with access for a tree
    @Query("""
             MATCH (u:User)
              OPTIONAL MATCH (u)-[r]->(m:Tree) WHERE elementId(m) = $elementId
              RETURN u {.*, elementId: elementId(u), access:type(r) } AS user
            """)
    List<User> findUsersAccessWithTree(String elementId);

    // Find user
    @Query("MATCH (p:User) WHERE elementId(p) = $elementId RETURN p {.*, elementId: elementId(p) } AS user")
    Optional<User> findByElementId(String elementId);

    // Find user by email
    @Query("MATCH (p:User {email : $email}) RETURN p {.*, elementId: elementId(p) } AS person")
    Optional<User> findByEmail(String email);

    @Query("""
        MATCH (u:User)-[r]->(t:Tree)
        WHERE elementId(u) = $userElementId AND elementId(t) = $treeElementId
        RETURN type(r)
    """)
    Optional<String> findRelationshipBetweenUserAndTree(@Param("userElementId") String userElementId, @Param("treeElementId") String treeElementId);
}
