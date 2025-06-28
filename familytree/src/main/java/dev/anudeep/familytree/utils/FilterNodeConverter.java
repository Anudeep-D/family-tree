package dev.anudeep.familytree.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dev.anudeep.familytree.model.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

public class FilterNodeConverter {

    private static final Logger log = LoggerFactory.getLogger(FilterNodeConverter.class);
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private FilterNodeConverter() {
        // Private constructor to prevent instantiation
    }

    public static Map<String, Object> filterToFlattenedMap(Filter filter) {
        Map<String, Object> properties = new HashMap<>();
        if (filter == null) {
            return properties;
        }

        properties.put("filterName", filter.getFilterName());
        properties.put("enabled", filter.isEnabled());

        Filter.FilterBy filterBy = filter.getFilterBy();
        if (filterBy != null) {

            if (filterBy.getEdgeTypes() != null) {
                properties.put("filterBy_edgeTypes_"+Constants.BELONGS_REL, filterBy.getEdgeTypes().get(Constants.BELONGS_REL));
                properties.put("filterBy_edgeTypes_"+Constants.MARRIED_REL, filterBy.getEdgeTypes().get(Constants.MARRIED_REL));
                properties.put("filterBy_edgeTypes_"+Constants.PARENT_REL, filterBy.getEdgeTypes().get(Constants.PARENT_REL));
            } else {
                properties.put("filterBy_edgeTypes_"+Constants.BELONGS_REL, null);
                properties.put("filterBy_edgeTypes_"+Constants.MARRIED_REL, null);
                properties.put("filterBy_edgeTypes_"+Constants.PARENT_REL, null);
            }

            if (filterBy.getNodeTypes() != null) {
                properties.put("filterBy_nodeTypes_Person", filterBy.getNodeTypes().get("Person"));
                properties.put("filterBy_nodeTypes_House", filterBy.getNodeTypes().get("House"));
            } else {
                properties.put("filterBy_nodeTypes_Person", null);
                properties.put("filterBy_nodeTypes_House", null);
            }

            Filter.NodeProps nodeProps = filterBy.getNodeProps();
            if (nodeProps != null) {
                Filter.HouseFilter houseFilter = nodeProps.getHouse();
                if (houseFilter != null) {
                    try {
                        properties.put("filterBy_nodeProps_house_selectedHouses",
                                houseFilter.getSelectedHouses() != null ? objectMapper.writeValueAsString(houseFilter.getSelectedHouses()) : null);
                    } catch (JsonProcessingException e) {
                        log.error("Error serializing house_selectedHouses", e);
                        properties.put("filterBy_nodeProps_house_selectedHouses", null);
                    }
                } else {
                    properties.put("filterBy_nodeProps_house_selectedHouses", null);
                }

                Filter.PersonFilter personFilter = nodeProps.getPerson();
                if (personFilter != null) {
                    properties.put("filterBy_nodeProps_person_married", personFilter.getMarried());
                    properties.put("filterBy_nodeProps_person_gender", personFilter.getGender());
                    try {
                        properties.put("filterBy_nodeProps_person_age",
                                personFilter.getAge() != null ? objectMapper.writeValueAsString(personFilter.getAge()) : null);
                    } catch (JsonProcessingException e) {
                        log.error("Error serializing person_age", e);
                        properties.put("filterBy_nodeProps_person_age", null);
                    }
                    properties.put("filterBy_nodeProps_person_bornAfter",
                            personFilter.getBornAfter() == null ? null : ZonedDateTime.ofInstant(personFilter.getBornAfter().toInstant(), ZoneId.of("UTC")));
                    properties.put("filterBy_nodeProps_person_bornBefore",
                            personFilter.getBornBefore() == null ? null : ZonedDateTime.ofInstant(personFilter.getBornBefore().toInstant(), ZoneId.of("UTC")));
                    properties.put("filterBy_nodeProps_person_isAlive", personFilter.getIsAlive());
                    try {
                        properties.put("filterBy_nodeProps_person_jobTypes",
                                personFilter.getJobTypes() != null ? objectMapper.writeValueAsString(personFilter.getJobTypes()) : null);
                        properties.put("filterBy_nodeProps_person_studies",
                                personFilter.getStudies() != null ? objectMapper.writeValueAsString(personFilter.getStudies()) : null);
                        properties.put("filterBy_nodeProps_person_qualifications",
                                personFilter.getQualifications() != null ? objectMapper.writeValueAsString(personFilter.getQualifications()) : null);
                    } catch (JsonProcessingException e) {
                        log.error("Error serializing person lists (jobTypes, studies, qualifications)", e);
                        properties.put("filterBy_nodeProps_person_jobTypes", null);
                        properties.put("filterBy_nodeProps_person_studies", null);
                        properties.put("filterBy_nodeProps_person_qualifications", null);
                    }
                } else {
                    properties.put("filterBy_nodeProps_person_married", null);
                    properties.put("filterBy_nodeProps_person_gender", null);
                    properties.put("filterBy_nodeProps_person_age", null);
                    properties.put("filterBy_nodeProps_person_bornAfter", null);
                    properties.put("filterBy_nodeProps_person_bornBefore", null);
                    properties.put("filterBy_nodeProps_person_isAlive", null);
                    properties.put("filterBy_nodeProps_person_jobTypes", null);
                    properties.put("filterBy_nodeProps_person_studies", null);
                    properties.put("filterBy_nodeProps_person_qualifications", null);
                }
            } else {
                properties.put("filterBy_nodeProps_house_selectedHouses", null);
                properties.put("filterBy_nodeProps_person_married", null);
                properties.put("filterBy_nodeProps_person_gender", null);
                // ... and so on for all personFilter fields
                properties.put("filterBy_nodeProps_person_age", null);
                properties.put("filterBy_nodeProps_person_bornAfter", null);
                properties.put("filterBy_nodeProps_person_bornBefore", null);
                properties.put("filterBy_nodeProps_person_isAlive", null);
                properties.put("filterBy_nodeProps_person_jobTypes", null);
                properties.put("filterBy_nodeProps_person_studies", null);
                properties.put("filterBy_nodeProps_person_qualifications", null);
            }

            Filter.RootPerson rootPerson = filterBy.getRootPerson();
            if (rootPerson != null) {
                try {
                    properties.put("filterBy_rootPerson_person",
                            rootPerson.getPerson() != null ? objectMapper.writeValueAsString(rootPerson.getPerson()) : null);
                } catch (JsonProcessingException e) {
                    log.error("Error serializing rootPerson_person", e);
                    properties.put("filterBy_rootPerson_person", null);
                }
                properties.put("filterBy_rootPerson_onlyImmediate", rootPerson.isOnlyImmediate());
            } else {
                properties.put("filterBy_rootPerson_person", null);
                properties.put("filterBy_rootPerson_onlyImmediate", false); // Or null if appropriate
            }
        } else {
            properties.put("filterBy_edgeTypes_"+Constants.BELONGS_REL, null);
            properties.put("filterBy_edgeTypes_"+Constants.MARRIED_REL, null);
            properties.put("filterBy_edgeTypes_"+Constants.PARENT_REL, null);
            // Nullify all filterBy sub-properties
            properties.put("filterBy_nodeTypes_Person", null);
            properties.put("filterBy_nodeTypes_House", null);
            properties.put("filterBy_nodeProps_house_selectedHouses", null);
            properties.put("filterBy_nodeProps_person_married", null);
            properties.put("filterBy_nodeProps_person_gender", null);
            properties.put("filterBy_nodeProps_person_age", null);
            properties.put("filterBy_nodeProps_person_bornAfter", null);
            properties.put("filterBy_nodeProps_person_bornBefore", null);
            properties.put("filterBy_nodeProps_person_isAlive", null);
            properties.put("filterBy_nodeProps_person_jobTypes", null);
            properties.put("filterBy_nodeProps_person_studies", null);
            properties.put("filterBy_nodeProps_person_qualifications", null);
            properties.put("filterBy_rootPerson_person", null);
            properties.put("filterBy_rootPerson_onlyImmediate", false); // Or null
        }
        return properties;
    }

    public static Filter flattenedMapToFilter(Map<String, Object> flattenedProps, String elementId) {
        Filter filter = new Filter();
        if (flattenedProps == null || flattenedProps.isEmpty()) {
            if (elementId != null) filter.setElementId(elementId);
            return filter;
        }
        filter.setElementId(elementId);

        filter.setFilterName(Objects.toString(flattenedProps.get("filterName"), null));
        Object enabledObj = flattenedProps.get("enabled");
        if (enabledObj instanceof Boolean) {
            filter.setEnabled((Boolean) enabledObj);
        } else if (enabledObj != null) {
            filter.setEnabled(Boolean.parseBoolean(enabledObj.toString()));
        }

        if (flattenedProps.get("filterBy_edgeTypes_"+Constants.BELONGS_REL) instanceof Boolean) {
            filter.getFilterBy().getEdgeTypes().replace(Constants.BELONGS_REL, (Boolean) flattenedProps.get("filterBy_edgeTypes_"+Constants.BELONGS_REL));
        }
        if (flattenedProps.get("filterBy_edgeTypes_"+Constants.MARRIED_REL) instanceof Boolean) {
            filter.getFilterBy().getEdgeTypes().replace(Constants.MARRIED_REL, (Boolean) flattenedProps.get("filterBy_edgeTypes_"+Constants.MARRIED_REL));
        }
        if (flattenedProps.get("filterBy_edgeTypes_"+Constants.PARENT_REL) instanceof Boolean) {
            filter.getFilterBy().getEdgeTypes().replace(Constants.PARENT_REL, (Boolean) flattenedProps.get("filterBy_edgeTypes_"+Constants.PARENT_REL));
        }

        if (flattenedProps.get("filterBy_nodeTypes_Person") instanceof Boolean) {
            filter.getFilterBy().getNodeTypes().replace("Person", (Boolean) flattenedProps.get("filterBy_nodeTypes_Person"));
        }
        if (flattenedProps.get("filterBy_nodeTypes_House") instanceof Boolean) {
            filter.getFilterBy().getNodeTypes().replace("House", (Boolean) flattenedProps.get("filterBy_nodeTypes_House"));
        }

        String selectedHousesJson = Objects.toString(flattenedProps.get("filterBy_nodeProps_house_selectedHouses"), null);
        if (selectedHousesJson != null) {
            try {
                List<Filter.LabelledItem> selectedHouses = objectMapper.readValue(selectedHousesJson, new TypeReference<List<Filter.LabelledItem>>() {});
                filter.getFilterBy().getNodeProps().getHouse().setSelectedHouses(selectedHouses);
            } catch (IOException e) {
                log.error("Error deserializing house_selectedHouses for filterId {}: {}", elementId, e.getMessage());
            }
        }


        if (flattenedProps.get("filterBy_nodeProps_person_married") instanceof Boolean) {
            filter.getFilterBy().getNodeProps().getPerson().setMarried((Boolean) flattenedProps.get("filterBy_nodeProps_person_married"));
        }

        String gender = Objects.toString(flattenedProps.get("filterBy_nodeProps_person_gender"), null);
        filter.getFilterBy().getNodeProps().getPerson().setGender(gender);

        String ageJson = Objects.toString(flattenedProps.get("filterBy_nodeProps_person_age"), null);
        if (ageJson != null) {
            try {
                List<Integer> age = objectMapper.readValue(ageJson, new TypeReference<List<Integer>>() {});
                filter.getFilterBy().getNodeProps().getPerson().setAge(age);
            } catch (IOException e) {
                log.error("Error deserializing person_age for filterId {}: {}", elementId, e.getMessage());
            }
        }

        Object bornAfterObj = flattenedProps.get("filterBy_nodeProps_person_bornAfter");
        if (bornAfterObj instanceof ZonedDateTime) {
            filter.getFilterBy().getNodeProps().getPerson().setBornAfter(Date.from(((ZonedDateTime) bornAfterObj).toInstant()));
        } else if (bornAfterObj instanceof Date) { // Should not happen with current SDN if ZonedDateTime is used
            filter.getFilterBy().getNodeProps().getPerson().setBornAfter((Date) bornAfterObj);
        } else if (bornAfterObj instanceof Long) {
            filter.getFilterBy().getNodeProps().getPerson().setBornAfter(new Date((Long) bornAfterObj));
        }


        Object bornBeforeObj = flattenedProps.get("filterBy_nodeProps_person_bornBefore");
        if (bornBeforeObj instanceof ZonedDateTime) {
            filter.getFilterBy().getNodeProps().getPerson().setBornBefore(Date.from(((ZonedDateTime) bornBeforeObj).toInstant()));
        } else if (bornBeforeObj instanceof Date) {
            filter.getFilterBy().getNodeProps().getPerson().setBornBefore((Date) bornBeforeObj);
        } else if (bornBeforeObj instanceof Long) {
            filter.getFilterBy().getNodeProps().getPerson().setBornBefore(new Date((Long) bornBeforeObj));
        }

        if (flattenedProps.get("filterBy_nodeProps_person_isAlive") instanceof Boolean) {
            filter.getFilterBy().getNodeProps().getPerson().setIsAlive((Boolean) flattenedProps.get("filterBy_nodeProps_person_isAlive"));
        }

        String jobTypesJson = Objects.toString(flattenedProps.get("filterBy_nodeProps_person_jobTypes"), null);
        if (jobTypesJson != null) {
            try {
                List<Filter.GroupedLabelItem> jobTypes = objectMapper.readValue(jobTypesJson, new TypeReference<List<Filter.GroupedLabelItem>>() {
                });
                filter.getFilterBy().getNodeProps().getPerson().setJobTypes(jobTypes);
            } catch (IOException e) {
                log.error("Error deserializing person_jobTypes for filterId {}: {}", elementId, e.getMessage());
            }
        }

        String studiesJson = Objects.toString(flattenedProps.get("filterBy_nodeProps_person_studies"), null);
        if (studiesJson != null) {
            try {
                List<Filter.GroupedLabelItem> studies = objectMapper.readValue(studiesJson, new TypeReference<List<Filter.GroupedLabelItem>>() {
                });
                filter.getFilterBy().getNodeProps().getPerson().setStudies(studies);
            } catch (IOException e) {
                log.error("Error deserializing person_studies for filterId {}: {}", elementId, e.getMessage());
            }
        }

        String qualificationsJson = Objects.toString(flattenedProps.get("filterBy_nodeProps_person_qualifications"), null);
        if (qualificationsJson != null) {
            try {
                List<Filter.GroupedLabelItem> qualifications = objectMapper.readValue(qualificationsJson, new TypeReference<List<Filter.GroupedLabelItem>>() {
                });
                filter.getFilterBy().getNodeProps().getPerson().setQualifications(qualifications);
            } catch (IOException e) {
                log.error("Error deserializing person_qualifications for filterId {}: {}", elementId, e.getMessage());
            }
        }

        String rootPersonJson = Objects.toString(flattenedProps.get("filterBy_rootPerson_person"), null);
        if (rootPersonJson != null) {
            try {
                Filter.LabelledItem person = objectMapper.readValue(rootPersonJson, Filter.LabelledItem.class);
                filter.getFilterBy().getRootPerson().setPerson(person);
            } catch (IOException e) {
                log.error("Error deserializing rootPerson_person for filterId {}: {}", elementId, e.getMessage());
            }
        }

        Object onlyImmediateObj = flattenedProps.get("filterBy_rootPerson_onlyImmediate");
        if (onlyImmediateObj instanceof Boolean) {
            filter.getFilterBy().getRootPerson().setOnlyImmediate((Boolean) onlyImmediateObj);
        } else if (onlyImmediateObj != null) {
            // handle cases where it might be stored as string "true" or "false"
            filter.getFilterBy().getRootPerson().setOnlyImmediate(Boolean.parseBoolean(onlyImmediateObj.toString()));
        }

        return filter;
    }
}
