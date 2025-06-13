package dev.anudeep.familytree.model;

import dev.anudeep.familytree.dto.FlowEdgeDTO;
import dev.anudeep.familytree.utils.Constants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.*;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Node("Person")
@Setter @Getter @AllArgsConstructor @NoArgsConstructor
public class Person {

    @Id
    private String elementId;
    private String name;
    private String gender;
    private String nickName;
    private boolean isAlive;
    private Date dob;
    private Date doe;
    private String photo;
    private String qualification;
    private String job;
    private String currLocation;
    private String character; //temporary or optional
    private String imageUrl;

    @Relationship(type = Constants.PARENT_REL, direction = Relationship.Direction.OUTGOING)
    private List<Person> children;

    @Relationship(type = Constants.MARRIED_REL, direction = Relationship.Direction.OUTGOING)
    private List<Person> partners;

    @Relationship(type = Constants.BELONGS_REL, direction = Relationship.Direction.OUTGOING)
    private House house;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person that)) return false;
        return Objects.equals(elementId, that.elementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(elementId);
    }

    @Override
    public String toString() {
        return "Person{" +
                "elementId='" + elementId + '\'' +
                ", name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", nickName='" + nickName + '\'' +
                ", isAlive='" + isAlive + '\'' +
                ", dob='" + dob + '\'' +
                ", doe='" + doe + '\'' +
                ", qualification='" + qualification + '\'' +
                ", job='" + job + '\'' +
                ", currLocation='" + currLocation + '\'' +
                ", character='" + character + '\'' +
                '}';
    }
}
