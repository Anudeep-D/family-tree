package dev.anudeep.familytree.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.*;

@Node("Filter")
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Filter {

    @Id
    private String elementId;

    private String filterName = null;
    private boolean enabled = false;
    private FilterBy filterBy = new FilterBy();

    public Filter(String filterName, boolean enabled, FilterBy filterBy) {
        this.filterName = filterName;
        this.enabled = enabled;
        this.filterBy = filterBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterBy {
        private Map<String, Boolean> nodeTypes = new HashMap<String, Boolean>() {{
            put("Person", true);
            put("House", true);
        }};
        private NodeProps nodeProps = new NodeProps();
        private RootPerson rootPerson = new RootPerson();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeProps {
        private HouseFilter house = new HouseFilter();
        private PersonFilter person = new PersonFilter();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HouseFilter {
        private List<LabelledItem> selectedHouses = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonFilter {
        private Boolean married = null;
        private String gender = null;
        private List<Integer> age = Arrays.asList(0, 100);
        private Date bornAfter = null;
        private Date bornBefore = null;
        private Boolean isAlive = null;
        private List<GroupedLabelItem> jobTypes = new ArrayList<>();
        private List<GroupedLabelItem> studies = new ArrayList<>();
        private List<GroupedLabelItem> qualifications = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RootPerson {
        private LabelledItem person = null;
        private boolean onlyImmediate = false;
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
