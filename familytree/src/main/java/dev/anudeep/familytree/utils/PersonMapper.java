package dev.anudeep.familytree.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.model.Education;
import dev.anudeep.familytree.model.Job;
import dev.anudeep.familytree.model.Person;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Date;
import java.util.Map;

public class PersonMapper {

    private static final Logger log = LoggerFactory.getLogger(PersonMapper.class);

    public static Person updatePersonFromDtoData(Person person, Map<String, Object> data, ObjectMapper objectMapper) {
        if (data == null) {
            log.warn("Data map is null, no updates applied to Person {}", person.getElementId());
            return person;
        }

        // Update simple string properties
        if (data.containsKey("name") && data.get("name") instanceof String) {
            person.setName((String) data.get("name"));
        }
        if (data.containsKey("nickName") && data.get("nickName") instanceof String) {
            person.setNickName((String) data.get("nickName"));
        }
        if (data.containsKey("gender") && data.get("gender") instanceof String) {
            person.setGender((String) data.get("gender"));
        }
        if (data.containsKey("currLocation") && data.get("currLocation") instanceof String) {
            person.setCurrLocation((String) data.get("currLocation"));
        }
        if (data.containsKey("character") && data.get("character") instanceof String) {
            person.setCharacter((String) data.get("character"));
        }
        if (data.containsKey("imageUrl") && data.get("imageUrl") instanceof String) {
            person.setImageUrl((String) data.get("imageUrl"));
        }

        // Update boolean isAlive
        if (data.containsKey("isAlive")) {
            Object isAliveValue = data.get("isAlive");
            if (isAliveValue instanceof Boolean) {
                person.setAlive((Boolean) isAliveValue);
            } else if (isAliveValue instanceof String) {
                String isAliveStr = (String) isAliveValue;
                if ("Yes".equalsIgnoreCase(isAliveStr) || "true".equalsIgnoreCase(isAliveStr)) {
                    person.setAlive(true);
                } else if ("No".equalsIgnoreCase(isAliveStr) || "false".equalsIgnoreCase(isAliveStr)) {
                    person.setAlive(false);
                } else {
                    log.warn("Unrecognized string value for isAlive: {} for Person {}", isAliveStr, person.getElementId());
                }
            } else if (isAliveValue != null) {
                log.warn("Unexpected type for isAlive: {} for Person {}", isAliveValue.getClass().getName(), person.getElementId());
            }
        }

        // Update Date fields (dob, doe)
        if (data.containsKey("dob")) {
            Object dobValue = data.get("dob");
            if (dobValue != null) {
                try {
                    person.setDob(objectMapper.convertValue(dobValue, Date.class));
                } catch (IllegalArgumentException e) {
                    log.warn("Could not parse 'dob' field: {} for Person {}. Error: {}", dobValue, person.getElementId(), e.getMessage());
                }
            } else {
                person.setDob(null);
            }
        }
        if (data.containsKey("doe")) {
            Object doeValue = data.get("doe");
            if (doeValue != null) {
                try {
                    person.setDoe(objectMapper.convertValue(doeValue, Date.class));
                } catch (IllegalArgumentException e) {
                    log.warn("Could not parse 'doe' field: {} for Person {}. Error: {}", doeValue, person.getElementId(), e.getMessage());
                }
            } else {
                person.setDoe(null); // Explicitly set to null if key exists but value is null
            }
        }

        // Update Job object
        if (data.containsKey("job")) {
            Object jobData = data.get("job");
            if (jobData instanceof Map) {
                try {
                    person.setJob(objectMapper.convertValue(jobData, Job.class));
                } catch (IllegalArgumentException e) {
                    log.warn("Could not map 'job' field for Person {}. Error: {}", person.getElementId(), e.getMessage());
                    person.setJob(null); // Or handle error differently
                }
            } else if (jobData == null) {
                person.setJob(null);
            } else {
                log.warn("Unexpected type for 'job' data: {} for Person {}", jobData.getClass().getName(), person.getElementId());
                person.setJob(null);
            }
        }

        // Update Education object
        if (data.containsKey("education")) {
            Object educationData = data.get("education");
            if (educationData instanceof Map) {
                try {
                    person.setEducation(objectMapper.convertValue(educationData, Education.class));
                } catch (IllegalArgumentException e) {
                    log.warn("Could not map 'education' field for Person {}. Error: {}", person.getElementId(), e.getMessage());
                    person.setEducation(null); // Or handle error differently
                }
            } else if (educationData == null) {
                person.setEducation(null);
            } else {
                log.warn("Unexpected type for 'education' data: {} for Person {}", educationData.getClass().getName(), person.getElementId());
                person.setEducation(null);
            }
        }
        return person;
    }
}
