package dev.anudeep.familytree.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.dto.*;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.utils.Constants;
import dev.anudeep.familytree.utils.PersonNodeConverter;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.types.Node;
import org.neo4j.driver.types.Relationship;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
public class GraphService {
    private final ObjectMapper objectMapper;
    @Autowired
    private Neo4jClient neo4jClient;

    public GraphService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public FlowGraphDTO getGraph(String treeId) {
        Set<FlowNodeDTO> nodes = new HashSet<>();
        Set<FlowEdgeDTO> edges = new HashSet<>();
        String cypher = String.format("""
                MATCH (m:Person | House)-[:%s]->(proj:Tree)
                WHERE elementId(proj) = $treeId
                OPTIONAL MATCH (m)-[r:%s|%s|%s]->(n)
                RETURN n, r, m
                """, Constants.PART_OF, Constants.MARRIED_REL, Constants.PARENT_REL, Constants.BELONGS_REL);
        log.info("Cypher to get the full graph: \n {}", cypher);
        neo4jClient.query(cypher).bind(treeId).to("treeId").fetch()
                .all()
                .forEach(row -> {
                    Node node = (Node) row.get("n");
                    Node target = (Node) row.get("m");
                    Relationship rel = (Relationship) row.get("r");
                    addNode(node, nodes);
                    addNode(target, nodes);
                    addEdge(rel, edges);
                });
        log.info("Graph generated with {} nodes and {} edges", nodes.size(), edges.size());
        return new FlowGraphDTO(new ArrayList<>(nodes), new ArrayList<>(edges));
    }

    private void addNode(Node obj, Set<FlowNodeDTO> nodes) {
        Optional<Node> n = Optional.ofNullable(obj);
        if (n.isPresent()) {
            Node node = n.get();
            String id = node.elementId();
            String name = node.get("name").asString("");
            String type = node.labels().iterator().next();

            if ("Person".equalsIgnoreCase(type)) {
                try {
                    // String id, name, type are already defined before this block
                    Person person = PersonNodeConverter.flattenedMapToPerson(new HashMap<>(node.asMap()), id);
                    Map<String, Object> dataForDto = objectMapper.convertValue(person, new TypeReference<Map<String, Object>>() {
                    });
                    FlowNodeDTO flowNode = new FlowNodeDTO(id, name, type, dataForDto, new FlowPositionDTO());
                    nodes.add(flowNode);
                } catch (Exception e) {
                    log.error("Error processing Person node ID={} for addNode: {}. Falling back to raw properties.", id, e.getMessage());
                    FlowNodeDTO flowNode = new FlowNodeDTO(id, name, type, new HashMap<>(node.asMap()), new FlowPositionDTO());
                    nodes.add(flowNode);
                }
            } else {
                // For non-Person nodes, keep the existing behavior
                FlowNodeDTO flowNode = new FlowNodeDTO(id, name, type, new HashMap<>(node.asMap()), new FlowPositionDTO());
                nodes.add(flowNode);
            }
        }
    }

    private void addEdge(Relationship obj, Set<FlowEdgeDTO> edges) {
        Optional<Relationship> rel = Optional.ofNullable(obj);
        if (rel.isPresent()) {
            Relationship relation = rel.get();
            String srcId = relation.startNodeElementId();
            String tgtId = relation.endNodeElementId();
            String edgeId = relation.elementId();
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, relation.type(), relation.asMap());
            // log.info("edge identified {}",flowEdge);
            edges.add(flowEdge);
        }
    }

    public FlowGraphDTO getFamilyTree(String elementId, boolean isImmediate) {
        String depthRange = isImmediate ? "1..1" : "1..";

        String cypher = String.format("""
                        MATCH (root:Person)
                        WHERE elementId(root) = $elementId
                        
                        // Root <-> Spouse
                        OPTIONAL MATCH (root)-[spouseRel:%s]-(spouse:Person)
                        
                        // Root -> Descendants
                        OPTIONAL MATCH path=(root)-[descendantRel:%s*%s]->(descendant:Person)
                        
                        // Descendant <-> Spouse
                        OPTIONAL MATCH (descendant)-[descendantSpouseRel:%s]-(descendantSpouse:Person)
                        
                        // Houses for all persons
                        OPTIONAL MATCH (root)-[rootHouseRel:%s]-(rootHouse:House)
                        OPTIONAL MATCH (spouse)-[spouseHouseRel:%s]-(spouseHouse:House)
                        OPTIONAL MATCH (descendant)-[descendantHouseRel:%s]-(descendantHouse:House)
                        OPTIONAL MATCH (descendantSpouse)-[descSpouseHouseRel:%s]-(descSpouseHouse:House)
                        
                        RETURN DISTINCT
                            root,
                            spouse,
                            descendant,
                            descendantSpouse,
                            spouseRel,
                            descendantRel,
                            descendantSpouseRel,
                            rootHouse,
                            spouseHouse,
                            descendantHouse,
                            descSpouseHouse,
                            rootHouseRel,
                            spouseHouseRel,
                            descendantHouseRel,
                            descSpouseHouseRel
                        """,
                Constants.MARRIED_REL,       // %s → spouseRel
                Constants.PARENT_REL,        // %s → descendantRel
                depthRange,                  // %s → depth range
                Constants.MARRIED_REL,       // %s → descendantSpouseRel
                Constants.BELONGS_REL,       // %s → rootHouseRel
                Constants.BELONGS_REL,       // %s → spouseHouseRel
                Constants.BELONGS_REL,       // %s → descendantHouseRel
                Constants.BELONGS_REL        // %s → descSpouseHouseRel
        );


        log.info("Cypher to fetch family tree:\n {}", cypher);
        Set<FlowNodeDTO> nodes = new HashSet<>();
        Set<FlowEdgeDTO> edges = new HashSet<>();
        neo4jClient.query(cypher)
                .bind(elementId).to("elementId")
                .fetch()
                .all()
                .forEach(row -> {
                    addPersonNode((Node) row.get("root"), nodes);
                    addPersonNode((Node) row.get("spouse"), nodes);
                    addPersonNode((Node) row.get("descendant"), nodes);
                    addPersonNode((Node) row.get("descendantSpouse"), nodes);

                    addNode((Node) row.get("rootHouse"), nodes);
                    addNode((Node) row.get("spouseHouse"), nodes);
                    addNode((Node) row.get("descendantHouse"), nodes);
                    addNode((Node) row.get("descSpouseHouse"), nodes);

                    addEdge((Relationship) row.get("spouseRel"), edges);
                    List<Relationship> descendantRelList = (List<Relationship>) row.get("descendantRel");
                    if (descendantRelList != null && !descendantRelList.isEmpty()) {
                        addEdge(descendantRelList.get(0), edges); // Only use the first relation
                    }
                    addEdge((Relationship) row.get("descendantSpouseRel"), edges);

                    addEdge((Relationship) row.get("rootHouseRel"), edges);
                    addEdge((Relationship) row.get("spouseHouseRel"), edges);
                    addEdge((Relationship) row.get("descendantHouseRel"), edges);
                    addEdge((Relationship) row.get("descSpouseHouseRel"), edges);
                });

        log.info("Graph generated with {} nodes and {} edges", nodes.size(), edges.size());
        return new FlowGraphDTO(new ArrayList<>(nodes), new ArrayList<>(edges));
    }

    private void addPersonNode(Node personNode, Set<FlowNodeDTO> nodes) {
        if (personNode == null) {
            return; // Or handle as appropriate if null nodes shouldn't occur here
        }

        String id = personNode.elementId();
        String name = personNode.get("name").asString("");
        // String type = personNode.labels().iterator().next(); // Should always be "Person"

        try {
            // String id, name are already defined
            Person person = PersonNodeConverter.flattenedMapToPerson(new HashMap<>(personNode.asMap()), id);
            Map<String, Object> dataForDto = objectMapper.convertValue(person, new TypeReference<Map<String, Object>>() {
            });
            FlowNodeDTO flowNode = new FlowNodeDTO(id, name, "Person", dataForDto, new FlowPositionDTO()); // Type is "Person"
            nodes.add(flowNode);
        } catch (Exception e) {
            log.error("Error processing Person node ID={} in addPersonNode: {}. Falling back to raw properties.", id, e.getMessage());
            Map<String, Object> fallbackData = new HashMap<>(personNode.asMap());
            // Ensure name is in fallback, though it's also passed to FlowNodeDTO constructor
            fallbackData.putIfAbsent("name", name);
            FlowNodeDTO flowNode = new FlowNodeDTO(id, name, "Person", fallbackData, new FlowPositionDTO());
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
            Map<String, Object> data = Map.of("label", Constants.MARRIED_REL);
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, Constants.MARRIED_REL, data);
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, Constants.MARRIED_REL, data);
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) { //clog.info("MARRIED_TO edge identified {}",flowEdge);
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
            Map<String, Object> data = Map.of("label", Constants.PARENT_REL);
            FlowEdgeDTO flowEdge = new FlowEdgeDTO(edgeId, srcId, tgtId, Constants.PARENT_REL, data);
            FlowEdgeDTO reverseFlowEdge = new FlowEdgeDTO(reverseEdgeId, tgtId, srcId, Constants.PARENT_REL, data);
            // Prevent duplicates
            if (!edges.contains(flowEdge) && !edges.contains(reverseFlowEdge)) {
                // log.info("PARENT_OF edge identified {}",flowEdge);
                edges.add(flowEdge);
            }
        }
    }

    @Transactional
    public void updateGraph(String treeId, GraphDiffDTO diff) {
        log.info("Starting graph update for treeId: {}", treeId);
        Map<String, String> dummyToActualNodeIdMap = new HashMap<>();

        // Process Added Nodes
        if (diff.getAddedNodes() != null) {
            for (FlowNodeDTO nodeDTO : diff.getAddedNodes()) {
                log.info("Adding node: ID_DUMMY={} TYPE={} DATA={}", nodeDTO.getId(), nodeDTO.getType(), nodeDTO.getData());
                String nodeLabel = (nodeDTO.getType() != null && !nodeDTO.getType().trim().isEmpty()) ? nodeDTO.getType() : "Person";

                Map<String, Object> propertiesToSave;
                if ("Person".equalsIgnoreCase(nodeLabel)) {
                    Person person = objectMapper.convertValue(nodeDTO.getData(), Person.class);
                    propertiesToSave = PersonNodeConverter.personToFlattenedMap(person);
                } else {
                    propertiesToSave = nodeDTO.getData() != null ? new HashMap<>(nodeDTO.getData()) : new HashMap<>();
                }
                propertiesToSave.remove("id"); // Ensure dummy ID is not saved

                String createNodeCypher =
                        "MATCH (t:Tree) WHERE elementId(t) = $treeId " +
                                "CREATE (n:" + nodeLabel + " $props) " +
                                "CREATE (n)-[:PART_OF]->(t) " +
                                "RETURN elementId(n) as actualId";

                String actualId = neo4jClient.query(createNodeCypher)
                        .bind(treeId).to("treeId").bind(propertiesToSave).to("props")
                        .fetch()
                        .one().orElseThrow().get("actualId").toString();

                dummyToActualNodeIdMap.put(nodeDTO.getId(), actualId);
                log.info("Created node with dummy ID {} as actual ID {}", nodeDTO.getId(), actualId);

                // Link new node to the tree using PART_OF relationship (ensure Constants.PART_OF is defined)
                String linkToTreeCypher = "MATCH (n) WHERE elementId(n) = $actualId " +
                        "MATCH (t:Tree) WHERE elementId(t) = $treeId " +
                        "MERGE (n)-[:" + Constants.PART_OF + "]->(t)";
                neo4jClient.query(linkToTreeCypher)
                        .bind(actualId).to("actualId")
                        .bind(treeId).to("treeId")
                        .run();
                log.info("Linked node {} to tree {}", actualId, treeId);
            }
        }

        // Process Added Edges
        if (diff.getAddedEdges() != null) {
            for (FlowEdgeDTO edgeDTO : diff.getAddedEdges()) {
                String sourceId = dummyToActualNodeIdMap.getOrDefault(edgeDTO.getSource(), edgeDTO.getSource());
                String targetId = dummyToActualNodeIdMap.getOrDefault(edgeDTO.getTarget(), edgeDTO.getTarget());
                String relationshipType = (edgeDTO.getType() != null && !edgeDTO.getType().trim().isEmpty()) ? edgeDTO.getType() : "RELATED_TO";

                Map<String, Object> properties = edgeDTO.getData() != null ? new HashMap<>(edgeDTO.getData()) : new HashMap<>();
                // Remove fields that are not properties of the relationship itself
                properties.remove("id");
                properties.remove("source");
                properties.remove("target");
                properties.remove("type");
                properties.remove("label"); // Often a duplicate of 'type' or used for display

                log.info("Adding edge: DUMMY_ID={} TYPE={} FROM={} TO={} PROPERTIES={}", edgeDTO.getId(), relationshipType, sourceId, targetId, properties);
                String createEdgeCypher = "MATCH (source) WHERE elementId(source) = $sourceId " +
                        "MATCH (target) WHERE elementId(target) = $targetId " +
                        "CREATE (source)-[r:" + relationshipType + " $props]->(target) RETURN elementId(r) as actualId";

                String actualEdgeId = neo4jClient.query(createEdgeCypher)
                        .bind(sourceId).to("sourceId")
                        .bind(targetId).to("targetId")
                        .bind(properties).to("props")
                        .fetch()
                        .one().orElseThrow().get("actualId").toString();
                log.info("Created edge with dummy ID {} as actual ID {}", edgeDTO.getId(), actualEdgeId);
            }
        }

        // Process Updated Nodes
        if (diff.getUpdatedNodes() != null) {
            for (FlowNodeDTO nodeDTO : diff.getUpdatedNodes()) {
                log.info("Updating node: ID={}", nodeDTO.getId());
                // ID for existing nodes is the actual elementId
                String nodeId = nodeDTO.getId();

                Map<String, Object> propertiesToSet;
                if ("Person".equalsIgnoreCase(nodeDTO.getType())) { // Assuming type is reliable
                    Person person = objectMapper.convertValue(nodeDTO.getData(), Person.class);
                    propertiesToSet = PersonNodeConverter.personToFlattenedMap(person);
                } else {
                    propertiesToSet = nodeDTO.getData() != null ? new HashMap<>(nodeDTO.getData()) : new HashMap<>();
                }
                propertiesToSet.remove("id"); // ID for existing nodes is nodeId, not part of SET properties normally.

                // Add position data if available - this must be done AFTER propertiesToSet is initialized
                if (nodeDTO.getPosition() != null) {
                    propertiesToSet.put("x", nodeDTO.getPosition().getX());
                    propertiesToSet.put("y", nodeDTO.getPosition().getY());
                }
                // Node type (label) changes are complex and usually handled by deleting and recreating the node.
                // For simplicity, we are not handling label changes here. We only update properties.
                // If propertiesToSet is empty, Neo4j might remove all properties. Consider this behavior.
                // If you want to only update specific fields, build the SET clause dynamically.

                String updateNodeCypher = "MATCH (n) WHERE elementId(n) = $nodeId SET n += $props";

                neo4jClient.query(updateNodeCypher)
                        .bind(nodeId).to("nodeId")
                        .bind(propertiesToSet).to("props")
                        .run();
                log.info("Updated node with ID {}", nodeId);
            }
        }

        // Process Updated Edges
        if (diff.getUpdatedEdges() != null) {
            for (FlowEdgeDTO edgeDTO : diff.getUpdatedEdges()) {
                log.info("Updating edge: ID={}", edgeDTO.getId());
                // ID for existing edges is the actual elementId
                String edgeId = edgeDTO.getId();

                Map<String, Object> propertiesToUpdate = edgeDTO.getData() != null ? new HashMap<>(edgeDTO.getData()) : new HashMap<>();
                // Remove fields that are not part of edge properties or are immutable
                propertiesToUpdate.remove("id");
                propertiesToUpdate.remove("source");
                propertiesToUpdate.remove("target");
                propertiesToUpdate.remove("type");
                propertiesToUpdate.remove("label");

                // Relationship type changes are not handled here (usually delete and recreate).
                // If propertiesToUpdate is empty, it might clear existing properties.
                String updateEdgeCypher = "MATCH ()-[r]->() WHERE elementId(r) = $edgeId SET r += $props";

                neo4jClient.query(updateEdgeCypher)
                        .bind(edgeId).to("edgeId")
                        .bind(propertiesToUpdate).to("props")
                        .run();
                log.info("Updated edge with ID {}", edgeId);
            }
        }

        // Process Deleted Nodes
        if (diff.getDeletedNodeIds() != null) {
            for (String nodeId : diff.getDeletedNodeIds()) {
                log.info("Deleting node: ID={}", nodeId);
                // Using DETACH DELETE to remove the node and all its relationships
                String deleteNodeCypher = "MATCH (n) WHERE elementId(n) = $nodeId DETACH DELETE n";
                neo4jClient.query(deleteNodeCypher)
                        .bind(nodeId).to("nodeId")
                        .run();
                log.info("Deleted node with ID {}", nodeId);
            }
        }

        // Process Deleted Edges
        if (diff.getDeletedEdgeIds() != null) {
            for (String edgeId : diff.getDeletedEdgeIds()) {
                log.info("Deleting edge: ID={}", edgeId);
                String deleteEdgeCypher = "MATCH ()-[r]->() WHERE elementId(r) = $edgeId DELETE r";
                neo4jClient.query(deleteEdgeCypher)
                        .bind(edgeId).to("edgeId")
                        .run();
                log.info("Deleted edge with ID {}", edgeId);
            }
        }

        log.info("Graph update completed for treeId: {}", treeId);
    }
}
