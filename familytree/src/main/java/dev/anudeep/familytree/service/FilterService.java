package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.dto.FilterRequestDTO;
import dev.anudeep.familytree.dto.FilterUpdateRequestDTO;
import dev.anudeep.familytree.model.Filter;
import dev.anudeep.familytree.repository.FilterRepository;
import dev.anudeep.familytree.repository.TreeRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.utils.FilterNodeConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class FilterService {

    private final FilterRepository filterRepository;
    private final UserRepository userRepository;
    private final TreeRepository treeRepository;
    private final Neo4jClient neo4jClient; // Added Neo4jClient

    public FilterService(FilterRepository filterRepository,
                         UserRepository userRepository,
                         TreeRepository treeRepository,
                         Neo4jClient neo4jClient) { // Added Neo4jClient to constructor
        this.filterRepository = filterRepository;
        this.userRepository = userRepository;
        this.treeRepository = treeRepository;
        this.neo4jClient = neo4jClient; // Initialize Neo4jClient
    }

    @Transactional
    public Filter createFilter(String userId, String treeId, FilterRequestDTO dto) {
        // User/Tree validation logic would go here (e.g., check existence)

        Filter filter = new Filter(dto.getFilterName(), dto.getEnabled(), dto.getFilterBy());
        Map<String, Object> propsToSave = FilterNodeConverter.filterToFlattenedMap(filter);

        String createFilterCypher = """
                    MATCH (u:User) WHERE elementId(u) = $userId
                    MATCH (t:Tree) WHERE elementId(t) = $treeId
                    CREATE (f:Filter)
                    SET f += $props
                    CREATE (u)-[:FILTER_BY]->(f)
                    CREATE (f)-[:FILTER_FOR]->(t)
                    RETURN f {.*, elementId: elementId(f) } AS createdFilter
                """;

        Optional<Map<String, Object>> resultOptional = neo4jClient.query(createFilterCypher)
                .bind(userId).to("userId")
                .bind(treeId).to("treeId")
                .bind(propsToSave).to("props")
                .fetch()
                .one();

        if (resultOptional.isEmpty() || resultOptional.get().get("createdFilter") == null) {
            log.error("Failed to create filter for user {} and tree {}. Neo4jClient query returned no data or null filter.", userId, treeId);
            throw new RuntimeException("Filter creation failed, Neo4jClient query returned no data.");
        }

        // The result is a Map<String, Object> where the key "createdFilter" holds the properties of the node.
        @SuppressWarnings("unchecked")
        Map<String, Object> createdNodeMap = (Map<String, Object>) resultOptional.get().get("createdFilter");

        if (createdNodeMap == null || createdNodeMap.isEmpty()) {
            log.error("Failed to create filter for user {} and tree {}. Result map for createdFilter is null or empty.", userId, treeId);
            throw new RuntimeException("Filter creation failed, result map for createdFilter is null or empty.");
        }

        String elementId = (String) createdNodeMap.get("elementId");
        Filter savedFilter = FilterNodeConverter.flattenedMapToFilter(createdNodeMap, elementId);
        log.info("Created filter with id {} for user {} and tree {}", elementId, userId, treeId);
        return savedFilter;
    }

    @Transactional(readOnly = true)
    public List<Filter> getFilters(String userId, String treeId) {
        // User/Tree validation logic
        List<Map<String, Object>> filtersResponseMaps = filterRepository.findAllByTreeIdAndUserId(userId, treeId);
        List<Filter> savedFilters = new ArrayList<>();
        for (Map<String, Object> filterMap : filtersResponseMaps) {
            String elementId = (String) filterMap.get("elementId");
            savedFilters.add(FilterNodeConverter.flattenedMapToFilter(filterMap, elementId));
        }
        return savedFilters;
    }

    @Transactional
    public Filter updateFilter(String filterElementId, FilterRequestDTO dto) {
        Map<String, Object> currentFilterMap = filterRepository.findFilterById(filterElementId);
        if (currentFilterMap == null || currentFilterMap.isEmpty()) {
            throw new EntityNotFoundException("Filter not found with ID: " + filterElementId);
        }

        Filter currentFilter = FilterNodeConverter.flattenedMapToFilter(currentFilterMap, filterElementId);

        boolean updated = false;
        if (dto.getFilterName() != null && !dto.getFilterName().equals(currentFilter.getFilterName())) {
            currentFilter.setFilterName(dto.getFilterName());
            updated = true;
        }
        if (dto.getEnabled() != null && !dto.getEnabled().equals(currentFilter.isEnabled())) {
            currentFilter.setEnabled(dto.getEnabled());
            updated = true;
        }
        if (dto.getFilterBy() != null) {
            // For simplicity, if filterBy is in DTO, we consider it an update.
            // More granular comparison could be done here if needed.
            currentFilter.setFilterBy(dto.getFilterBy());
            updated = true;
        }

        if (updated) {
            Map<String, Object> propsToUpdate = FilterNodeConverter.filterToFlattenedMap(currentFilter);
            propsToUpdate.remove("elementId"); // elementId should not be in the properties map for SET f += $props

            Map<String, Object> updatedNodeMap = filterRepository.updateFilter(filterElementId, propsToUpdate);
            if (updatedNodeMap == null || updatedNodeMap.isEmpty()) {
                log.error("Failed to update filter with id {}. Repository returned empty map.", filterElementId);
                throw new RuntimeException("Filter update failed, repository returned no data.");
            }
            return FilterNodeConverter.flattenedMapToFilter(updatedNodeMap, filterElementId);
        }
        return currentFilter; // No changes were made
    }

    @Transactional
    public int deleteMultipleFilters(List<String> filterElementIds) throws Exception { // Changed from List<Long> to List<String>
        if (filterElementIds == null || filterElementIds.isEmpty()) {
            return 0;
        }

        return filterRepository.deleteFilters(filterElementIds);
    }
}
