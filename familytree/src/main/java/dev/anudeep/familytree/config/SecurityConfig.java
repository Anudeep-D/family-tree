package dev.anudeep.familytree.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration for the application.
 * It defines how incoming HTTP requests are secured and integrates CORS configuration.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Defines the security filter chain to configure HTTP security.
     *
     * @param http the HttpSecurity object used to configure security behavior
     * @return SecurityFilterChain bean
     * @throws Exception in case of configuration errors
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS using our custom configuration
                .cors(Customizer.withDefaults())

                // Disable CSRF since we're using JWT
                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                // Authorization rules based on HTTP methods and user roles
                .authorizeHttpRequests(auth -> auth
                        // Allow public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}

