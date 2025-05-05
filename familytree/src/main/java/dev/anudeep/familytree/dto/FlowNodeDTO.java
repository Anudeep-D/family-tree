package dev.anudeep.familytree.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Objects;

@Component
@Getter @Setter
@Schema(description = "Node representation for React Flow")
@AllArgsConstructor @NoArgsConstructor
public class FlowNodeDTO {
    private String id;
    private String label;
    private String type;
    private Map<String, Object> data;
    private FlowPositionDTO position;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FlowNodeDTO that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "FlowNodeDTO{" +
                "id='" + id + '\'' +
                ", label='" + label + '\'' +
                ", type='" + type + '\'' +
                ", data=" + data +
                ", position=" + position +
                '}';
    }
}
