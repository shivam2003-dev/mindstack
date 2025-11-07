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

View all Docker images stored on your system:

```bash
# List all images
docker images
```

**What you'll see:**
```
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
nginx        latest    abc123def456   2 weeks ago     133MB
ubuntu       20.04     def456ghi789   3 weeks ago     72.8MB
python       3.9       ghi789jkl012   1 month ago     912MB
```

**Column explanations:**
- **REPOSITORY**: Image name (like `nginx`, `ubuntu`)
- **TAG**: Version identifier (default is `latest`)
- **IMAGE ID**: Unique identifier for the image
- **CREATED**: When the image was created
- **SIZE**: Disk space used by the image

**Filtering images:**
```bash
# List images for a specific repository
docker images nginx
```

**Output:** Shows only nginx images with different tags:
```
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
nginx        latest    abc123def456   2 weeks ago     133MB
nginx        1.21      xyz789abc123   1 month ago     131MB
```

**Find dangling images (untagged):**
```bash
# List dangling images (intermediate build layers)
docker images --filter "dangling=true"
```

**What are dangling images?**
- Images without a repository name or tag
- Usually intermediate layers from builds
- Safe to remove to free up space
- Remove with: `docker image prune`

### Pull Images

Download images from Docker Hub or other registries:

```bash
# Pull an image from Docker Hub
docker pull nginx
```

**What happens:**
1. Docker connects to Docker Hub (default registry)
2. Downloads the `nginx` image with `latest` tag
3. Shows download progress
4. Image is stored locally and ready to use

**Example output:**
```
latest: Pulling from library/nginx
a1b2c3d4e5f6: Pull complete
f6e5d4c3b2a1: Pull complete
...
Status: Downloaded newer image for nginx:latest
docker.io/library/nginx:latest
```

**Pull a specific version:**
```bash
# Pull a specific version
docker pull nginx:1.21
```

**Why specify versions?**
- `latest` tag can change unexpectedly
- Production should use specific versions
- Ensures consistency across environments
- Prevents breaking changes

**Pull from a different registry:**
```bash
# Pull from a different registry
docker pull registry.example.com/image:tag
```

**Use cases:**
- Private registries (company internal)
- Alternative registries (GitHub Container Registry, AWS ECR)
- Custom registries

**Example - GitHub Container Registry:**
```bash
docker pull ghcr.io/username/image:tag
```

### Search Images

Find images on Docker Hub before pulling:

```bash
# Search Docker Hub
docker search python
```

**What you'll see:**
```
NAME                           DESCRIPTION                     STARS     OFFICIAL   AUTOMATED
python                         Python is a programming lang…   10000+    [OK]
python-django                  Django is a high-level Pyth…   500       [OK]
python-flask                   Flask is a microframework f…   300       [OK]
```

**Column explanations:**
- **NAME**: Image name
- **DESCRIPTION**: Brief description
- **STARS**: Popularity rating
- **OFFICIAL**: [OK] means official image (recommended)
- **AUTOMATED**: Built automatically from source

**Limit search results:**
```bash
# Search with filters
docker search --limit 5 nginx
```

**Shows only top 5 results** - useful when you know what you're looking for.

!!! tip "Choosing the Right Image"
    - **Official images** (marked [OK]): Maintained by Docker or software vendors, most reliable
    - **High stars**: Popular and likely well-maintained
    - **Specific tags**: Use version tags, not `latest` for production
    - **Size matters**: Smaller images = faster pulls and less storage

## Image Tags

Tags are labels that identify specific versions or variants of an image. Think of them like version numbers or branch names.

### Understanding Tags

**Default behavior:**
```bash
# When you don't specify a tag, Docker uses 'latest'
docker pull nginx
# Same as:
docker pull nginx:latest
```

**What `latest` means:**
- Not necessarily the newest version
- Just the default tag name
- Can point to any version
- **Warning:** Can change unexpectedly!

### Creating Custom Tags

**Tag an existing image:**
```bash
# Tag an image with a new name/version
docker tag nginx:latest my-nginx:v1.0
```

**What this does:**
- Creates a new tag pointing to the same image
- Doesn't duplicate the image (tags are just pointers)
- Image ID remains the same
- Now you can reference it as `my-nginx:v1.0`

**Verify the tag:**
```bash
docker images | grep nginx
```

**Output:**
```
nginx        latest    abc123def456   2 weeks ago   133MB
my-nginx     v1.0      abc123def456   2 weeks ago   133MB
```

Notice: Same IMAGE ID, different tags!

**Tag for a registry:**
```bash
# Tag with a different name (for pushing to registry)
docker tag nginx:latest myregistry.com/nginx:latest
```

**What this does:**
- Prepares image for pushing to `myregistry.com`
- Format: `registry/username/image:tag`
- Required before `docker push`

**Common tagging patterns:**
```bash
# Version tags
docker tag myapp:latest myapp:1.2.3
docker tag myapp:latest myapp:v1.2.3

# Environment tags
docker tag myapp:latest myapp:production
docker tag myapp:latest myapp:staging
docker tag myapp:latest myapp:dev

# Date tags
docker tag myapp:latest myapp:2024-01-15
```

!!! info "Tag Best Practices"
    - Use semantic versioning: `v1.2.3`
    - Tag production images with version numbers
    - Use descriptive tags: `production`, `staging`, `dev`
    - Never rely solely on `latest` in production
    - Tag images after successful builds

## Building Images

### Using Dockerfile

A Dockerfile is a text file with instructions for building an image. Think of it as a recipe that tells Docker how to create your application image.

**Create a `Dockerfile` in your project directory:**

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

**Line-by-line explanation:**
- `FROM python:3.9-slim`: Start with Python 3.9 slim image (base image)
  - `slim` variant is smaller than full Python image
  - This becomes the foundation for your image
- `WORKDIR /app`: Set working directory inside container to `/app`
  - All subsequent commands run from this directory
  - Creates the directory if it doesn't exist
- `COPY requirements.txt .`: Copy `requirements.txt` from your computer to `/app` in container
  - First `.` is source (your computer), second `.` is destination (current WORKDIR)
  - Copy dependencies file first for better caching
- `RUN pip install -r requirements.txt`: Install Python packages
  - Runs during image build (not at container runtime)
  - Creates a new layer in the image
- `COPY . .`: Copy all files from current directory to `/app`
  - Copies your application code
  - Done after installing dependencies (better cache usage)
- `CMD ["python", "app.py"]`: Default command to run when container starts
  - Can be overridden when running container
  - Uses exec form (recommended)

**Build the image:**

```bash
# Build from current directory
docker build -t my-app:latest .
```

**Breaking down the command:**
- `docker build`: Command to build an image
- `-t my-app:latest`: Tag the image with name `my-app` and tag `latest`
  - `-t` stands for "tag"
  - Format: `name:tag`
- `.`: Build context (current directory)
  - Docker sends all files in this directory to the build process
  - The `.` means "current directory"

**What happens during build:**
1. Docker reads the Dockerfile
2. Sends build context (current directory) to Docker daemon
3. Executes each instruction, creating layers
4. Caches layers for faster subsequent builds
5. Creates final image with tag `my-app:latest`

**Example build output:**
```
Sending build context to Docker daemon  2.048kB
Step 1/6 : FROM python:3.9-slim
 ---> abc123def456
Step 2/6 : WORKDIR /app
 ---> Running in xyz789
 ---> def456ghi789
Step 3/6 : COPY requirements.txt .
 ---> ghi789jkl012
...
Successfully built jkl012mno345
Successfully tagged my-app:latest
```

**Build with a different Dockerfile:**
```bash
# Build with a different Dockerfile
docker build -f Dockerfile.prod -t my-app:prod .
```

**What `-f` does:**
- `-f Dockerfile.prod`: Use `Dockerfile.prod` instead of default `Dockerfile`
- Useful for different build configurations (dev vs production)

**Build without cache:**
```bash
# Build without cache
docker build --no-cache -t my-app:latest .
```

**When to use `--no-cache`:**
- When you want to ensure fresh builds
- Debugging build issues
- After updating base images
- **Note:** Slower builds as it rebuilds all layers

### Build Context

The build context is the directory Docker uses when building an image. All files in this directory are sent to the Docker daemon.

**Understanding build context:**
```bash
# Build from a specific directory
docker build -t my-app /path/to/build/context
```

**What this does:**
- Uses `/path/to/build/context` as the build context
- All files in that directory are available to COPY commands
- Dockerfile should be in that directory (or use `-f` flag)

**Important:** The build context can be large. Docker sends everything to the daemon, which can be slow.

**Exclude files with .dockerignore:**

Create a `.dockerignore` file in your build context:

```bash
# .dockerignore file content:
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

**What `.dockerignore` does:**
- Works like `.gitignore`
- Excludes files from build context
- Reduces build time and image size
- Prevents sensitive files from being copied

**Why this matters:**
- Without `.dockerignore`: Docker sends ALL files (including `node_modules`, `.git`, etc.)
- With `.dockerignore`: Only necessary files are sent
- **Result:** Faster builds, smaller context, better security

**Example - Without .dockerignore:**
```bash
# Sending build context: 500MB (includes node_modules, .git, etc.)
```

**Example - With .dockerignore:**
```bash
# Sending build context: 5MB (only source code)
```

!!! tip "Build Context Best Practices"
    - Keep build context small
    - Use `.dockerignore` to exclude unnecessary files
    - Don't include large dependencies (they should be installed via RUN)
    - Never include secrets or credentials

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

Get detailed information about images to understand their structure and configuration.

**Inspect image details:**
```bash
# Inspect image details
docker inspect nginx:latest
```

**What this shows:**
- Complete image metadata (JSON format)
- Configuration (ports, environment, commands)
- Image ID, creation date, size
- Parent image information
- Layer information

**Example output (abbreviated):**
```json
{
  "Id": "sha256:abc123...",
  "RepoTags": ["nginx:latest"],
  "Created": "2024-01-15T10:00:00Z",
  "Size": 133000000,
  "Config": {
    "ExposedPorts": {"80/tcp": {}},
    "Env": ["PATH=/usr/local/sbin:..."],
    "Cmd": ["nginx", "-g", "daemon off;"]
  }
}
```

**View image history:**
```bash
# View image history
docker history nginx:latest
```

**What this shows:**
- All layers that make up the image
- Size of each layer
- Commands that created each layer
- Creation dates

**Example output:**
```
IMAGE          CREATED        CREATED BY                                      SIZE
abc123def456   2 weeks ago    /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon…   0B
def456ghi789   2 weeks ago    /bin/sh -c #(nop)  EXPOSE 80                    0B
ghi789jkl012   2 weeks ago    /bin/sh -c apt-get install -y nginx             50MB
...
```

**View image layers:**
```bash
# View image layers
docker image inspect nginx:latest --format='{{.RootFS.Layers}}'
```

**What this shows:**
- List of layer IDs (SHA256 hashes)
- Each layer represents a filesystem change
- Layers are shared between images (saves space)

## Removing Images

Free up disk space by removing unused images.

**Remove an image:**
```bash
# Remove an image
docker rmi nginx:latest
```

**What this does:**
- Deletes the image from local storage
- **Note:** Can't remove if containers are using it
- Frees up disk space

**Remove by ID:**
```bash
# Remove by ID
docker rmi <image_id>
```

**Use case:** When image has no tags or you know the exact ID

**Force remove:**
```bash
# Force remove (even if in use)
docker rmi -f nginx:latest
```

**What `-f` does:**
- `-f` stands for "force"
- Removes image even if containers are using it
- **Warning:** Can break running containers!
- Use with caution

**Remove unused images:**
```bash
# Remove unused images (dangling only)
docker image prune
```

**What this does:**
- Shows dangling images (untagged)
- Asks for confirmation
- Removes only dangling images
- Safe operation

**Remove all unused images:**
```bash
# Remove all unused images (not just dangling)
docker image prune -a
```

**What `-a` does:**
- `-a` stands for "all"
- Removes ALL images not used by containers
- **Warning:** Can remove images you might need later
- More aggressive cleanup

**Example output:**
```
WARNING! This will remove all images without at least one container associated to them.
Are you sure you want to continue? [y/N] y
Deleted Images:
untagged: myapp:old
deleted: sha256:abc123...
Total reclaimed space: 2.5GB
```

!!! tip "Image Cleanup Strategy"
    Regular cleanup prevents disk space issues:
    ```bash
    # Safe cleanup (dangling images only)
    docker image prune
    
    # Aggressive cleanup (all unused)
    docker image prune -a
    
    # Check disk usage first
    docker system df
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

