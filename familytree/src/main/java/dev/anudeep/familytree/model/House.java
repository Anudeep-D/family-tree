package dev.anudeep.familytree.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("House")
public class House {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String gods;

    private String hometown;
    private String sigil;
    private String words;

    // Constructors
    public House() {}

    public House(String name, String gods, String hometown, String sigil, String words) {
        this.name = name;
        this.gods = gods;
        this.hometown = hometown;
        this.sigil = sigil;
        this.words = words;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGods() {
        return gods;
    }

    public void setGods(String gods) {
        this.gods = gods;
    }

    public String getHometown() {
        return hometown;
    }

    public void setHometown(String hometown) {
        this.hometown = hometown;
    }

    public String getSigil() {
        return sigil;
    }

    public void setSigil(String sigil) {
        this.sigil = sigil;
    }

    public String getWords() {
        return words;
    }

    public void setWords(String words) {
        this.words = words;
    }
}
