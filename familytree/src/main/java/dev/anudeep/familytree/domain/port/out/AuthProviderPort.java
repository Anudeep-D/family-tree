package dev.anudeep.familytree.domain.port.out;

import dev.anudeep.familytree.domain.model.AuthenticatedUserClaims;

public interface AuthProviderPort {
    /**
     * Verifies the provider-specific ID token and returns authenticated user claims.
     *
     * @param idToken the raw JWT / ID token sent by client
     * @return AuthenticatedUserClaims containing normalized user information
     */
    AuthenticatedUserClaims verifyToken(String idToken);

    /**
     * Gets the name of this authentication provider (e.g. "FIREBASE", "GOOGLE").
     *
     * @return provider name
     */
    String getProviderName();
}
