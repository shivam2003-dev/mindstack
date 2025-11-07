# Introduction to Docker

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🐳 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Docker and containerization concepts</li>
    <li>Install Docker on your system</li>
    <li>Learn Docker architecture and components</li>
    <li>Run your first container</li>
  </ul>
</div>

Welcome to the Docker course! Docker has revolutionized how we develop, ship, and run applications. In this course, you'll learn everything you need to master containerization.

## What is Docker?

Docker is a platform that uses containerization to package applications and their dependencies into lightweight, portable containers. These containers can run consistently across different environments.

!!! note "Why Docker Matters"
    Docker solves the "it works on my machine" problem by packaging applications with all their dependencies. Containers are isolated, portable, and consistent across development, staging, and production environments.

!!! tip "Getting Started"
    If you're new to containers, think of Docker as a lightweight alternative to virtual machines. Containers share the host OS kernel, making them much faster and more efficient than VMs.

## Why Docker?

!!! success "Benefits"
    - **Consistency**: Works the same on your machine, staging, and production
    - **Isolation**: Applications don't interfere with each other
    - **Portability**: Run anywhere Docker is installed
    - **Efficiency**: Lightweight compared to virtual machines
    - **Scalability**: Easy to scale applications horizontally

## Key Concepts

### Containers vs Virtual Machines

```mermaid
graph TB
    A[Host OS] --> B[Hypervisor]
    B --> C[VM 1]
    B --> D[VM 2]
    C --> E[Guest OS 1]
    D --> F[Guest OS 2]
    E --> G[App 1]
    F --> H[App 2]
    
    I[Host OS] --> J[Docker Engine]
    J --> K[Container 1]
    J --> L[Container 2]
    K --> M[App 1]
    L --> N[App 2]
```

### Docker Components

1. **Docker Image**: A read-only template for creating containers
2. **Docker Container**: A running instance of an image
3. **Dockerfile**: A text file with instructions to build an image
4. **Docker Hub**: A registry for Docker images

## Installation

### macOS

```bash
# Using Homebrew
brew install --cask docker

# Or download from docker.com
```

### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Verify Installation

```bash
docker --version
docker run hello-world
```

## Your First Container

```bash
# Run a simple container
docker run hello-world

# Run an interactive Ubuntu container
docker run -it ubuntu bash
```

!!! tip "Tip"
    The `-it` flags run the container in interactive mode with a TTY.

## What You'll Learn

In this course, we'll cover:

1. **Containers**: Creating and managing containers
2. **Images**: Building custom images
3. **Dockerfiles**: Writing efficient Dockerfiles
4. **Networking**: Connecting containers
5. **Volumes**: Managing persistent data
6. **Docker Compose**: Orchestrating multi-container applications

## Next Steps

Ready to dive in? Let's start by understanding containers in detail.

---

**Next Lesson**: [Working with Containers](02-containers.md)

