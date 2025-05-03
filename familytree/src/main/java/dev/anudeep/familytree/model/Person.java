package dev.anudeep.familytree.model;

import org.springframework.data.neo4j.core.schema.*;

import java.util.List;

@Node("Person")
public class Person {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String gender;

    private String house;
    private String nickName;

    @Relationship(type = "PARENT_OF", direction = Relationship.Direction.OUTGOING)
    private List<Person> children;

    @Relationship(type = "MARRIED_TO", direction = Relationship.Direction.OUTGOING)
    private List<Person> partners;

    @Relationship(type = "BELONGS_TO", direction = Relationship.Direction.OUTGOING)
    private List<House> houses;

    // Constructors
    public Person() {}

    public Person(String name, String gender, String house, String nickName) {
        this.name = name;
        this.gender = gender;
        this.house = house;
        this.nickName = nickName;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getHouse() {
        return house;
    }

    public void setHouse(String house) {
        this.house = house;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public List<Person> getChildren() {
        return children;
    }

    public void setChildren(List<Person> children) {
        this.children = children;
    }

    public List<Person> getPartners() {
        return partners;
    }

    public void setPartners(List<Person> partners) {
        this.partners = partners;
    }

    public List<House> getHouses() {
        return houses;
    }

    public void setHouses(List<House> houses) {
        this.houses = houses;
    }
}
