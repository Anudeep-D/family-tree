package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.dto.FilterDTO;
import dev.anudeep.familytree.dto.FilterRequestDTO;
import dev.anudeep.familytree.dto.FilterUpdateRequestDTO;
import dev.anudeep.familytree.model.Filter;
import dev.anudeep.familytree.repository.FilterRepository;
import dev.anudeep.familytree.repository.TreeRepository;
import dev.anudeep.familytree.repository.UserRepository;
import dev.anudeep.familytree.utils.FilterNodeConverter;
import lombok.extern.slf4j.Slf4j;
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
    private final UserRepository userRepository; // Placeholder
    private final TreeRepository treeRepository;   // Placeholder

    private final FilterNodeConverter filterNodeConverter;

    public FilterService(FilterRepository filterRepository,
                         UserRepository userRepository,
                         TreeRepository treeRepository,
            FilterNodeConverter filterNodeConverter ) {
        this.filterRepository = filterRepository;
        this.userRepository = userRepository;
        this.treeRepository = treeRepository;
        this.filterNodeConverter = filterNodeConverter;
    }

    @Transactional
    public Filter createFilter(String userId, String treeId, FilterRequestDTO dto) throws Exception {
        // 1. Validate user (exists? active?) - UserNodeId is Neo4j internal ID
        // User user = userRepository.findById(userNodeId)
        // .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userNodeId));

        // 2. Validate treeId (does tree exist? does user have access to it?)
        // Tree tree = treeRepository.findByBusinessId(dto.getTreeId()) // Assuming Tree has a business ID like UUID
        // .orElseThrow(() -> new EntityNotFoundException("Tree not found with ID: " + dto.getTreeId()));
        // Add access control logic here if necessary, e.g., check if user is linked to the tree.

        Filter filter = new Filter(dto.getFilterName(), dto.getEnabled(), dto.getFilterBy());
        Map<String, Object> props = filterNodeConverter.flatten(filter);
        Map<String, Object> filterResponse = filterRepository.createFilter(userId, treeId, props);
        Filter savedFilter = filterNodeConverter.unflatten(filterResponse);
        log.info("id {} ,savedFilter {}", savedFilter.getElementId(), savedFilter);
        return savedFilter;
    }

    @Transactional(readOnly = true)
    public List<Filter> getFilters(String userId, String treeId) throws Exception {
        // Validate user if necessary
        // userRepository.findById(userNodeId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<Map<String, Object>> filtersResponse =  filterRepository.findAllByTreeIdAndUserId(userId, treeId);
        List<Filter> savedFilters = new ArrayList<>();
        filtersResponse.forEach(filterRes -> savedFilters.add(filterNodeConverter.unflatten(filterRes)));
        return savedFilters;
    }


    @Transactional
    public Filter updateFilter(String filterElementId, FilterUpdateRequestDTO dto) throws Exception { // Changed from Long to String
        Map<String, Object> props = filterRepository.findFilterById(filterElementId);

        boolean updated = dto.getFilterName() != null;
        if (dto.getEnabled() != null) {

            updated = true;
        }
        if (dto.getFilterBy() != null) {

            updated = true;
        }

        if (updated) {
            props.remove("elementId");
            Map<String, Object> updatedProps = filterRepository.updateFilter(filterElementId, props);
            return filterNodeConverter.unflatten(updatedProps);
        }
        return filterNodeConverter.unflatten(props);
    }

    @Transactional
    public void deleteMultipleFilters(List<String> filterElementIds) throws Exception { // Changed from List<Long> to List<String>
        if (filterElementIds == null || filterElementIds.isEmpty()) {
            return;
        }

        filterRepository.deleteAllById(filterElementIds);
    }
}
