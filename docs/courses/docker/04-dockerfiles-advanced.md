# Advanced Dockerfiles

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">📝 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Write optimized Dockerfiles</li>
    <li>Use multi-stage builds effectively</li>
    <li>Implement security best practices</li>
    <li>Debug and optimize Docker builds</li>
  </ul>
</div>

Master the art of writing efficient, secure, and production-ready Dockerfiles.

!!! tip "Dockerfile Optimization"
    Order instructions from least to most frequently changing. Combine RUN commands to reduce layers. Use `.dockerignore` to exclude unnecessary files. These practices significantly reduce build time and image size.

!!! warning "Security in Dockerfiles"
    Always run containers as non-root users in production. Use specific image tags instead of `latest`. Scan images for vulnerabilities regularly. Never commit secrets or credentials in Dockerfiles.

## Dockerfile Best Practices

### Layer Caching

Docker caches layers to speed up builds. Understanding caching helps you write efficient Dockerfiles.

**Bad example - Poor cache usage:**
```dockerfile
# Bad: Changes invalidate cache
FROM ubuntu:20.04
COPY . /app
RUN apt-get update && apt-get install -y python3
```

**Why this is bad:**
- Every time you change ANY file in your code, the `COPY . /app` layer changes
- This invalidates the cache for the COPY layer
- The `RUN apt-get` layer also gets rebuilt (even though dependencies didn't change)
- **Result:** Slow builds, even when only code changes

**Good example - Optimal cache usage:**
```dockerfile
# Good: Dependencies first, code last
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y python3
COPY . /app
```

**Why this is good:**
- Dependencies (`RUN apt-get`) are installed first
- These rarely change, so this layer is cached
- Code (`COPY . /app`) is copied last
- When you change code, only the COPY layer rebuilds
- **Result:** Fast builds, dependencies layer stays cached

**Cache invalidation rule:**
- If a layer changes, all subsequent layers are invalidated
- Order matters: put stable operations first, changing operations last

!!! tip "Tip"
    Order Dockerfile instructions from least to most frequently changing.

### Multi-stage Builds

Multi-stage builds use multiple FROM statements to create smaller final images by excluding build tools and dependencies.

**Understanding the problem:**
- Building applications requires build tools (compilers, npm, etc.)
- These tools are large and not needed in production
- Including them makes images huge and less secure

**Solution - Multi-stage builds:**

```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
```

**What happens in build stage:**
1. `FROM node:16 AS builder`: Start with Node.js image, name this stage "builder"
   - Node.js image includes npm, build tools (~900MB)
   - `AS builder` gives this stage a name for reference
2. `WORKDIR /app`: Set working directory
3. `COPY package*.json ./`: Copy dependency files first (for caching)
4. `RUN npm ci`: Install dependencies
5. `COPY . .`: Copy source code
6. `RUN npm run build`: Build the application
   - Creates `dist/` folder with production files
   - Build tools are still in this stage

**Production stage:**
```dockerfile
# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**What happens in production stage:**
1. `FROM nginx:alpine`: Start fresh with minimal nginx image (~5MB)
   - No Node.js, no build tools
   - Only what's needed to serve files
2. `COPY --from=builder /app/dist /usr/share/nginx/html`: Copy ONLY built files from builder stage
   - `--from=builder`: Reference the builder stage
   - `/app/dist`: Source path in builder stage
   - `/usr/share/nginx/html`: Destination in nginx image
3. `COPY nginx.conf`: Copy nginx configuration
4. `EXPOSE 80`: Document that container uses port 80
5. `CMD`: Start nginx server

**Result:**
- Build stage: ~900MB (includes Node.js, npm, build tools)
- Production stage: ~10MB (only nginx + your built files)
- **90% size reduction!**

**Why this matters:**
- Faster image pulls
- Less storage used
- Smaller attack surface (fewer tools = fewer vulnerabilities)
- Faster container startup

!!! success "Benefits"
    - Smaller final image (no build tools)
    - Better security (fewer attack surfaces)
    - Faster deployments

## Advanced Patterns

### Build Arguments

Build arguments (ARG) allow you to pass values into the Dockerfile during build time, making Dockerfiles more flexible.

**Basic usage:**
```dockerfile
ARG NODE_VERSION=16
FROM node:${NODE_VERSION}
```

**What this does:**

1. `ARG NODE_VERSION=16`: Defines a build argument with default value 16
2. `FROM node:${NODE_VERSION}`: Uses the argument in the FROM statement
3. Default: Uses Node.js 16 if not specified
4. Can override: Use `--build-arg NODE_VERSION=18` to use Node.js 18

**Advanced example with metadata:**
```dockerfile
ARG BUILD_DATE
ARG VCS_REF
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF
```

**What this does:**

1. `ARG BUILD_DATE`: Accepts build date as argument
2. `ARG VCS_REF`: Accepts git commit hash as argument
3. `LABEL`: Adds metadata to the image
   - Labels are visible in `docker inspect`
   - Useful for tracking image versions
   - Common practice for production images

**Build with arguments:**
```bash
docker build \
  --build-arg NODE_VERSION=18 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  -t myapp .
```

**Breaking down the command:**

1. **`--build-arg NODE_VERSION=18`**: Override default, use Node.js 18

2. **`--build-arg BUILD_DATE=$(date ...)`**: Pass current date/time
   - `$(date -u +'%Y-%m-%dT%H:%M:%SZ')`: Gets current UTC time in ISO format

3. **`--build-arg VCS_REF=$(git rev-parse --short HEAD)`**: Pass git commit hash
   - `git rev-parse --short HEAD`: Gets short version of current commit

4. **`-t myapp .`**: Tag and build

**Use cases for ARG:**
- Different base image versions
- Environment-specific configurations
- Build-time feature flags
- Version numbers
- Metadata (dates, commit hashes)

!!! note "ARG vs ENV"
    - `ARG`: Available only during build time, not in running containers
    - `ENV`: Available in both build and runtime
    - Use ARG for build-time configuration, ENV for runtime configuration

### Health Checks

```dockerfile
FROM nginx:alpine

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
```

### Security Best Practices

```dockerfile
# Use specific tags, not 'latest'
FROM node:16-alpine

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy files with correct ownership
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Use exec form for CMD
CMD ["node", "server.js"]
```

!!! warning "Security"
    Always run containers as non-root users in production.

## Optimizing Dockerfiles

### Minimize Layers

```dockerfile
# Bad: Multiple RUN commands
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip

# Good: Single RUN command
RUN apt-get update && \
    apt-get install -y python3 pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Use .dockerignore

```dockerignore
# .dockerignore
node_modules
.git
*.log
.env
.DS_Store
dist
coverage
.vscode
```

### Leverage Build Cache

```dockerfile
# Dependencies change less frequently
COPY package.json package-lock.json ./
RUN npm ci

# Application code changes frequently
COPY . .
RUN npm run build
```

## Advanced Examples

### Python Application

```dockerfile
FROM python:3.9-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=app:app . .

# Switch to app user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

### Go Application

```dockerfile
# Build stage
FROM golang:1.19-alpine AS builder

WORKDIR /build

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build application
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /build/app .

EXPOSE 8080
CMD ["./app"]
```

## Debugging Dockerfiles

### Build with Debug Output

```bash
# Build with progress output
docker build --progress=plain -t myapp .

# Build without cache
docker build --no-cache -t myapp .

# Build with specific target
docker build --target builder -t myapp:builder .
```

### Inspect Layers

```bash
# View image history
docker history myapp

# Inspect image
docker inspect myapp

# Check image size
docker images myapp
```

## Exercises

1. Create a multi-stage Dockerfile for a Node.js application
2. Add health checks to an existing Dockerfile
3. Optimize a Dockerfile to reduce image size by 50%
4. Create a secure Dockerfile that runs as non-root

---

**Previous**: [Docker Images](03-images.md) | **Next**: [Docker Networking](05-networking.md)

