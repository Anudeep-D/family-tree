package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.repository.PersonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
public class PersonService {
    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public Person getPersonById(String elementId) {
        log.info("Fetching person with elementId {}", elementId);
        return repository.findByElementId(elementId).orElseThrow(() -> new EntityNotFoundException("Person with elementId " + elementId + " not found"));
    }

    @Transactional
    public Person createPerson(Person person) {
        log.info("Create person {}", person);
        return repository.save(person);
    }

    public List<Person> getPartners(String elementId) {
        log.info("Fetching partners of a person with elementId {}", elementId);
        return repository.findPartners(elementId);
    }

    public List<Person> getChildren(String elementId) {
        log.info("Fetching children of a person with elementId {}", elementId);
        return repository.findChildren(elementId);
    }

    public List<Person> getSiblings(String elementId) {
        log.info("Fetching siblings of a person with elementId {}", elementId);
        return repository.findSiblings(elementId);
    }

    public House getHouse(String elementId) {
        log.info("Fetching house of a person with elementId {}", elementId);
        return repository.findHouse(elementId).orElseThrow(() -> new EntityNotFoundException("House with elementId " + elementId + " not found"));
    }
}
