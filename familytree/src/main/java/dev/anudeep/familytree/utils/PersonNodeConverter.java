package dev.anudeep.familytree.utils;

import dev.anudeep.familytree.model.Education;
import dev.anudeep.familytree.model.Job;
import dev.anudeep.familytree.model.Person;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class PersonNodeConverter {

    private PersonNodeConverter() {
        // Private constructor to prevent instantiation
    }

    public static Map<String, Object> personToFlattenedMap(Person person) {
        Map<String, Object> properties = new HashMap<>();
        if (person == null) {
            return properties;
        }

        properties.put("name", person.getName());
        properties.put("gender", person.getGender());
        properties.put("nickName", person.getNickName());
        properties.put("isAlive", person.getIsAlive());
        properties.put("dob", person.getDob() == null ? null : ZonedDateTime.ofInstant(person.getDob().toInstant(), ZoneId.of("UTC")));
        properties.put("doe", person.getDoe() == null ? null : ZonedDateTime.ofInstant(person.getDoe().toInstant(), ZoneId.of("UTC")));
        properties.put("currLocation", person.getCurrLocation());
        properties.put("character", person.getCharacter());
        properties.put("imageUrl", person.getImageUrl());

        Job job = person.getJob();
        if (job != null) {
            properties.put("job_jobType", job.getJobType());
            properties.put("job_employer", job.getEmployer());
            properties.put("job_jobTitle", job.getJobTitle());
        } else {
            properties.put("job_jobType", null);
            properties.put("job_employer", null);
            properties.put("job_jobTitle", null);
        }

        Education education = person.getEducation();
        if (education != null) {
            properties.put("education_fieldOfStudy", education.getFieldOfStudy());
            properties.put("education_highestQualification", education.getHighestQualification());
            properties.put("education_institution", education.getInstitution());
            properties.put("education_location", education.getLocation());
        } else {
            properties.put("education_fieldOfStudy", null);
            properties.put("education_highestQualification", null);
            properties.put("education_institution", null);
            properties.put("education_location", null);
        }

        return properties;
    }

    public static Person flattenedMapToPerson(Map<String, Object> flattenedProps, String elementId) {
        Person person = new Person();
        if (flattenedProps == null) {
            // Optionally set elementId even if props are null, or handle error
            if (elementId != null) person.setElementId(elementId);
            return person;
        }
        person.setElementId(elementId);

        person.setName(Objects.toString(flattenedProps.get("name"), null));
        person.setGender(Objects.toString(flattenedProps.get("gender"), null));
        person.setNickName(Objects.toString(flattenedProps.get("nickName"), null));
        person.setIsAlive(Objects.toString(flattenedProps.get("isAlive"), null));

        Object dobObj = flattenedProps.get("dob");
        if (dobObj instanceof ZonedDateTime) {
            person.setDob(Date.from(((ZonedDateTime) dobObj).toInstant()));
        } else if (dobObj instanceof Date) {
            person.setDob((Date) dobObj);
        } else if (dobObj instanceof Long) {
            person.setDob(new Date((Long) dobObj));
        } // Add more specific date parsing if Neo4j returns strings in a certain format

        Object doeObj = flattenedProps.get("doe");
        if (doeObj instanceof ZonedDateTime) {
            person.setDoe(Date.from(((ZonedDateTime) doeObj).toInstant()));
        } else if (doeObj instanceof Date) {
            person.setDoe((Date) doeObj);
        } else if (doeObj instanceof Long) {
            person.setDoe(new Date((Long) doeObj));
        } // Add more specific date parsing

        person.setCurrLocation(Objects.toString(flattenedProps.get("currLocation"), null));
        person.setCharacter(Objects.toString(flattenedProps.get("character"), null));
        person.setImageUrl(Objects.toString(flattenedProps.get("imageUrl"), null));

        String jobType = Objects.toString(flattenedProps.get("job_jobType"), null);
        String employer = Objects.toString(flattenedProps.get("job_employer"), null);
        String jobTitle = Objects.toString(flattenedProps.get("job_jobTitle"), null);
        if (jobType != null || employer != null || jobTitle != null) {
            person.setJob(new Job(jobType, employer, jobTitle));
        }

        String fieldOfStudy = Objects.toString(flattenedProps.get("education_fieldOfStudy"), null);
        String highestQualification = Objects.toString(flattenedProps.get("education_highestQualification"), null);
        String institution = Objects.toString(flattenedProps.get("education_institution"), null);
        String educationLocation = Objects.toString(flattenedProps.get("education_location"), null);
        if (fieldOfStudy != null || highestQualification != null || institution != null || educationLocation != null) {
            person.setEducation(new Education(fieldOfStudy, highestQualification, institution, educationLocation));
        }

        return person;
    }
}
