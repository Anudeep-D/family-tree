package dev.anudeep.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Spring Security configuration for the application.
 * It defines how incoming HTTP requests are secured and integrates CORS configuration.
 */
@Configuration
@EnableWebSecurity
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
                // Disable CSRF for API-based interactions (optional: enable for form-based auth)
                .csrf(AbstractHttpConfigurer::disable)

                // Allow all requests for now (can be restricted later by role, path, etc.)
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(new AntPathRequestMatcher("/**")).permitAll()
                        .anyRequest().authenticated()
                )

                // Enable CORS using CorsConfigurationSource bean defined separately
                .cors(cors -> {});

        return http.build();
    }
}

