# Docker Compose

Orchestrate multi-container applications with Docker Compose.

## Introduction

Docker Compose allows you to define and run multi-container Docker applications using YAML files.

### Why Docker Compose?

- **Simplified orchestration**: Define services in one file
- **Environment management**: Easy configuration per environment
- **Service dependencies**: Automatic service ordering
- **Networking**: Automatic network creation
- **Scaling**: Easy to scale services

## Basic Compose File

### Simple Example

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html

  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Running Compose

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Service Configuration

### Build from Dockerfile

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: 16
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

### Environment Variables

```yaml
services:
  app:
    image: myapp
    environment:
      - DATABASE_URL=postgres://db:5432/mydb
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
      - .env.production
```

### Dependencies

```yaml
services:
  web:
    build: .
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: mydb

  redis:
    image: redis:alpine
```

!!! note "Note"
    `depends_on` only waits for container start, not service readiness.

### Health Checks

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  app:
    build: .
    depends_on:
      web:
        condition: service_healthy
```

## Networking

### Custom Networks

```yaml
services:
  web:
    image: nginx
    networks:
      - frontend
      - backend

  api:
    image: api
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### External Networks

```yaml
services:
  web:
    image: nginx
    networks:
      - external_network

networks:
  external_network:
    external: true
```

## Volumes

### Named Volumes

```yaml
services:
  db:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
    driver: local
```

### Bind Mounts

```yaml
services:
  web:
    image: nginx
    volumes:
      - ./config:/etc/nginx/conf.d
      - ./html:/usr/share/nginx/html:ro
```

## Advanced Patterns

### Multi-Environment

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    env_file:
      - .env.${ENV:-development}

# docker-compose.prod.yml
version: '3.8'
services:
  app:
    restart: always
    deploy:
      replicas: 3
```

```bash
# Use production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Service Scaling

```yaml
services:
  web:
    image: nginx
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Override Files

```yaml
# docker-compose.override.yml (auto-loaded)
services:
  web:
    volumes:
      - ./src:/app/src  # Development mount
    environment:
      - DEBUG=true
```

## Production Compose

### Full Example

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge
```

## Compose Commands

### Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart service
docker-compose restart web

# Scale service
docker-compose up -d --scale web=3

# View logs
docker-compose logs -f web

# Execute command
docker-compose exec web bash

# Pull images
docker-compose pull

# Build images
docker-compose build

# Remove stopped containers
docker-compose rm
```

### Inspection

```bash
# List services
docker-compose ps

# View configuration
docker-compose config

# Validate configuration
docker-compose config --quiet
```

## Best Practices

1. **Use version 3.8** for latest features
2. **Separate environments** with override files
3. **Use health checks** for service dependencies
4. **Set resource limits** in production
5. **Use secrets** for sensitive data
6. **Version control** compose files
7. **Document** service dependencies

## Exercises

1. Create a compose file for a web app with database
2. Add health checks and service dependencies
3. Set up multi-environment configuration
4. Scale a service and verify load balancing

---

**Previous**: [Volumes and Data Management](06-volumes.md) | **Next**: [Security](08-security.md)

