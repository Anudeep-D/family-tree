package dev.anudeep.familytree.model;


import dev.anudeep.familytree.utils.Constants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Node("Project")
@Setter @Getter @AllArgsConstructor
@NoArgsConstructor
public class Project {
    @Id private String elementId;
    private String name;
    private String desc;
    private Date createdAt;
    private User createdBy;
    @Relationship(type = Constants.ADMIN_REL, direction = Relationship.Direction.INCOMING) private Set<User> adminUsers = new HashSet<>();
    @Relationship(type = Constants.EDITOR_REL, direction = Relationship.Direction.INCOMING) private Set<User> editorUsers = new HashSet<>();
    @Relationship(type = Constants.VIEWER_REL, direction = Relationship.Direction.INCOMING) private Set<User> viewerUsers = new HashSet<>();

    public Project(String name, String desc, Date createdAt, User createdBy){
        this.name=name;
        this.desc = desc;
        if(createdAt!=null)
            this.createdAt = createdAt;
        else
            this.createdAt = new Date();
        this.createdBy = createdBy;
    }
}