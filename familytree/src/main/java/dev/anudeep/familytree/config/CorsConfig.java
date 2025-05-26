package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

/**
 * Configuration class to define global CORS (Cross-Origin Resource Sharing) settings.
 * This allows frontend applications running on different origins (e.g., localhost:3000)
 * to make requests to the Spring Boot backend.
 */
@Configuration
public class CorsConfig {
    private final CorsProperties corsProperties;

    public CorsConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }
    /**
     * Defines the CORS policy applied to all endpoints (/**).
     *
     * @return CorsConfigurationSource bean used by Spring Security
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // List of allowed origins - here it's configured to allow the React dev server
        config.setAllowedOrigins(corsProperties.getAllowedOrigins());

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allowed headers in requests (can be restricted for security)
        config.setAllowedHeaders(List.of("*"));

        // Allow sending credentials like cookies, authorization headers, etc.
        config.setAllowCredentials(true);

        // ✅ Optional: expose headers if frontend needs to read them
        config.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        // Register the CORS config to apply to all routes (/**)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
