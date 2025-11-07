# Docker Security

Secure your Docker containers and deployments.

## Security Fundamentals

### Principle of Least Privilege

- Run containers as non-root users
- Limit container capabilities
- Use read-only filesystems where possible
- Minimize attack surface

## Image Security

### Use Official Images

```dockerfile
# Prefer official images
FROM node:16-alpine

# Avoid untrusted sources
# FROM someuser/random-image:latest  # ❌
```

### Scan Images

```bash
# Using Trivy
trivy image nginx:alpine

# Using Docker Scout
docker scout quickview nginx:alpine

# Using Snyk
snyk test --docker nginx:alpine
```

### Keep Images Updated

```bash
# Check for updates
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"

# Use specific tags, not 'latest'
FROM node:16.20.0-alpine  # ✅
FROM node:latest          # ❌
```

## Container Security

### Non-Root User

```dockerfile
# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Use the user
USER appuser

# Or in one line
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
USER appuser
```

### Read-Only Root Filesystem

```bash
# Run with read-only root
docker run --read-only alpine

# Allow specific writable directories
docker run --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  alpine
```

### Limit Capabilities

```bash
# Drop all capabilities, add only needed
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# Common capabilities to drop
docker run --cap-drop=CHOWN --cap-drop=SETUID --cap-drop=SETGID app
```

### Resource Limits

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Network Security

### Network Isolation

```bash
# Create isolated network
docker network create --internal isolated_network

# Containers can't access external network
docker run --network isolated_network alpine
```

### Firewall Rules

```bash
# Use iptables to restrict access
iptables -A DOCKER -s 192.168.1.0/24 -j ACCEPT
iptables -A DOCKER -j DROP
```

## Secrets Management

### Docker Secrets (Swarm)

```bash
# Create secret
echo "mysecret" | docker secret create db_password -

# Use in service
docker service create \
  --secret db_password \
  --name app \
  myapp
```

### Environment Variables

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

!!! warning "Warning"
    Never commit secrets to version control. Use secret management tools.

## Security Scanning

### Image Vulnerability Scanning

```bash
# Install Trivy
brew install trivy  # macOS
# or
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Scan image
trivy image nginx:alpine

# Scan with exit code
trivy image --exit-code 1 --severity HIGH,CRITICAL nginx:alpine
```

### CI/CD Integration

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build image
        run: docker build -t myapp .
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp
          format: 'sarif'
          output: 'trivy-results.sarif'
```

## Best Practices

### Dockerfile Security

```dockerfile
# ✅ Good practices
FROM node:16-alpine
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
WORKDIR /app
COPY --chown=appuser:appuser package*.json ./
RUN npm ci --only=production
COPY --chown=appuser:appuser . .
USER appuser
HEALTHCHECK --interval=30s CMD node healthcheck.js
CMD ["node", "server.js"]
```

### Runtime Security

```bash
# Security checklist
docker run \
  --read-only \
  --tmpfs /tmp \
  --user 1000:1000 \
  --cap-drop=ALL \
  --security-opt no-new-privileges:true \
  --memory=512m \
  --cpus=1.0 \
  myapp
```

## Security Tools

### Docker Bench Security

```bash
# Run security audit
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /etc:/etc:ro \
  -v /usr/bin/containerd:/usr/bin/containerd:ro \
  -v /usr/bin/runc:/usr/bin/runc:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

### Falco (Runtime Security)

```bash
# Install Falco
docker run -d \
  --name falco \
  --privileged \
  -v /var/run/docker.sock:/host/var/run/docker.sock:ro \
  -v /dev:/host/dev:ro \
  -v /proc:/host/proc:ro \
  -v /boot:/host/boot:ro \
  -v /lib/modules:/host/lib/modules:ro \
  -v /usr:/host/usr:ro \
  falcosecurity/falco
```

## Exercises

1. Create a secure Dockerfile with non-root user
2. Scan an image for vulnerabilities
3. Configure resource limits for a container
4. Set up secrets management for a compose file

---

**Previous**: [Docker Compose](07-docker-compose.md) | **Next**: [Performance Optimization](09-performance.md)

