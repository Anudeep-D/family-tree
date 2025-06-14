package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.model.Person;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.service.HouseService;
import dev.anudeep.familytree.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Person API", description = "Endpoints for managing persons in the family tree")
@RestController
@RequestMapping("/api/trees/{treeId}/persons")
@CrossOrigin(origins = "*") // Allow frontend requests
public class PersonController {

    private final PersonService personService;
    private final HouseService houseService;
    private final CommonUtils commonUtils;
    public PersonController(PersonService personService,HouseService houseService, CommonUtils commonUtils) {
        this.personService = personService;
        this.houseService = houseService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/{elementId}")
    @Operation(summary = "Get person by elementId")
    public ResponseEntity<Person> getPerson(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Fetching person with elementId {}", elementId);
        return ResponseEntity.ok(personService.getPersonById(elementId));
    }

    @PostMapping
    @Operation(summary = "Create a new person")
    public Person createPerson(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @RequestBody Person person,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Creating person {}", person);
        return personService.createPerson(person);
    }

    @GetMapping("/{elementId}/partners")
    @Operation(summary = "Get partners of a person by elementId")
    public List<Person> getPartners(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve partners of", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Fetching partners of a person with elementId {}", elementId);
        return personService.getPartners(elementId);
    }

    @GetMapping("/{elementId}/children")
    @Operation(summary = "Get children of a person by elementId")
    public List<Person> getChildren(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve children of", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Fetching children of a person with elementId {}", elementId);
        return personService.getChildren(elementId);
    }

    @GetMapping("/{elementId}/siblings")
    @Operation(summary = "Get siblings of a person by elementId")
    public List<Person> getSiblings(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve siblings of person", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Fetching siblings of a person with elementId {}", elementId);
        return personService.getSiblings(elementId);
    }

    @GetMapping("/{elementId}/house")
    @Operation(summary = "Get house of a person by elementId")
    public House getHouse(
            @Parameter(description = "Tree Id of a tree", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the person to retrieve person's house belongs to", required=true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String elementId,
            HttpSession session) {
        commonUtils.accessCheck(treeId,new Role[] {Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("PersonController: Fetching house of a person with elementId {}", elementId);
        return houseService.getHouse(elementId);
    }

}
