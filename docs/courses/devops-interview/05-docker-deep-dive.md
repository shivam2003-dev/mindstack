# Docker Deep Dive

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master advanced Docker concepts</li>
    <li>Understand Docker internals</li>
    <li>Learn optimization techniques</li>
    <li>Know production best practices</li>
  </ul>
</div>

This chapter covers advanced Docker topics essential for DevOps interviews and production environments.

!!! tip "Interview Focus"
    Be ready to explain Docker architecture, layers, networking, and optimization. Understand when and why to use Docker.

## Docker Architecture

### Components

- **Docker Daemon**: Background service managing containers
- **Docker Client**: CLI for interacting with daemon
- **Docker Images**: Read-only templates
- **Docker Containers**: Running instances
- **Docker Registry**: Image storage (Docker Hub, etc.)

### Image Layers

```bash
# View image layers
docker history nginx:latest

# Inspect layer sizes
docker image inspect nginx:latest --format='{{.RootFS.Layers}}'
```

!!! note "Layer Caching"
    Docker caches layers. Order Dockerfile instructions from least to most frequently changing.

## Advanced Dockerfile

### Multi-stage Builds

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Benefits:**
- Smaller final image
- No build tools in production
- Better security

### Build Arguments

```dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}

ARG BUILD_DATE
LABEL build-date=$BUILD_DATE
```

```bash
docker build --build-arg NODE_VERSION=20 -t app .
```

## Docker Networking

### Network Types

```bash
# Bridge (default)
docker network create mynetwork

# Host
docker run --network host nginx

# None
docker run --network none alpine
```

### Custom Networks

```bash
# Create network
docker network create --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  mynetwork

# Connect container
docker network connect mynetwork container1
```

## Docker Compose

```yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

## Optimization

### Image Size

```dockerfile
# Use Alpine base images
FROM alpine:latest

# Combine RUN commands
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Use .dockerignore
# node_modules
# .git
```

### Build Performance

```dockerfile
# Copy dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy code last
COPY . .
```

## Security Best Practices

```dockerfile
# Use specific tags
FROM node:18-alpine

# Run as non-root
RUN adduser -D appuser
USER appuser

# Don't expose secrets
# Use secrets management
```

## Interview Questions

### Q: Explain Docker layers

**Answer:**
- Each Dockerfile instruction creates a layer
- Layers are cached for faster builds
- Layers are read-only, containers add writable layer
- Shared layers save disk space

### Q: How do you reduce image size?

**Answer:**
1. Use multi-stage builds
2. Use Alpine or slim images
3. Combine RUN commands
4. Remove unnecessary files
5. Use .dockerignore

### Q: Difference between CMD and ENTRYPOINT?

**Answer:**
- **CMD**: Default command, can be overridden
- **ENTRYPOINT**: Always executed, arguments appended
- Use ENTRYPOINT for fixed commands

---

**Previous**: [Git & Version Control](04-git-version-control) | **Next**: [Kubernetes Mastery](06-kubernetes-mastery)

