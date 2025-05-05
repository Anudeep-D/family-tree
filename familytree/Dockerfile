# Stage 1: Build the Spring Boot JAR
# Use Java 17 base image for building
FROM eclipse-temurin:17-jdk as builder
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
# Use Java 17 again for a clean run environment
FROM eclipse-temurin:17-jdk
# Set working directory                              
WORKDIR /app      
# Copy the built JAR from the build stage                                  
COPY --from=builder /app/build/libs/*.jar app.jar  
 # Expose port 8080   
EXPOSE 8080        
# Run the JAR file                                
ENTRYPOINT ["java", "-jar", "app.jar"]              
