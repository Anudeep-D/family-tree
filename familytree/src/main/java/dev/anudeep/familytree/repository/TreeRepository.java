package dev.anudeep.familytree.repository;


import dev.anudeep.familytree.dto.RelationChangeSummary;
import dev.anudeep.familytree.model.Tree;
import dev.anudeep.familytree.model.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TreeRepository extends Neo4jRepository<Tree, String> {
    // Find tree
    @Query("MATCH (t:Tree) WHERE elementId(t) = $elementId RETURN t {.*, elementId: elementId(t) } AS tree")
    Optional<Tree> findByElementId(String elementId);

    @Query("""
                MATCH (u:User)-[r]->(t:Tree)
                WHERE elementId(u) = $userId AND elementId(t) = $treeId
                RETURN t {.*, elementId: elementId(t), access: type(r) } AS tree
            """)
    Optional<Tree> findUserAccessforTree(String userId, String treeId);

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

    // Custom method for single delete with DETACH
    @Query("MATCH (t:Tree) WHERE elementId(t) = $elementId DETACH DELETE t")
    void detachAndDeleteByElementId(String elementId);

    // Custom method for bulk delete with DETACH
    @Query("MATCH (t:Tree) WHERE elementId(t) IN $elementIds DETACH DELETE t")
    void detachAndDeleteAllByElementIdIn(List<String> elementIds);


    @Query("""
              UNWIND $users AS userData
              MATCH (u:User) WHERE elementId(u) = userData.elementId
              MATCH (t:Tree) WHERE elementId(t) = $treeId
            
              // Get existing relationship
               OPTIONAL MATCH (u)-[existingRel]->(t)
               WHERE type(existingRel) IN ['ADMIN_FOR', 'EDITOR_FOR', 'VIEWER_FOR']
               WITH u, t, userData, type(existingRel) AS currentRelType, existingRel
            
               // Step 1: DELETE if any
               FOREACH (_ IN CASE WHEN existingRel IS NOT NULL THEN [1] ELSE [] END |
                 DELETE existingRel
               )
            
               // Step 2: CREATE new if userData.relation IS NOT NULL
               FOREACH (_ IN CASE WHEN userData.relation = 'ADMIN_FOR' THEN [1] ELSE [] END |
                 MERGE (u)-[:ADMIN_FOR]->(t)
               )
               FOREACH (_ IN CASE WHEN userData.relation = 'EDITOR_FOR' THEN [1] ELSE [] END |
                 MERGE (u)-[:EDITOR_FOR]->(t)
               )
               FOREACH (_ IN CASE WHEN userData.relation = 'VIEWER_FOR' THEN [1] ELSE [] END |
                 MERGE (u)-[:VIEWER_FOR]->(t)
               )
            
               // Step 3: classify the operation type
               WITH
                 CASE
                   WHEN currentRelType IS NOT NULL AND userData.relation IS NULL THEN 1 ELSE 0
                 END AS permanentlyDeleted,
                 CASE
                   WHEN currentRelType IS NULL AND userData.relation IS NOT NULL THEN 1 ELSE 0
                 END AS newlyCreated,
                 CASE
                   WHEN currentRelType IS NOT NULL AND userData.relation IS NOT NULL AND currentRelType <> userData.relation THEN 1 ELSE 0
                 END AS updated
            
               RETURN
                 sum(permanentlyDeleted) AS permanentlyDeletedCount,
                 sum(newlyCreated) AS newlyCreatedCount,
                 sum(updated) AS updatedCount
            """)
    RelationChangeSummary updateUsersRelationShip(String treeId, List<Map<String, String>> users);
}
