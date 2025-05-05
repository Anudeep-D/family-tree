package dev.anudeep.familytree.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter @Setter
@Schema(description = "Graph representation for React Flow")
@AllArgsConstructor @NoArgsConstructor
public class FlowGraphDTO {
    private List<FlowNodeDTO> nodes;
    private List<FlowEdgeDTO> edges;

    @Override
    public String toString() {
        return "FlowGraphDTO {\n" +
                "  nodes=" + nodes + ",\n" +
                "  edges=" + edges + "\n" +
                '}';
    }
}
