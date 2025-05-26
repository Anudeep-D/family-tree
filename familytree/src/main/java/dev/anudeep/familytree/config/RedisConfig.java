package dev.anudeep.familytree.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        log.info("Attempting to configure LettuceConnectionFactory with host: [{}] and port: [{}]", redisHost, redisPort);
        if (redisHost == null || redisHost.isEmpty() || redisHost.equals("localhost") || redisHost.equals("127.0.0.1")) {
            log.warn("**************************************************************************************");
            log.warn("*** WARNING: Redis host is configured as '{}'. If this is a containerized environment,");
            log.warn("*** this might be incorrect. Expected a service name like 'familytree-redis'.     ***");
            log.warn("**************************************************************************************");
        }
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(redisHost, redisPort);
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }
}
