package dev.anudeep.familytree.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class DeleteFiltersRequestDTO {
    @NotEmpty(message = "List of filter IDs cannot be empty.")
    private List<String> filterIds; // Changed from List<Long> to List<String>
}
