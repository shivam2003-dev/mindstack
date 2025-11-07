# Docker Best Practices

Comprehensive best practices for Docker in production.

## Image Best Practices

### Base Images

```dockerfile
# ✅ Use specific tags
FROM node:16.20.0-alpine

# ❌ Avoid 'latest'
FROM node:latest
```

### Layer Optimization

```dockerfile
# ✅ Combine RUN commands
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ❌ Multiple RUN commands
RUN apt-get update
RUN apt-get install -y package
```

### Multi-stage Builds

```dockerfile
# ✅ Use multi-stage builds
FROM node:16 AS builder
# ... build steps ...
FROM node:16-alpine
COPY --from=builder /app/dist ./dist
```

## Security Best Practices

### Non-Root User

```dockerfile
# ✅ Run as non-root
RUN adduser -D appuser
USER appuser

# ❌ Run as root
# (default)
```

### Minimal Base Images

```dockerfile
# ✅ Use Alpine
FROM alpine:latest

# ❌ Avoid full OS
FROM ubuntu:20.04
```

### Scan Images

```bash
# ✅ Regular scanning
trivy image myapp:latest

# ❌ No scanning
```

## Runtime Best Practices

### Resource Limits

```yaml
# ✅ Set limits
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
```

### Health Checks

```dockerfile
# ✅ Include health checks
HEALTHCHECK --interval=30s CMD curl -f http://localhost/health
```

### Restart Policies

```bash
# ✅ Use restart policies
docker run --restart=unless-stopped myapp
```

## Networking Best Practices

### User-Defined Networks

```bash
# ✅ Use custom networks
docker network create mynetwork

# ❌ Default bridge
```

### DNS Resolution

```bash
# ✅ Use service names
docker run --network mynetwork \
  -e DB_HOST=db \
  myapp
```

## Data Management

### Named Volumes

```bash
# ✅ Use named volumes
docker run -v mydata:/data myapp

# ❌ Bind mounts (when possible)
docker run -v /host/path:/data myapp
```

### Backup Strategy

```bash
# ✅ Regular backups
docker run --rm -v mydata:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz /data
```

## Monitoring Best Practices

### Logging

```yaml
# ✅ Configure logging
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Metrics

```bash
# ✅ Export metrics
docker stats --format "{{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## CI/CD Best Practices

### Build Optimization

```dockerfile
# ✅ Leverage cache
COPY package.json ./
RUN npm ci
COPY . .
```

### Image Tagging

```bash
# ✅ Semantic versioning
docker build -t myapp:1.2.3 .
docker build -t myapp:latest .
```

## Documentation

### Dockerfile Comments

```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    pip

# Copy application code
COPY . /app
```

### README Files

```markdown
# Application

## Building
docker build -t myapp .

## Running
docker run -p 8080:80 myapp
```

## Checklist

### Image Checklist

- [ ] Use specific base image tags
- [ ] Minimize layers
- [ ] Use multi-stage builds
- [ ] Remove unnecessary packages
- [ ] Use .dockerignore
- [ ] Scan for vulnerabilities

### Container Checklist

- [ ] Run as non-root user
- [ ] Set resource limits
- [ ] Configure health checks
- [ ] Use restart policies
- [ ] Enable logging
- [ ] Set up monitoring

### Security Checklist

- [ ] Scan images regularly
- [ ] Use minimal base images
- [ ] Run as non-root
- [ ] Limit capabilities
- [ ] Use secrets management
- [ ] Keep images updated

## Exercises

1. Refactor a Dockerfile following best practices
2. Set up comprehensive monitoring
3. Implement security scanning in CI/CD
4. Create production-ready compose file

---

**Previous**: [Advanced Topics](12-advanced.md)

