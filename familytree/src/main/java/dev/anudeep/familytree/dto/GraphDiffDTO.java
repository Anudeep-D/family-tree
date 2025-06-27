package dev.anudeep.familytree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphDiffDTO {
    private List<FlowNodeDTO> addedNodes;
    private List<FlowNodeDTO> updatedNodes;
    private List<String> deletedNodeIds;
    private List<FlowEdgeDTO> addedEdges;
    private List<FlowEdgeDTO> updatedEdges;
    private List<String> deletedEdgeIds;
}
