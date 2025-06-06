package dev.anudeep.familytree.service;

import dev.anudeep.familytree.dto.FlowEdgeDTO;
import dev.anudeep.familytree.dto.FlowGraphDTO;
import dev.anudeep.familytree.dto.FlowNodeDTO;
import dev.anudeep.familytree.dto.FlowPositionDTO;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.repository.GraphRepository;
import dev.anudeep.familytree.utils.Constants;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.types.Node;
import org.neo4j.driver.types.Relationship;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
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

    public FlowGraphDTO getGraph() {
        Set<FlowNodeDTO> nodes = new HashSet<>();
        Set<FlowEdgeDTO> edges = new HashSet<>();
        String cypher = """
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN n, r, m
        """;
        AtomicInteger line= new AtomicInteger(1);
        neo4jClient.query(cypher).fetch()
                .all()
                .forEach(row -> {
                    log.info("Row fetched {}", line.getAndIncrement());
                    Node node = (Node) row.get("n");
                    Node target = (Node) row.get("m");
                    Relationship rel = (Relationship) row.get("r");
                    addNode(node,nodes);
                    addNode(target,nodes);
                    addEdge(rel, edges);
                });
        log.info("Graph generated with {} nodes and {} edges",nodes.size(), edges.size());
        return new FlowGraphDTO(new ArrayList<>(nodes), new ArrayList<>(edges));
    }

    private void addNode(Node obj, Set<FlowNodeDTO> nodes) {
        Optional<Node> n = Optional.ofNullable(obj);
        if (n.isPresent()) {
            Node node = n.get();
            String id = node.elementId();
            String name = node.get("name").asString("");
            String type = node.labels().iterator().next();
            Map<String, Object> data = node.asMap();
            FlowNodeDTO flowNode = new FlowNodeDTO(id, name, type, data, new FlowPositionDTO());
            log.info("node identified {}",flowNode);
            nodes.add(flowNode);
        }
    }

    private void addEdge(Relationship obj, Set<FlowEdgeDTO> edges) {
        Optional<Relationship> rel = Optional.ofNullable(obj);
        if (rel.isPresent()) {
            Relationship relation = rel.get();
            String srcId = relation.startNodeElementId();
            String tgtId = relation.endNodeElementId();
            String edgeId = relation.elementId();
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, relation.type());
            if (!edges.contains(flowEdge)) {
                log.info("edge identified {}",flowEdge);
                edges.add(flowEdge);
            }
        }
    }

    public FlowGraphDTO getFamilyTree(String elementId) {
        String cypher = String.format("""
                MATCH (root:Person)
                WHERE elementID(root) = $elementId
                OPTIONAL MATCH (root)-[:%s]-(spouse:Person)
                OPTIONAL MATCH (root)-[:%s*1..]->(descendant:Person)
                OPTIONAL MATCH (descendant)-[:%s]-(descendantSpouse:Person)
                RETURN DISTINCT root, spouse, descendant, descendantSpouse
            """, Constants.MARRIED_REL, Constants.PARENT_REL, Constants.MARRIED_REL);
        log.info("Cypher to fetch family tree:\n {}", cypher);
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

        log.info("Graph generated with {} nodes and {} edges",nodes.size(), edges.size());
        return new FlowGraphDTO(new ArrayList<>(nodes), new ArrayList<>(edges));
    }

    private void addPersonNode(Object obj, Set<FlowNodeDTO> nodes) {
        Optional<Object> node = Optional.ofNullable(obj);
        if (node.isPresent() && node.get() instanceof Node person) {
            String id = person.elementId();
            String name = person.get("name").asString("");
            Map<String, Object> data = Map.of("name", name);
            FlowNodeDTO flowNode = new FlowNodeDTO(id, name, "person", data, new FlowPositionDTO());
            log.info("person node identified {}",flowNode);
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
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, Constants.MARRIED_REL);
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, Constants.MARRIED_REL);
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) {
                log.info("MARRIED_TO edge identified {}",flowEdge);
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
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, Constants.PARENT_REL);
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, Constants.PARENT_REL);
            // Prevent duplicates
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) {
                log.info("PARENT_OF edge identified {}",flowEdge);
                edges.add(flowEdge);
            }
        }
    }

}
