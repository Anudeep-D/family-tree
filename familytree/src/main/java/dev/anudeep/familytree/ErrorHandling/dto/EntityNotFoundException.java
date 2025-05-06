package dev.anudeep.familytree.ErrorHandling.dto;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}