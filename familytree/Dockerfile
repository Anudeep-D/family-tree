# Stage 1: Build the Spring Boot JAR
# Use Red Hat UBI Java 17 for building (secure, actively maintained)
FROM registry.redhat.io/ubi8/openjdk-17:latest as builder
# Set working directory in the container
WORKDIR /app
# Copy only Gradle wrapper and build config files first
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Pre-download dependencies (this step is cached unless these files change)
RUN chmod +x ./gradlew && ./gradlew dependencies

# Now copy the actual source code
COPY src src

# Clean and then build the JAR Build the Spring Boot app (must have gradlew script)
RUN ./gradlew clean bootJar

# Stage 2: Run the built JAR
# Use Red Hat UBI Java 17 for a clean, secure run environment
FROM registry.redhat.io/ubi8/openjdk-17:latest
# Create non-root user for security
RUN useradd -m -u 1001 appuser

# Set working directory
WORKDIR /app
# Copy the built JAR from the build stage and set ownership
COPY --from=builder --chown=appuser:appuser /app/build/libs/*.jar app.jar
# Expose port 8080
EXPOSE 8080

# Switch to non-root user
USER 1001

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
