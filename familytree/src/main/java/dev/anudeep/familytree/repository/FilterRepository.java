package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.Filter;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilterRepository extends Neo4jRepository<Filter, String> {

    /**
     * Finds all filters associated with a specific tree.
     * The tree ID for this query is assumed to be a property on the Tree node, e.g., 'uuid'.
     * Adjust 't.uuid' if your Tree node uses a different property for its business ID.
     *
     * @param treeId The business ID (e.g., UUID) of the Tree node.
     * @return A list of filters related to the tree.
     */
    @Query("MATCH (t:Tree)-[:FILTER_FOR]-(f:Filter) MATCH (u:User)-[:FILTER_BY]-(f)  WHERE elementId(t) = $treeId AND elementId(u) = $userId RETURN f")
    List<Filter> findAllByTreeIdAndUserId(@Param("userId") String userId, @Param("treeId") String treeId);

    // For deleteMultipleFilters, the default deleteAllById(Iterable<String> ids) from Neo4jRepository
    // should be sufficient to delete the Filter nodes by their Neo4j IDs.
    // Neo4j will automatically remove the relationships connected to the deleted nodes.

    @Query("MATCH (u:User), (f:Filter), (t:Tree) WHERE elementId(u) = $userId AND elementId(f) = $filterElementId AND elementId(t) = treeId MERGE (u)-[:FILTER_BY]->(f) MERGE (t)-[:FILTER_FOR]->(f)")
    void createFilterRelationship(@Param("userId") String userId, @Param("treeId") String treeId, @Param("filterElementId") String filterElementId);

}
