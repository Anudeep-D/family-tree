package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Person API", description = "Endpoints for managing persons in the family tree")
@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "*") // Allow frontend requests
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get person by ID")
    public Person getPerson(
            @Parameter(description = "ID of the person to retrieve", required=true, example = "42")
            @PathVariable Long id) {
        return personService.getPersonById(id);
    }

    @PostMapping
    @Operation(summary = "Create a new person")
    public Person createPerson(@RequestBody Person person) {
        return personService.createPerson(person);
    }

    @GetMapping("/{id}/partners")
    @Operation(summary = "Get partners of a person by ID")
    public List<Person> getPartners(
            @Parameter(description = "ID of the person to retrieve partners of", required=true, example = "42")
            @PathVariable Long id) {
        return personService.getPartners(id);
    }

    @GetMapping("/{id}/children")
    @Operation(summary = "Get children of a person by ID")
    public List<Person> getChildren(
            @Parameter(description = "ID of the person to retrieve children of", required=true, example = "42")
            @PathVariable Long id) {
        return personService.getChildren(id);
    }

    @GetMapping("/{id}/house")
    @Operation(summary = "Get house of a person by ID")
    public List<Person> getHouse(
            @Parameter(description = "ID of the person to retrieve house person belongs to", required=true, example = "42")
            @PathVariable Long id) {
        return personService.getHouse(id);
    }
}
