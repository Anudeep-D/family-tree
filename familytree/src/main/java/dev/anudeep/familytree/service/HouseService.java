package dev.anudeep.familytree.service;

import dev.anudeep.familytree.ErrorHandling.dto.EntityNotFoundException;
import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.repository.HouseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class HouseService {
    private final HouseRepository repository;

    public HouseService(HouseRepository repository) {
        this.repository = repository;
    }

    public House getHouseById(String elementId) {
        log.info("Fetching house with elementId {}", elementId);
        return repository.findByElementId(elementId).orElseThrow(() -> new EntityNotFoundException("House with elementId " + elementId + " not found"));
    }

    public House createHouse(House house) {
        log.info("Create house {}", house);
        return repository.save(house);
    }

}
