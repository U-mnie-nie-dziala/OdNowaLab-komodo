# Stage 1: Build the application
FROM eclipse-temurin:26-jdk-jammy AS builder
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle

RUN chmod +x gradlew

# Download dependencies (cached if build files don't change)
RUN ./gradlew dependencies --no-daemon

# Copy source code and build the fat jar
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy the built jar from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]