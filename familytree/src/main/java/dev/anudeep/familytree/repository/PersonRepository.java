package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.utils.Constants;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;
import java.util.Optional;


public interface PersonRepository extends Neo4jRepository<Person, String> {

    // Find person
    @Query("MATCH (p:Person) WHERE elementId(p) = $elementId RETURN p {.*, elementId: elementId(p) } AS person")
    Optional<Person> findByElementId(String elementId);

    // Find partners (undirected relationship)
    @Query("MATCH (p:Person)-[:" + Constants.MARRIED_REL + "]-(partner:Person) WHERE elementId(p) = $elementId RETURN DISTINCT partner {.*, elementId: elementId(partner) } AS partner")
    List<Person> findPartners(String elementId);

    // Find children (directed relationship)
    @Query("MATCH (p:Person)-[:" + Constants.PARENT_REL + "]->(child:Person) WHERE elementId(p) = $elementId RETURN DISTINCT child  {.*, elementId: elementId(child) } AS child")
    List<Person> findChildren(String elementId);

    // Find siblings (undirected relationship)
    @Query("MATCH (p:Person)-[:" + Constants.PARENT_REL + "]-(sibling:Person) WHERE elementId(p) = $elementId RETURN DISTINCT sibling  {.*, elementId: elementId(sibling) } AS sibling")
    List<Person> findSiblings(String elementId);
}

