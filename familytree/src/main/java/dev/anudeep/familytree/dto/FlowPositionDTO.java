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
@Schema(description = "Position representation for React Flow")
@AllArgsConstructor @NoArgsConstructor
public class FlowPositionDTO {
    private double x;
    private double y;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FlowPositionDTO that)) return false;
        return Double.compare(that.x, x) == 0 &&
                Double.compare(that.y, y) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "[" + x + ", " + y + "]";
    }
}