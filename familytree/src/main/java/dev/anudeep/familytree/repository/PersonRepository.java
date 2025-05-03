package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.Person;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;

public interface PersonRepository extends Neo4jRepository<Person, Long> {

    // Find partners (undirected relationship)
    @Query("MATCH (p:Person)-[:MARRIED_TO]-(partner:Person) WHERE id(p) = $id RETURN partner")
    List<Person> findPartners(Long id);

    // Find children (directed relationship)
    @Query("MATCH (p:Person)-[:PARENT_OF]->(child:Person) WHERE id(p) = $id RETURN child")
    List<Person> findChildren(Long id);

    // Find house (directed relationship)
    @Query("MATCH (p:Person)-[:BELONGS_TO]->(house:House) WHERE id(p) = $id RETURN child")
    List<Person> findHouse(Long id);
}

