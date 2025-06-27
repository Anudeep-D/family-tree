package dev.anudeep.familytree.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Node("Filter")
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor
@NoArgsConstructor // For Spring Data Neo4j and Jackson
public class Filter {

    @Id
    private String elementId;

    private String filterName;
    private boolean enabled;
    private FilterBy filterBy;

    public Filter(String filterName, boolean enabled, FilterBy filterBy) {
        this.setFilterName(filterName);
        this.setEnabled(enabled);
        this.setFilterBy(filterBy);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterBy {
        private Map<String, Boolean> nodeTypes; // Keys: "Person", "House"
        private NodeProps nodeProps;
        private RootPerson rootPerson;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeProps {
        private HouseFilter house;
        private PersonFilter person;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HouseFilter {
        private List<LabelledItem> selectedHouses;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
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
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RootPerson {
        private LabelledItem person;
        private boolean onlyImmediate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabelledItem {
        private String id;
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupedLabelItem {
        private String id;
        private String label;
        private String group;
    }
}
