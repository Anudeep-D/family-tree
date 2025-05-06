package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.House;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.Optional;


public interface HouseRepository extends Neo4jRepository<House, String> {

    // Find house
    @Query("MATCH (h:House) WHERE elementId(h) = $elementId RETURN h {.*, elementId: elementId(h) } AS house")
    Optional<House> findByElementId(String elementId);

}

