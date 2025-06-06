package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.utils.Constants;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;

public interface GraphRepository extends Neo4jRepository<Person, String> {

    // Find immediate family (undirected relationship)
    @Query("MATCH (p:Person)-[:"+ Constants.MARRIED_REL +"]-(partner:Person) WHERE elementId(p) = $elementId RETURN DISTINCT partner")
    List<Person> findFamily(String elementId);

}

