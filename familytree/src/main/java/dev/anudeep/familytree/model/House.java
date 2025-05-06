package dev.anudeep.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.Objects;

@Node("House")
@Setter @Getter @AllArgsConstructor @NoArgsConstructor
public class House {
    @Id
    private String elementId;
    private String name;
    private String gods;        //optional
    private String hometown;    //optional
    private String sigil;       //optional
    private String words;       //optional


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof House that)) return false;
        return Objects.equals(elementId, that.elementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(elementId);
    }

    @Override
    public String toString() {
        return "House{" +
                "elementId='" + elementId + '\'' +
                ", name='" + name + '\'' +
                ", gods='" + gods + '\'' +
                ", hometown='" + hometown + '\'' +
                ", words='" + words + '\'' +
                ", sigil='" + sigil + '\'' +
                '}';
    }
}
