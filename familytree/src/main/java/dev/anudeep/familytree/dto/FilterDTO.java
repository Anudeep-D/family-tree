package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Filter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterDTO {
    private String elementId;
    private String filterName;
    private Boolean enabled;
    private Filter.FilterBy filterBy; // Changed from String to Filter.FilterBy

    // Optional: Add a constructor to map from Filter model to FilterDTO
    public FilterDTO(Filter filter) {
        this.elementId = filter.getElementId();
        this.filterName = filter.getFilterName();
        this.enabled = filter.isEnabled();
        this.filterBy = filter.getFilterBy();
    }
}
