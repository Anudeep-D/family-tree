package dev.anudeep.familytree.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ADMIN,
    EDITOR,
    VIEWER;

    @JsonCreator
    public static Role fromString(String key) {
        if (key == null) return null;
        try {
            return Role.valueOf(key.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + key);
        }
    }
}
