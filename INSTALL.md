# Installation Guide

This guide describes how to configure and run the Library Plus application using Docker.

## Requirements

Ensure you have the following installed on your system:
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

Before starting the application, you need to configure the backend settings.

1. Navigate to the `backend` directory.
2. Copy the example configuration file:
   ```bash
   cp backend/appsettings-example.json backend/appsettings.json
   ```
3. Open `backend/appsettings.json` and fill in the required values:

   - **Databases:** The `ConnectionStrings` and `MongoDbSettings` are pre-configured to work with the Docker containers. You only need to change them if you modify the credentials in `docker-compose.yml`.
   - **JWT:** Provide a secure `Key` (Base64 encoded string), `Issuer`, and `Audience` for authentication token generation.
   - **Mail:** Provide your SMTP details to enable email functionality.
     - `Username`: Your email address.
     - `Password`: Your email application password.
     - `SmtpServer` and `Port` (e.g., `smtp.gmail.com` and `587`).
   - **MongoExpress:** Set your preferred username and password for the MongoDB administration interface.

## Running the Application

Library Plus provides different Docker Compose configurations depending on your environment.

### Development Environment

The development environment includes hot-reloading, local volume mapping, and administration tools like pgAdmin and Mongo Express.

To start the development environment, run:

```bash
docker compose up --build -d
```
*(Docker Compose automatically uses both `docker-compose.yml` and `docker-compose.override.yml` by default).*

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **pgAdmin:** http://localhost:5050
- **Mongo Express:** http://localhost:8081

### Production Environment

For a production-ready deployment, use the release configuration. This builds optimized images without development tools.

To start the production environment, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.release.yml up --build -d
```

- **Frontend:** http://localhost:5001
- **Backend API:** http://localhost:8080

## Stopping the Application

To stop and remove the containers, run:

```bash
docker compose down
```
*(Add `-v` if you also want to delete the database volumes).*
