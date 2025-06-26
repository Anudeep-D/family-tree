package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.dto.FilterRequestDTO;
import dev.anudeep.familytree.dto.FilterUpdateRequestDTO;
import dev.anudeep.familytree.model.Filter;
import dev.anudeep.familytree.model.User; // Assuming User model exists
import dev.anudeep.familytree.model.Tree;   // Assuming Tree model exists
import dev.anudeep.familytree.repository.FilterRepository;
import dev.anudeep.familytree.repository.UserRepository; // Assuming UserRepository exists
import dev.anudeep.familytree.repository.TreeRepository;   // Assuming TreeRepository exists
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException; // Or a custom exception

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FilterService {

    private final FilterRepository filterRepository;
    private final UserRepository userRepository; // Placeholder
    private final TreeRepository treeRepository;   // Placeholder

    // Assuming FilterNodeConverter might be used for complex transformations if needed later
    // private final FilterNodeConverter filterNodeConverter;

    public FilterService(FilterRepository filterRepository,
                         UserRepository userRepository,
                         TreeRepository treeRepository
            /* FilterNodeConverter filterNodeConverter */) {
        this.filterRepository = filterRepository;
        this.userRepository = userRepository;
        this.treeRepository = treeRepository;
        // this.filterNodeConverter = filterNodeConverter;
    }

    @Transactional
    public Filter createFilter(String userId, String treeId, FilterRequestDTO dto) {
        // 1. Validate user (exists? active?) - UserNodeId is Neo4j internal ID
        // User user = userRepository.findById(userNodeId)
        // .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userNodeId));

        // 2. Validate treeId (does tree exist? does user have access to it?)
        // Tree tree = treeRepository.findByBusinessId(dto.getTreeId()) // Assuming Tree has a business ID like UUID
        // .orElseThrow(() -> new EntityNotFoundException("Tree not found with ID: " + dto.getTreeId()));
        // Add access control logic here if necessary, e.g., check if user is linked to the tree.

        Filter filter = new Filter(dto.getFilterName(), dto.getEnabled(), dto.getFilterBy());
        Filter savedFilter = filterRepository.save(filter);

        // Create relationships
        filterRepository.createFilterRelationship(userId, treeId, savedFilter.getElementId());
        return savedFilter;
    }

    @Transactional(readOnly = true)
    public List<Filter> getFilters(String userId, String treeId) {
        // Validate user if necessary
        // userRepository.findById(userNodeId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return filterRepository.findAllByTreeIdAndUserId(userId, treeId);
    }

    @Transactional(readOnly = true)
    public Optional<Filter> getFilterById(String filterElementId) { // Changed from Long to String
        return filterRepository.findById(filterElementId);
    }

    @Transactional
    public Filter updateFilter(String filterElementId, FilterUpdateRequestDTO dto) { // Changed from Long to String
        Filter filter = filterRepository.findById(filterElementId)
                .orElseThrow(() -> new EntityNotFoundException("Filter not found with ID: " + filterElementId));

        boolean updated = false;
        if (dto.getFilterName() != null) {
            filter.setFilterName(dto.getFilterName());
            updated = true;
        }
        if (dto.getEnabled() != null) {
            filter.setEnabled(dto.getEnabled());
            updated = true;
        }
        if (dto.getFilterBy() != null) {
            filter.setFilterBy(dto.getFilterBy());
            updated = true;
        }

        if (updated) {
            return filterRepository.save(filter);
        }
        return filter;
    }

    @Transactional
    public void deleteMultipleFilters(List<String> filterElementIds) { // Changed from List<Long> to List<String>
        if (filterElementIds == null || filterElementIds.isEmpty()) {
            return;
        }

        filterRepository.deleteAllById(filterElementIds);
    }
}
