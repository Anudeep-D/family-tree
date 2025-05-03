# Stage 1: Build the Spring Boot JAR
# Use Java 17 base image for building
FROM eclipse-temurin:17-jdk as builder
# Set working directory in the container                   
WORKDIR /app     
# Copy all backend source code                                   
COPY . .           
# Build the Spring Boot app (must have gradlew script)                                 
RUN chmod +x ./gradlew && ./gradlew bootJar         

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
