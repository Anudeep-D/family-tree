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
public class FilterDTO {
    private String elementId;
    private String filterName;
    private Boolean enabled;
    private String filterBy;
}
