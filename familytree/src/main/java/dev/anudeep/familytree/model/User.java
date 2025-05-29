package dev.anudeep.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

@Node("User")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String elementId;
    private String email;
    private String name;
    private String picture;

    @Relationship(type = "ADMIN_FOR", direction = Relationship.Direction.OUTGOING)
    private transient Set<Project> adminProjects = new HashSet<>();
    @Relationship(type = "EDITOR_FOR", direction = Relationship.Direction.OUTGOING)
    private transient Set<Project> editorProjects = new HashSet<>();
    @Relationship(type = "VIEWER_FOR", direction = Relationship.Direction.OUTGOING)
    private transient Set<Project> viewerProjects = new HashSet<>();

    public User(String email, String name, String picture) {
        this.email = email;
        this.name = name;
        this.picture = picture;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof User user))
            return false;
        return Objects.equals(elementId, user.elementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(elementId);
    }

    @Override
    public String toString() {
        return "User{" +
                "elementId='" + elementId + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", picture='" + picture + '\'' +
                '}';
    }
}