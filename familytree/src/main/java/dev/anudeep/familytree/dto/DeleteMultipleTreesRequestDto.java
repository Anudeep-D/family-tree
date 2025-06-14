package dev.anudeep.familytree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@NoArgsConstructor // Needed for deserialization
@AllArgsConstructor // Optional, but can be useful
public class DeleteMultipleTreesRequestDto {
    private List<String> ids;
}
