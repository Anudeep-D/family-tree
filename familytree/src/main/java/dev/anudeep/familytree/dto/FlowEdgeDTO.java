package dev.anudeep.familytree.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@Getter @Setter
@Schema(description = "Edge representation for React Flow")
@AllArgsConstructor @NoArgsConstructor
public class FlowEdgeDTO {
    private String id;
    private String source;
    private String target;
    private String label;
    private String type = "default";

    public FlowEdgeDTO(String id, String source, String target, String label) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.label = label;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FlowEdgeDTO that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "FlowEdgeDTO{" +
                "id='" + id + '\'' +
                ", source='" + source + '\'' +
                ", target='" + target + '\'' +
                ", label='" + label + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
