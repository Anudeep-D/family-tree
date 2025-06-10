package dev.anudeep.familytree.repository;

import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.utils.Constants;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.Optional;


public interface HouseRepository extends Neo4jRepository<House, String> {

    // Find house
    @Query("MATCH (h:House) WHERE elementId(h) = $elementId RETURN h {.*, elementId: elementId(h) } AS house")
    Optional<House> findByElementId(String elementId);

    // Find house (directed relationship)
    @Query("MATCH (p:Person)-[:" + Constants.BELONGS_REL + "]->(house:House) WHERE elementId(p) = $elementId RETURN  DISTINCT house  {.*, elementId: elementId(house) } AS house")
    Optional<House> findHouse(String elementId);

}

