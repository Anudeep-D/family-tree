package dev.anudeep.familytree.service;

import dev.anudeep.familytree.model.House;
import dev.anudeep.familytree.repository.HouseRepository;
import org.springframework.stereotype.Service;

@Service
public class HouseService {
    private final HouseRepository repository;

    public HouseService(HouseRepository repository) {
        this.repository = repository;
    }

    public House getHouseById(String elementId) {
        return repository.findByElementId(elementId);
    }

    public House createHouse(House house) {
        return repository.save(house);
    }

}
