# Advanced Docker Topics

Explore advanced Docker concepts and techniques.

## Docker Buildx

### Multi-Platform Builds

```bash
# Create buildx builder
docker buildx create --name multiplatform --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push .

# Inspect image
docker buildx imagetools inspect myapp:latest
```

### Build Cache

```bash
# Use cache from registry
docker buildx build \
  --cache-from=type=registry,ref=myapp:cache \
  --cache-to=type=registry,ref=myapp:cache,mode=max \
  -t myapp .
```

## Docker Content Trust

### Enable Content Trust

```bash
# Set environment variable
export DOCKER_CONTENT_TRUST=1

# Push signed image
docker push myapp:latest

# Pull only signed images
docker pull myapp:latest
```

### Manage Keys

```bash
# List keys
docker trust key list

# Generate signing key
docker trust key generate <key-name>

# Sign image
docker trust sign myapp:latest
```

## Advanced Networking

### Custom Network Drivers

```bash
# Create overlay network
docker network create \
  --driver overlay \
  --attachable \
  myoverlay

# Macvlan network
docker network create \
  --driver macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  mymacvlan
```

### Network Policies

```bash
# Isolated network
docker network create --internal isolated

# External network
docker network create --external external_net
```

## Advanced Storage

### Storage Drivers

```bash
# Check storage driver
docker info | grep "Storage Driver"

# Overlay2 (recommended)
# Better performance and features
```

### Volume Plugins

```bash
# Install plugin
docker plugin install vieux/sshfs

# Create volume with plugin
docker volume create \
  --driver vieux/sshfs \
  -o sshcmd=user@host:/path \
  sshvolume
```

## Container Runtime Options

### RunC Alternatives

```bash
# Use gVisor (sandboxed runtime)
docker run --runtime=runsc alpine

# Use Kata Containers (VM-based)
docker run --runtime=kata-runtime alpine
```

### Custom Runtimes

```bash
# Configure custom runtime
# Edit /etc/docker/daemon.json
{
  "runtimes": {
    "custom": {
      "path": "/usr/bin/custom-runtime"
    }
  }
}
```

## Docker API

### REST API

```bash
# Enable API
# Edit /etc/docker/daemon.json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2376"]
}

# Use API
curl http://localhost:2376/containers/json
```

### SDKs

```python
# Python Docker SDK
import docker

client = docker.from_env()
containers = client.containers.list()
for container in containers:
    print(container.name)
```

## Advanced Compose

### Extends

```yaml
# base.yml
services:
  app:
    image: myapp
    environment:
      - ENV=base

# docker-compose.yml
services:
  app:
    extends:
      file: base.yml
      service: app
    environment:
      - ENV=production
```

### Profiles

```yaml
services:
  dev:
    image: myapp
    profiles: ["dev"]

  prod:
    image: myapp
    profiles: ["prod"]
```

```bash
# Run with profile
docker-compose --profile dev up
```

## Exercises

1. Build a multi-platform image
2. Set up content trust
3. Create a custom network driver
4. Use Docker API to manage containers

---

**Previous**: [System Troubleshooting](11-troubleshooting.md) | **Next**: [Best Practices](13-best-practices.md)

