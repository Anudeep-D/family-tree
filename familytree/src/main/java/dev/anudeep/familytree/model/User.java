package dev.anudeep.familytree.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

@Node("User")
@Setter @Getter @AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private String elementId;
    private String email;
    private String name;
    private String picture;

    @Relationship(type = "ADMIN_FOR", direction = Relationship.Direction.OUTGOING) private Set<Project> adminProjects = new HashSet<>();
    @Relationship(type = "EDITOR_FOR", direction = Relationship.Direction.OUTGOING) private Set<Project> editorProjects = new HashSet<>();
    @Relationship(type = "VIEWER_FOR", direction = Relationship.Direction.OUTGOING) private Set<Project> viewerProjects = new HashSet<>();

    public User(String email, String name, String picture){
        this.email=email;
        this.name=name;
        this.picture=picture;
    }
}