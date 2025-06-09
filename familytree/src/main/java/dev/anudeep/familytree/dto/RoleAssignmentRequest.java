package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Role;

public class RoleAssignmentRequest {
    private String elementId;
    private Role role;

    // Getters and Setters
    public String getElementId() {
        return elementId;
    }

    public void setElementId(String elementId) {
        this.elementId = elementId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
