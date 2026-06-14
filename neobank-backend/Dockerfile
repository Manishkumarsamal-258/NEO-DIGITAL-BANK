# ── NeoBank Backend Dockerfile ─────────────────────────────
# Multi-stage build: compile with Maven → run with JRE
#
# Build:
#   docker build -t neobank-backend .
#
# Run:
#   docker run -p 8080:8080 \
#     -e SPRING_DATASOURCE_URL=jdbc:mysql://... \
#     -e SPRING_DATASOURCE_USERNAME=... \
#     -e SPRING_DATASOURCE_PASSWORD=... \
#     -e JWT_SECRET=... \
#     -e APP_CORS_ORIGINS=https://your-frontend.vercel.app \
#     neobank-backend

# ═══ Stage 1: Build ═══
FROM maven:3.9.16-eclipse-temurin-25 AS build

WORKDIR /app

# Copy the main project pom.xml and source
COPY pom.xml ./
COPY src ./src

# Build the monolith JAR (skip tests for faster builds)
RUN mvn clean package -DskipTests -q

# ═══ Stage 2: Runtime ═══
FROM eclipse-temurin:25-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update -qq && apt-get install -y -qq curl && rm -rf /var/lib/apt/lists/*

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -sf http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
