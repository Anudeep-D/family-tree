package dev.anudeep.familytree.repository;


import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface TreeRepository extends Neo4jRepository<Tree, String> {
    // Find tree
    @Query("MATCH (t:Tree) WHERE elementId(t) = $elementId RETURN t {.*, elementId: elementId(t) } AS tree")
    Optional<Tree> findByElementId(String elementId);

    @Query("""
        MATCH (u:User)-[r]->(t:Tree)
        WHERE elementId(t) = $treeElementId
        RETURN u {.*, elementId: elementId(u) } AS users, type(r) as access
    """)
    List<User> findAllUsersForTree(String treeElementId);

    @Query("""
        MATCH (u:User)-[r:$relationship]->(t:Tree)
        WHERE elementId(t) = $treeElementId
        RETURN u {.*, elementId: elementId(u) } AS users
    """)
    List<User> findUsersByRelationship(String treeElementId, String relationship);

    @Query("""
        MATCH (t:Tree)
        WHERE t.name = $name AND t.createdAt = $createdAt AND t.createdBy = $createdBy
        RETURN t {.*, elementId: elementId(t) } AS tree
    """)
    Tree findTreeByDetails(String name, String createdAt, String createdBy);

    @Query("""
        MATCH (u:User)-[r]->(t:Tree)
        WHERE elementId(u) = $userElementId
        RETURN t {.*, elementId: elementId(t), access: type(r) } AS tree
    """)
    List<Tree> findAllTreesForUser(String userElementId);

    @Query("""
        MATCH (u:User)-[r:$relationship]->(t:Tree)
        WHERE elementId(u) = $userId
        RETURN t {.*, elementId: elementId(t) } AS tree
    """)
    List<Tree> findTreesByRelationship(String userId, String relationship);
}
