package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.model.House;
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

    @GetMapping("/{elementId}")
    @Operation(summary = "Get person by elementId")
    public Person getPerson(
            @Parameter(description = "elementId of the person to retrieve", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        return personService.getPersonById(elementId);
    }

    @PostMapping
    @Operation(summary = "Create a new person")
    public Person createPerson(@RequestBody Person person) {
        return personService.createPerson(person);
    }

    @GetMapping("/{elementId}/partners")
    @Operation(summary = "Get partners of a person by elementId")
    public List<Person> getPartners(
            @Parameter(description = "elementId of the person to retrieve partners of", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        return personService.getPartners(elementId);
    }

    @GetMapping("/{elementId}/children")
    @Operation(summary = "Get children of a person by elementId")
    public List<Person> getChildren(
            @Parameter(description = "elementId of the person to retrieve children of", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        return personService.getChildren(elementId);
    }

    @GetMapping("/{elementId}/siblings")
    @Operation(summary = "Get siblings of a person by elementId")
    public List<Person> getSiblings(
            @Parameter(description = "elementId of the person to retrieve siblings of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        return personService.getSiblings(elementId);
    }

    @GetMapping("/{elementId}/house")
    @Operation(summary = "Get house of a person by elementId")
    public House getHouse(
            @Parameter(description = "elementId of the person to retrieve person's house belongs to", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId) {
        return personService.getHouse(elementId);
    }

}
