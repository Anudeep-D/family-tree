# Stage 1: Build the Spring Boot JAR
# ubi8/openjdk-17 ships as jboss (UID 185) — no useradd needed
FROM registry.access.redhat.com/ubi8/openjdk-17:latest AS builder

# Point Gradle user home to jboss home so the daemon cache is writable
ENV GRADLE_USER_HOME=/home/jboss/.gradle

WORKDIR /home/jboss/build

# Copy only Gradle wrapper and build config files first, preserving execute bit
COPY --chown=185:0 --chmod=755 gradlew .
COPY --chown=185:0 gradle gradle
COPY --chown=185:0 build.gradle .
COPY --chown=185:0 settings.gradle .

# Switch to jboss so Gradle can write its cache
USER 185

# Pre-download dependencies (cached unless build files change)
RUN ./gradlew dependencies

# Copy source and build the JAR
COPY --chown=185:0 src src
RUN ./gradlew clean bootJar

# Stage 2: Run the built JAR
# ubi8/openjdk-17 runs as jboss (UID 185) — no useradd needed
FROM registry.access.redhat.com/ubi8/openjdk-17:latest

WORKDIR /deployments

# Copy the built JAR from the build stage
COPY --from=builder --chown=185:0 /home/jboss/build/build/libs/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run as jboss (already the default, make explicit)
USER 185

ENTRYPOINT ["java", "-jar", "app.jar"]
