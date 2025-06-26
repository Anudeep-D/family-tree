package dev.anudeep.familytree.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Node("Filter")
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor @NoArgsConstructor
public class Filter {
    private String filterName;
    private boolean enabled;
    private FilterBy filterBy;

    @Data
    public static class FilterBy {
        private Map<String, Boolean> nodeTypes; // Keys: "Person", "House"

        private NodeProps nodeProps;

        private RootPerson rootPerson;
    }

    @Data
    public static class NodeProps {
        private HouseFilter house;
        private PersonFilter person;
    }

    @Data
    public static class HouseFilter {
        private List<LabelledItem> selectedHouses;
    }

    @Data
    public static class PersonFilter {
        private Boolean married;
        private String gender; // "male", "female", or null
        private List<Integer> age; // [minAge, maxAge]
        private Date bornAfter;
        private Date bornBefore;
        private Boolean isAlive;
        private List<GroupedLabelItem> jobTypes;
        private List<GroupedLabelItem> studies;
        private List<GroupedLabelItem> qualifications;
    }

    @Data
    public static class RootPerson {
        private LabelledItem person;
        private boolean onlyImmediate;
    }

    @Data
    public static class LabelledItem {
        private String id;
        private String label;
    }

    @Data
    public static class GroupedLabelItem {
        private String id;
        private String label;
        private String group;
    }
}
