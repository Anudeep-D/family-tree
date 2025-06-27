package dev.anudeep.familytree.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private String fieldOfStudy;
    private String highestQualification;
    private String institution;
    private String location;
}
