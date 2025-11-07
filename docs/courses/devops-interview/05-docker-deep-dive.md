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

## Comprehensive Interview Questions

### Q1: Explain Docker layers in detail

**Answer:**
- **Each Dockerfile instruction creates a layer**
  ```dockerfile
  FROM ubuntu:20.04    # Layer 1: Base image
  RUN apt-get update   # Layer 2: Package list update
  RUN apt-get install nginx  # Layer 3: Install nginx
  COPY app.py /app/    # Layer 4: Copy application
  ```
- **Layers are cached**: Unchanged layers are reused
- **Layers are read-only**: Containers add writable layer on top
- **Shared layers save space**: Multiple images can share base layers

**Benefits:**
- Faster builds (cached layers)
- Smaller image sizes (shared layers)
- Efficient storage

### Q2: How do you reduce Docker image size?

**Answer:**

**1. Use multi-stage builds:**
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**2. Use Alpine or slim base images:**
```dockerfile
FROM python:3.9-slim  # Instead of python:3.9
FROM alpine:latest     # Minimal base image
```

**3. Combine RUN commands:**
```dockerfile
# Bad
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2

# Good
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

**4. Use .dockerignore:**
```dockerignore
node_modules
.git
*.log
.env
```

**5. Remove unnecessary files:**
```dockerfile
RUN apt-get install package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Q3: What is the difference between CMD and ENTRYPOINT?

**Answer:**
- **`CMD`**: Default command, can be overridden
  ```dockerfile
  CMD ["nginx", "-g", "daemon off;"]
  # Can override: docker run image /bin/sh
  ```
- **`ENTRYPOINT`**: Always executed, arguments appended
  ```dockerfile
  ENTRYPOINT ["docker-entrypoint.sh"]
  # Arguments appended: docker run image arg1 arg2
  ```
- **Combined**: ENTRYPOINT sets command, CMD provides default arguments
  ```dockerfile
  ENTRYPOINT ["docker-entrypoint.sh"]
  CMD ["--help"]
  ```

**When to use:**
- Use `CMD` for default commands
- Use `ENTRYPOINT` for fixed commands (like wrappers)

### Q4: Explain Docker networking modes

**Answer:**
- **Bridge (default)**: Isolated network, containers can communicate
  ```bash
  docker network create mynetwork
  docker run --network mynetwork nginx
  ```
- **Host**: Uses host's network directly
  ```bash
  docker run --network host nginx
  ```
- **None**: No networking
  ```bash
  docker run --network none alpine
  ```
- **Overlay**: Multi-host networking (Swarm)
- **Macvlan**: Containers appear as physical devices

### Q5: How do you secure Docker containers?

**Answer:**
1. **Run as non-root user:**
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```
2. **Use specific image tags:**
   ```dockerfile
   FROM node:18-alpine  # Not node:latest
   ```
3. **Scan images for vulnerabilities:**
   ```bash
   docker scan nginx:latest
   ```
4. **Limit container capabilities:**
   ```bash
   docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
   ```
5. **Use secrets management:**
   ```bash
   docker secret create db_password ./password.txt
   ```
6. **Network policies:**
   - Isolate containers
   - Use firewalls
   - Limit exposed ports

### Q6: Explain Docker volumes and bind mounts

**Answer:**
- **Volumes**: Managed by Docker, stored in Docker directory
  ```bash
  docker volume create myvolume
  docker run -v myvolume:/data nginx
  ```
- **Bind mounts**: Mount host directory
  ```bash
  docker run -v /host/path:/container/path nginx
  ```
- **tmpfs mounts**: In-memory storage
  ```bash
  docker run --tmpfs /tmp nginx
  ```

**When to use:**
- Volumes: Persistent data, Docker-managed
- Bind mounts: Development, host files needed
- tmpfs: Temporary, sensitive data

### Q7: How do you debug a container that won't start?

**Answer:**
```bash
# Check logs
docker logs container_name
docker logs -f container_name  # Follow logs

# Inspect container
docker inspect container_name

# Check exit code
docker ps -a  # Shows exit codes

# Run container interactively
docker run -it image_name /bin/sh

# Execute in running container
docker exec -it container_name /bin/sh

# Check container events
docker events
```

### Q8: Explain Docker Compose and when to use it

**Answer:**
Docker Compose manages multi-container applications.

**When to use:**
- Local development
- Testing multi-container setups
- Simple deployments

**Example:**
```yaml
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      - db
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: secret
```

**Limitations:**
- Single host only
- Not for production orchestration (use Kubernetes)

## Recommended Resources

### Books
- **"Docker Deep Dive" by Nigel Poulton** - Comprehensive Docker guide
- **"Using Docker" by Adrian Mouat** - Practical Docker usage

### Articles
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

### Research Papers
- **"Containers vs. Virtual Machines"** - Performance comparison studies
- **"Docker: Lightweight Linux Containers"** - Container technology overview

---

**Previous**: [Git & Version Control](04-git-version-control) | **Next**: [Kubernetes Mastery](06-kubernetes-mastery)

