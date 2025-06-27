package dev.anudeep.familytree;

import dev.anudeep.familytree.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@SpringBootApplication
@EnableConfigurationProperties(CorsProperties.class)
//@EnableNeo4jRepositories(basePackages = "dev.anudeep.familytree.repository")
@EnableRedisRepositories(basePackages = "dev.anudeep.session.redis") // use a dummy path that doesn't exist
public class FamilytreeApplication {

    public static void main(String[] args) {
        SpringApplication.run(FamilytreeApplication.class, args);
    }

}
