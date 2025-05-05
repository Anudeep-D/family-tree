package dev.anudeep.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.*;

import java.util.Date;
import java.util.List;

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

    @Relationship(type = "PARENT_OF", direction = Relationship.Direction.OUTGOING)
    private List<Person> children;

    @Relationship(type = "MARRIED_TO", direction = Relationship.Direction.OUTGOING)
    private List<Person> partners;

    @Relationship(type = "BELONGS_TO", direction = Relationship.Direction.OUTGOING)
    private House house;

}
