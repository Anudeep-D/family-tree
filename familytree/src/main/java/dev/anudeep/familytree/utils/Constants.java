package dev.anudeep.familytree.utils;

import dev.anudeep.familytree.model.Role;

import java.util.Objects;

public class Constants {
    public static final String ADMIN_REL = "ADMIN_FOR";

    public static final String EDITOR_REL = "EDITOR_FOR";
    public static final String VIEWER_REL = "VIEWER_FOR";
    // Person, House relationships
    public static final String PARENT_REL = "PARENT_OF";
    public static final String MARRIED_REL = "MARRIED_TO";
    public static final String BELONGS_REL = "BELONGS_TO";
    public static final String PART_OF = "PART_OF";
    // User, Tree relationships
    private Constants() {
    }

    public static String getRelForRole(Role role) {
        if (role == Role.ADMIN) return ADMIN_REL;
        if (role == Role.EDITOR) return EDITOR_REL;
        if (role == Role.VIEWER) return VIEWER_REL;
        return null;
    }

    public static String getRoleForRel(String rel) {
        if (Objects.equals(rel, ADMIN_REL)) return Role.ADMIN.toValue();
        if (Objects.equals(rel, EDITOR_REL)) return Role.EDITOR.toValue();
        if (Objects.equals(rel, VIEWER_REL)) return Role.VIEWER.toValue();
        return null;
    }
}
