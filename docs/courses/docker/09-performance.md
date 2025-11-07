# Performance Optimization

Optimize Docker containers and images for better performance.

## Image Size Optimization

### Use Alpine Base Images

```dockerfile
# Large image (150MB+)
FROM ubuntu:20.04

# Small image (~5MB)
FROM alpine:latest
```

### Multi-stage Builds

```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/index.js"]
```

### Layer Optimization

```dockerfile
# Bad: Multiple layers
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip
RUN apt-get clean

# Good: Single layer
RUN apt-get update && \
    apt-get install -y python3 pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Build Performance

### Leverage Build Cache

```dockerfile
# Dependencies change less frequently
COPY package.json package-lock.json ./
RUN npm ci

# Code changes frequently
COPY . .
RUN npm run build
```

### Use .dockerignore

```dockerignore
node_modules
.git
*.log
.env
.DS_Store
dist
coverage
.vscode
*.md
```

### BuildKit

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Or use buildx
docker buildx build --platform linux/amd64,linux/arm64 -t myapp .
```

## Runtime Performance

### Resource Limits

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
```

### CPU Pinning

```bash
# Pin to specific CPUs
docker run --cpuset-cpus="0,1" myapp

# Use CPU shares
docker run --cpu-shares=512 myapp
```

### Memory Optimization

```bash
# Set memory limit
docker run -m 512m myapp

# Set swap limit
docker run -m 512m --memory-swap=1g myapp
```

## Storage Optimization

### Use Volumes for Data

```yaml
services:
  db:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data  # Named volume (faster)
      # Avoid: - ./data:/var/lib/postgresql/data  # Bind mount (slower)
```

### Storage Drivers

```bash
# Check storage driver
docker info | grep "Storage Driver"

# Overlay2 is recommended
# Better performance than devicemapper or aufs
```

## Network Performance

### Use Host Network (Linux)

```bash
# Bypass Docker networking (faster)
docker run --network host myapp
```

### Custom Networks

```bash
# Create optimized network
docker network create \
  --driver bridge \
  --opt com.docker.network.bridge.enable_icc=true \
  --opt com.docker.network.bridge.enable_ip_masquerade=true \
  mynetwork
```

## Monitoring Performance

### Container Stats

```bash
# Real-time stats
docker stats

# Stats for specific container
docker stats <container_id>

# One-time stats
docker stats --no-stream
```

### Resource Usage

```bash
# Check container resource usage
docker inspect <container> | grep -A 10 "Resources"

# Check image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

## Optimization Checklist

### Image Optimization

- [ ] Use Alpine or slim base images
- [ ] Use multi-stage builds
- [ ] Minimize layers
- [ ] Remove unnecessary packages
- [ ] Use .dockerignore
- [ ] Leverage build cache

### Runtime Optimization

- [ ] Set appropriate resource limits
- [ ] Use named volumes for data
- [ ] Optimize network configuration
- [ ] Enable health checks
- [ ] Use read-only filesystems where possible

### Build Optimization

- [ ] Enable BuildKit
- [ ] Use build cache effectively
- [ ] Parallel builds where possible
- [ ] Minimize build context

## Performance Testing

### Benchmark Containers

```bash
# CPU benchmark
docker run --rm --cpus=1.0 \
  progrium/stress --cpu 1 --timeout 60s

# Memory benchmark
docker run --rm -m 512m \
  progrium/stress --vm 1 --vm-bytes 256m --timeout 60s
```

### Load Testing

```bash
# Using Apache Bench
docker run --rm jordi/ab \
  -n 10000 -c 100 http://host.docker.internal:8080/

# Using wrk
docker run --rm williamyeh/wrk \
  -t4 -c100 -d30s http://host.docker.internal:8080/
```

## Exercises

1. Optimize a Dockerfile to reduce image size by 50%
2. Set up resource limits for a multi-container application
3. Benchmark container performance with different configurations
4. Optimize build time using build cache

---

**Previous**: [Security](08-security.md) | **Next**: [Production Deployment](10-production.md)

