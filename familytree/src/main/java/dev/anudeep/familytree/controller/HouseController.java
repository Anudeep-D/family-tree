package dev.anudeep.familytree.controller;

import dev.anudeep.familytree.controller.common.CommonUtils;
import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.model.Role;
import dev.anudeep.familytree.service.HouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "House API", description = "Endpoints for managing houses in the family tree")
@RestController
@RequestMapping("/api/trees/{treeId}/houses")
@CrossOrigin(origins = "*") // Allow frontend requests
public class HouseController {

    private final HouseService houseService;
    private final CommonUtils commonUtils;

    public HouseController(HouseService houseService, CommonUtils commonUtils) {
        this.houseService = houseService;
        this.commonUtils = commonUtils;
    }

    @GetMapping("/{elementId}")
    @Operation(summary = "Get house by elementId")
    public House getHouseById(
            @Parameter(description = "Tree Id of a tree", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
            @PathVariable String treeId,
            @Parameter(description = "elementId of the house to retrieve", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:72")
            @PathVariable String elementId,
            HttpSession session) {

        commonUtils.accessCheck(treeId, new Role[]{Role.VIEWER, Role.ADMIN, Role.EDITOR});
        log.info("HouseController: Fetching house elementId {}", elementId);
        return houseService.getHouseById(elementId);
    }

    @PostMapping
    @Operation(summary = "Create a new house")
    public House createHouse(@Parameter(description = "Tree Id of a tree", required = true, example = "4:12979c35-eb38-4bad-b707-8478b11ae98e:45")
                             @PathVariable String treeId, @RequestBody House house, HttpSession session) {
        commonUtils.accessCheck(treeId, new Role[]{Role.EDITOR, Role.ADMIN});
        log.info("HouseController: Creating house {}", house);
        return houseService.createHouse(house);
    }


}
