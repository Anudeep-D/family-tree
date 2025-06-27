package dev.anudeep.familytree.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DeleteFiltersRequestDTO {
    @NotEmpty(message = "List of filter IDs cannot be empty.")
    private List<String> filterIds; // Changed from List<Long> to List<String>
}
