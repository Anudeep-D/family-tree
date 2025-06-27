package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RoleAssignmentRequest {
    private String elementId;
    private Role role;
    private String relation;
}
