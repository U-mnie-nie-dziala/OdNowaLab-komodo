FROM postgres:16-alpine

# Environment variables can also be passed at runtime via docker run or docker-compose
ENV POSTGRES_DB=app
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Optional: Place initialization scripts in /docker-entrypoint-initdb.d/
# COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432