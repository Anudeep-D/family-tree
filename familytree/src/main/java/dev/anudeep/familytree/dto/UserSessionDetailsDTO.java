package dev.anudeep.familytree.dto;

import dev.anudeep.familytree.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDetailsDTO {
    private User user;
    private String idToken;
}
