package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.DeleteFiltersRequestDTO;
import dev.anudeep.familytree.dto.FilterRequestDTO;
import dev.anudeep.familytree.dto.FilterUpdateRequestDTO;
import dev.anudeep.familytree.model.Filter;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.FilterService;

import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/filters") // Base path for filter-related APIs
public class FilterController {

    private final FilterService filterService;
    private final CommonUtils commonUtils;

    public FilterController(FilterService filterService, CommonUtils commonUtils) {
        this.filterService = filterService;
        this.commonUtils = commonUtils;
    }

    /**
     * Creates a new filter for the authenticated user and a specified tree.
     */
    @PostMapping("/create")
    public ResponseEntity<Filter> createFilter(@Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @RequestParam String treeId ,@Valid @RequestBody FilterRequestDTO filterRequestDTO) {
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        Filter createdFilter = filterService.createFilter(currentUser.getElementId(), treeId, filterRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFilter);
    }

    /**
     * Gets all filters for the currently authenticated user.
     */
    @GetMapping("/")
    public ResponseEntity<List<Filter>> getFilters(@Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @RequestParam String treeId ) {
        User currentUser = commonUtils.getCurrentAuthenticatedUser();
        List<Filter> filters = filterService.getFilters(currentUser.getElementId(), treeId);
        return ResponseEntity.ok(filters);
    }



    /**
     * Gets a specific filter by its ID.
     * Note: Consider adding user ownership check here or rely on service layer if it does.
     * For now, assuming service layer might not check ownership for a direct GET by ID if IDs are unique.
     */
    @GetMapping("/{filterId}")
    public ResponseEntity<Filter> getFilterById(@Parameter(description = "Filter Id of a filter", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")@PathVariable String filterId) { // Changed Long to String
        // Optional: Add ownership check here or ensure service does it if filters are not public.
        // Long userNodeId = userNodeIdResolver.getUserNodeId(authentication);
        // filterService.getFilterByIdAndUser(filterId, userNodeId) // Would need service method adjustment
        return filterService.getFilterById(filterId) // Service now expects String
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates an existing filter.
     */
    @PatchMapping("/{filterId}")
    public ResponseEntity<Filter> updateFilter(@Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @PathVariable String filterId, // Changed Long to String
                                               @Valid @RequestBody FilterUpdateRequestDTO updateRequestDTO) {
        Filter updatedFilter = filterService.updateFilter(filterId, updateRequestDTO); // Service now expects String
        return ResponseEntity.ok(updatedFilter);
    }

    /**
     * Deletes multiple filters.
     * Filters to be deleted must belong to the authenticated user.
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<Void> deleteMultipleFilters(@Valid @RequestBody DeleteFiltersRequestDTO deleteRequestDTO) {
        filterService.deleteMultipleFilters(deleteRequestDTO.getFilterIds());
        return ResponseEntity.noContent().build();
    }
}
