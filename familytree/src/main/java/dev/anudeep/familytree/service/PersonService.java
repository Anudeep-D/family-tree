package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.repository.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PersonService {
    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public Person getPersonById(String elementId) {
        return repository.findByElementId(elementId);
    }

    public Person createPerson(Person person) {
        return repository.save(person);
    }

    public List<Person> getPartners(String elementId) {
        return repository.findPartners(elementId);
    }

    public List<Person> getChildren(String elementId) {
        return repository.findChildren(elementId);
    }

    public List<Person> getSiblings(String elementId) {
        return repository.findSiblings(elementId);
    }

    public House getHouse(String elementId) {
        return repository.findHouse(elementId);
    }
}
