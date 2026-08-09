package dev.anudeep.familytree.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUserClaims {
    private String email;
    private String name;
    private String picture;
    private String uid;
    private String provider;
}
