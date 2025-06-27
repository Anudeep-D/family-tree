package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.dto.FilterDTO;
import dev.anudeep.familytree.model.Filter;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface FilterRepository extends Neo4jRepository<Filter, String> {

    @Query("""
                MATCH (u:User) WHERE elementId(u) = $userId
                MATCH (t:Tree) WHERE elementId(t) = $treeId
                CREATE (f:Filter)
                SET f += $props
                CREATE (u)-[:FILTER_BY]->(f)
                CREATE (f)-[:FILTER_FOR]->(t)
                RETURN f {.*, elementId: elementId(f) } AS f
            """)
    Map<String, Object> createFilter(@Param("userId") String userId, @Param("treeId") String treeId, @Param("props") Map<String, Object> props);

    @Query("""
                MATCH (f:Filter) WHERE elementId(f) = $filterId
                SET f += $props
                RETURN f {.*, elementId: elementId(f) } AS f
            """)
    Map<String, Object> updateFilter(@Param("filterId") String filterId, @Param("props") Map<String, Object> props);

    /**
     * Finds all filters associated with a specific tree.
     * The tree ID for this query is assumed to be a property on the Tree node, e.g., 'uuid'.
     * Adjust 't.uuid' if your Tree node uses a different property for its business ID.
     *
     * @param treeId The business ID (e.g., UUID) of the Tree node.
     * @return A list of filters related to the tree.
     */
    @Query("MATCH (t:Tree)-[:FILTER_FOR]-(f:Filter) MATCH (u:User)-[:FILTER_BY]-(f)  WHERE elementId(t) = $treeId AND elementId(u) = $userId RETURN f {.*, elementId: elementId(f) } AS f")
    List<Map<String, Object>> findAllByTreeIdAndUserId(@Param("userId") String userId, @Param("treeId") String treeId);

    @Query("MATCH (f:Filter) WHERE elementId(f) = $filterId RETURN f {.*, elementId: elementId(f) } AS f")
    Map<String, Object> findFilterById(@Param("filterId") String filterId);

}
