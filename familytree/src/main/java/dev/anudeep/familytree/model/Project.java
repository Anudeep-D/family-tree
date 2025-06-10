package dev.anudeep.familytree.model;


import dev.anudeep.familytree.utils.Constants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Node("Project")
@Setter @Getter @AllArgsConstructor
@NoArgsConstructor
public class Project implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String elementId;
    private String name;
    private String desc;
    private String createdAt;
    private String createdBy;
    private transient String access;

    @Relationship(type = Constants.ADMIN_REL, direction = Relationship.Direction.INCOMING)
    private transient Set<User> adminUsers = new HashSet<>();
    @Relationship(type = Constants.EDITOR_REL, direction = Relationship.Direction.INCOMING)
    private transient Set<User> editorUsers = new HashSet<>();
    @Relationship(type = Constants.VIEWER_REL, direction = Relationship.Direction.INCOMING)
    private transient Set<User> viewerUsers = new HashSet<>();

    public Project(String name, String desc, String createdAt, String createdBy){
        this.name=name;
        this.desc = desc;
        this.createdAt = (String) Objects.requireNonNullElseGet(createdAt, Date::new);
        this.createdBy = createdBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Project project))
            return false;
        return Objects.equals(elementId, project.elementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(elementId);
    }

    @Override
    public String toString() {
        return "Project{" +
                "elementId='" + elementId + '\'' +
                ", name='" + name + '\'' +
                ", desc='" + desc + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", createdBy='" + createdBy + '\'' +
                '}';
    }
}