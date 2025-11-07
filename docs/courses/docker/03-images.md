# Docker Images

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🖼️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Docker images and layers</li>
    <li>Build custom images from Dockerfiles</li>
    <li>Manage and optimize images</li>
    <li>Use multi-stage builds</li>
  </ul>
</div>

Docker images are read-only templates used to create containers. In this lesson, you'll learn how to manage, build, and work with Docker images.

!!! tip "Image Layers"
    Docker images are built in layers. Each instruction in a Dockerfile creates a new layer. Layers are cached, so reorder Dockerfile instructions from least to most frequently changing to maximize cache usage.

!!! note "Image Size Matters"
    Smaller images mean faster pulls, less storage, and better security. Use multi-stage builds, Alpine base images, and `.dockerignore` to minimize image size. Always clean up unused images with `docker image prune`.

## Understanding Images

An image is a layered filesystem with:
- A base operating system
- Application code and dependencies
- Configuration files
- Metadata

## Working with Images

### List Images

```bash
# List all images
docker images

# List with filters
docker images nginx
docker images --filter "dangling=true"
```

### Pull Images

```bash
# Pull an image from Docker Hub
docker pull nginx

# Pull a specific version
docker pull nginx:1.21

# Pull from a different registry
docker pull registry.example.com/image:tag
```

### Search Images

```bash
# Search Docker Hub
docker search python

# Search with filters
docker search --limit 5 nginx
```

## Image Tags

```bash
# Tag an image
docker tag nginx:latest my-nginx:v1.0

# Tag with a different name
docker tag nginx:latest myregistry.com/nginx:latest
```

!!! info "Info"
    Tags are labels that point to specific image versions. `latest` is the default tag.

## Building Images

### Using Dockerfile

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Build the image:

```bash
# Build from current directory
docker build -t my-app:latest .

# Build with a different Dockerfile
docker build -f Dockerfile.prod -t my-app:prod .

# Build without cache
docker build --no-cache -t my-app:latest .
```

### Build Context

```bash
# Build from a specific directory
docker build -t my-app /path/to/build/context

# Exclude files with .dockerignore
# .dockerignore file:
# node_modules
# .git
# *.log
```

## Image Layers

Images are built in layers. Each instruction in a Dockerfile creates a new layer:

```dockerfile
FROM ubuntu:20.04          # Layer 1
RUN apt-get update         # Layer 2
RUN apt-get install -y nginx  # Layer 3
COPY index.html /var/www/html  # Layer 4
```

!!! tip "Tip"
    Layers are cached. Reorder Dockerfile instructions to maximize cache usage.

## Inspecting Images

```bash
# Inspect image details
docker inspect nginx:latest

# View image history
docker history nginx:latest

# View image layers
docker image inspect nginx:latest --format='{{.RootFS.Layers}}'
```

## Removing Images

```bash
# Remove an image
docker rmi nginx:latest

# Remove by ID
docker rmi <image_id>

# Force remove (even if in use)
docker rmi -f nginx:latest

# Remove unused images
docker image prune

# Remove all unused images (not just dangling)
docker image prune -a
```

## Image Sizes

```bash
# View image sizes
docker images

# Detailed size information
docker system df

# Analyze image layers
docker history --human nginx:latest
```

## Multi-stage Builds

Reduce image size with multi-stage builds:

```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

```bash
docker build -t my-app:latest .
```

!!! success "Benefit"
    Multi-stage builds keep only necessary files in the final image, reducing size significantly.

## Saving and Loading Images

```bash
# Save image to tar file
docker save -o nginx.tar nginx:latest

# Load image from tar file
docker load -i nginx.tar

# Export/import (different from save/load)
docker export <container_id> > container.tar
docker import container.tar my-image:tag
```

## Best Practices

1. **Use specific tags** instead of `latest` in production
2. **Minimize layers** by combining RUN commands
3. **Use .dockerignore** to exclude unnecessary files
4. **Order Dockerfile** instructions from least to most frequently changing
5. **Use multi-stage builds** for smaller images

## Exercises

1. Pull a Python image and tag it with a custom name
2. Build a simple image from a Dockerfile
3. Inspect an image and view its layers
4. Create a multi-stage build for a Node.js application

---

**Previous**: [Working with Containers](02-containers.md)

