package dev.anudeep.familytree.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.*;

import java.util.HashSet;
import java.util.Set;

@Node("Project")
@Setter @Getter @AllArgsConstructor
@NoArgsConstructor
public class Project {
    @Id private String elementId;
    private String name;

    @Relationship(type = "ADMIN_FOR", direction = Relationship.Direction.INCOMING) private Set<User> adminUsers = new HashSet<>();
    @Relationship(type = "EDITOR_FOR", direction = Relationship.Direction.INCOMING) private Set<User> editorUsers = new HashSet<>();
    @Relationship(type = "VIEWER_FOR", direction = Relationship.Direction.INCOMING) private Set<User> viewerUsers = new HashSet<>();

    public Project(String name){
        this.name=name;
    }
}