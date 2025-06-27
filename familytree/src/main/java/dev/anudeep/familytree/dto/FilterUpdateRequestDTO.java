package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Filter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// For updates, fields are optional, so no @NotNull or @NotBlank at this level.
// Validation can be handled in the service layer if specific fields become mandatory conditionally.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterUpdateRequestDTO {

    private String filterName;

    private Boolean enabled;

    private Filter.FilterBy filterBy;
}
