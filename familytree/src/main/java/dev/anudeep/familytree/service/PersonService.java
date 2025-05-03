package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.repository.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonService {
    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public Person getPersonById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Person createPerson(Person person) {
        return repository.save(person);
    }

    public List<Person> getPartners(Long id) {
        return repository.findPartners(id);
    }

    public List<Person> getChildren(Long id) {
        return repository.findChildren(id);
    }

    public List<Person> getHouse(Long id) {
        return repository.findHouse(id);
    }
}
