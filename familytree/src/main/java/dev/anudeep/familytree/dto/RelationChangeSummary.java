package dev.anudeep.familytree.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class RelationChangeSummary {
    int permanentlyDeletedCount;
    int newlyCreatedCount;
    int updatedCount;
}