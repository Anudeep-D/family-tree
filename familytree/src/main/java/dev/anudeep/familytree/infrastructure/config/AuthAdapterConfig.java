package dev.anudeep.familytree.infrastructure.config;

import dev.anudeep.familytree.domain.port.out.AuthProviderPort;
import dev.anudeep.familytree.infrastructure.adapter.auth.FirebaseAuthProviderAdapter;
import dev.anudeep.familytree.infrastructure.adapter.auth.GoogleAuthProviderAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
public class AuthAdapterConfig {

    @Bean
    @Primary
    public AuthProviderPort activeAuthProviderPort(
            @Value("${auth.provider:FIREBASE}") String selectedProvider,
            FirebaseAuthProviderAdapter firebaseAdapter,
            GoogleAuthProviderAdapter googleAdapter) {

        log.info("Configuring active AuthProviderPort. Configured provider: {}", selectedProvider);

        if ("GOOGLE".equalsIgnoreCase(selectedProvider)) {
            log.info("--> Selected GoogleAuthProviderAdapter as primary AuthProviderPort");
            return googleAdapter;
        }

        log.info("--> Selected FirebaseAuthProviderAdapter as primary AuthProviderPort (DEFAULT)");
        return firebaseAdapter;
    }
}
