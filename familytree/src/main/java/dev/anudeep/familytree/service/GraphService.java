package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.FlowEdgeDTO;
import dev.anudeep.familytree.dto.FlowGraphDTO;
import dev.anudeep.familytree.dto.FlowNodeDTO;
import dev.anudeep.familytree.dto.FlowPositionDTO;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.repository.GraphRepository;
import org.neo4j.driver.types.Node;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {
    private final GraphRepository repository;

    public GraphService(GraphRepository repository) {
        this.repository = repository;
    }

    public List<Person> getFamily(String elementId) {
        return repository.findFamily(elementId);
    }

    @Autowired
    private Neo4jClient neo4jClient;

    public FlowGraphDTO getFamilyTree(String elementId) {
        String cypher = """
            MATCH (root:Person)
            WHERE elementID(root) = $elementId
            // Recursively get spouses and descendants for all generations
            OPTIONAL MATCH (root)-[:MARRIED_TO]-(spouse:Person)
            OPTIONAL MATCH (root)-[:PARENT_OF*1..]->(descendant:Person)
            OPTIONAL MATCH (descendant)-[:MARRIED_TO]-(descendantSpouse:Person)
            // Return all people and relationships
            RETURN DISTINCT root, spouse, descendant, descendantSpouse
        """;

        Set<FlowNodeDTO> nodes = new HashSet<>();
        Set<FlowEdgeDTO> edges = new HashSet<>();
        neo4jClient.query(cypher)
                .bind(elementId).to("elementId")
                .fetch()
                .all()
                .forEach(row -> {
                    addPersonNode(row.get("root"), nodes);
                    addPersonNode(row.get("spouse"), nodes);
                    addPersonNode(row.get("descendant"), nodes);
                    addPersonNode(row.get("descendantSpouse"), nodes);

                    addMarriageEdge(row.get("root"), row.get("spouse"), edges);
                    addParentEdges(row.get("root"), row.get("descendant"), edges);
                    addMarriageEdge(row.get("descendant"), row.get("descendantSpouse"), edges);
                });
        System.out.println("FlowGraphDTO -> "+nodes.size()+", "+edges.size());
        return new FlowGraphDTO(new ArrayList<>(nodes), new ArrayList<>(edges));
    }

    private void addPersonNode(Object obj, Set<FlowNodeDTO> nodes) {
        Optional<Object> node = Optional.ofNullable(obj);
        if (node.isPresent() && node.get() instanceof Node person) {
            String id = person.elementId();
            String name = person.get("name").asString("");
            Map<String, Object> data = Map.of("name", name);
            FlowNodeDTO flowNode = new FlowNodeDTO(id, name, "person", data, new FlowPositionDTO());
            // Prevent duplicates
            nodes.add(flowNode);
        }
    }

    private void addMarriageEdge(Object a, Object b, Set<FlowEdgeDTO> edges) {
        Optional<Object> nodeA = Optional.ofNullable(a);
        Optional<Object> nodeB = Optional.ofNullable(b);
        if (nodeA.isPresent() && nodeA.get() instanceof Node na && nodeB.isPresent() && nodeB.get() instanceof Node nb) {
            String srcId = na.elementId();
            String tgtId = nb.elementId();
            String edgeId = srcId + "_married_" + tgtId;
            String reverseEdgeId = tgtId + "_married_" + srcId;
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, "MARRIED_TO");
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, "MARRIED_TO");
            // Prevent duplicates
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) {
                edges.add(flowEdge);
            }
        }
    }

    private void addParentEdges(Object a, Object b, Set<FlowEdgeDTO> edges) {
        Optional<Object> nodeA = Optional.ofNullable(a);
        Optional<Object> nodeB = Optional.ofNullable(b);
        if (nodeA.isPresent() && nodeA.get() instanceof Node na && nodeB.isPresent() && nodeB.get() instanceof Node nb) {
            String srcId = na.elementId();
            String tgtId = nb.elementId();
            String edgeId = srcId + "_parent_" + tgtId;
            String reverseEdgeId = tgtId + "_parent_" + srcId;
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, "PARENT_OF");
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, "PARENT_OF");
            // Prevent duplicates
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) {
                // System.out.println("parent flowEdge -> "+flowEdge);
                edges.add(flowEdge);
            }
        }
    }

}
