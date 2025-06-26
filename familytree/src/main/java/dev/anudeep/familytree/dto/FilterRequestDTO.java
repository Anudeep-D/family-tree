package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Filter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterRequestDTO {

    @NotBlank(message = "Filter name is mandatory")
    private String filterName;

    @NotNull(message = "Enabled status is mandatory")
    private Boolean enabled;

    @NotNull(message = "FilterBy criteria are mandatory")
    private Filter.FilterBy filterBy;
}
