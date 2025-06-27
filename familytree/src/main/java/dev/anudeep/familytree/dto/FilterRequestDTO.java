package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Filter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterRequestDTO {

    @NotBlank(message = "Filter name is mandatory")
    private String filterName = null;

    @NotNull(message = "Enabled status is mandatory")
    private Boolean enabled = false;

    @NotNull(message = "FilterBy criteria are mandatory")
    private Filter.FilterBy filterBy = new Filter.FilterBy();
}
