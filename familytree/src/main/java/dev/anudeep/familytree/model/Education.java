package dev.anudeep.familytree.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private String fieldOfStudy;
    private String highestQualification;
    private String institution;
    private String location;
}
