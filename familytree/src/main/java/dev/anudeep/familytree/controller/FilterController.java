package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.dto.DeleteFiltersRequestDTO;
import dev.anudeep.familytree.dto.FilterRequestDTO;
import dev.anudeep.familytree.dto.FilterUpdateRequestDTO;
import dev.anudeep.familytree.model.Filter;
import dev.anudeep.familytree.model.User;
import dev.anudeep.familytree.service.FilterService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
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
    public ResponseEntity<Filter> createFilter(@Parameter(description = "Tree Id of a tree", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @RequestParam("treeId") String treeId, @Valid @RequestBody FilterRequestDTO filterRequestDTO) {
        try {
            User currentUser = commonUtils.getCurrentAuthenticatedUser();
            Filter createdFilter = filterService.createFilter(currentUser.getElementId(), treeId, filterRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFilter);
        } catch (Exception e) {
            log.error("Failed to create Filter due to {}", e.getMessage(), e); // Log full stack trace
            // Consider a more specific exception if possible, or a generic internal server error.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating filter: " + e.getMessage(), e);
        }
    }

    /**
     * Gets all filters for the currently authenticated user.
     */
    @GetMapping("/")
    public ResponseEntity<List<Filter>> getFilters(@Parameter(description = "Tree Id of a tree", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @RequestParam("treeId") String treeId) {
        try {
            User currentUser = commonUtils.getCurrentAuthenticatedUser();
            List<Filter> filters = filterService.getFilters(currentUser.getElementId(), treeId);
            return ResponseEntity.ok(filters);
        } catch (Exception e) {
            log.error("Failed to create Filter due to {}", e.getMessage(), e); // Log full stack trace
            // Consider a more specific exception if possible, or a generic internal server error.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating filter: " + e.getMessage(), e);
        }
    }


    /**
     * Updates an existing filter.
     */
    @PostMapping("/{filterId}/update")
    public ResponseEntity<Filter> updateFilter(@Parameter(description = "Tree Id of a tree", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45") @PathVariable String filterId, // Changed Long to String
                                               @Valid @RequestBody FilterRequestDTO updateRequestDTO) {
        try {
            log.error("Update the filter {}", filterId); // Log full stack trace
            Filter updatedFilter = filterService.updateFilter(filterId, updateRequestDTO); // Service now expects String
            return ResponseEntity.ok(updatedFilter);
        } catch (Exception e) {
            log.error("Failed to create Filter due to {}", e.getMessage(), e); // Log full stack trace
            // Consider a more specific exception if possible, or a generic internal server error.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating filter: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes multiple filters.
     * Filters to be deleted must belong to the authenticated user.
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleFilters(@Valid @RequestBody DeleteFiltersRequestDTO deleteRequestDTO) {
        try {
            int deleted = filterService.deleteMultipleFilters(deleteRequestDTO.getIds());
            return ResponseEntity.status(HttpStatus.OK).body("deleted filters = "+deleted);
        } catch (Exception e) {
            log.error("Failed to create Filter due to {}", e.getMessage(), e); // Log full stack trace
            // Consider a more specific exception if possible, or a generic internal server error.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating filter: " + e.getMessage(), e);
        }
    }
}
