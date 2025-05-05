package dev.anudeep.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("House")
@Setter @Getter @AllArgsConstructor @NoArgsConstructor
public class House {
    @Id
    @GeneratedValue
    private Long id;
    private String elementId;
    private String name;
    private String gods;        //optional
    private String hometown;    //optional
    private String sigil;       //optional
    private String words;       //optional
}
