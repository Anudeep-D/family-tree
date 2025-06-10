package dev.anudeep.familytree.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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

    @JsonValue
    public String toValue() {
        return name().toLowerCase(); // Will return "admin", "editor", or "viewer"
    }
}
