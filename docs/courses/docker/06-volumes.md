# Volumes and Data Management

<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 2rem; border-radius: 10px; color: #333; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: #333;">💾 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem; color: #333;">
    <li>Understand volume types and use cases</li>
    <li>Create and manage volumes</li>
    <li>Backup and restore data</li>
    <li>Share data between containers</li>
  </ul>
</div>

Learn how to manage persistent data in Docker containers.

!!! tip "Volume vs Bind Mount"
    Use named volumes for production data - they're managed by Docker and portable. Use bind mounts for development when you need direct host access. Named volumes have better performance and are easier to backup.

!!! warning "Data Persistence"
    Data in containers is ephemeral - it's lost when containers are removed. Always use volumes for important data. Test your backup and restore procedures regularly.

## Understanding Volumes

### Why Volumes?

- **Persistence**: Data survives container removal
- **Performance**: Better I/O performance than bind mounts
- **Portability**: Easy to backup and migrate
- **Sharing**: Multiple containers can share data

## Volume Types

### Named Volumes

```bash
# Create a named volume
docker volume create mydata

# Use volume in container
docker run -d -v mydata:/data nginx

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata
```

### Anonymous Volumes

```bash
# Create anonymous volume
docker run -d -v /data nginx

# Volume is created automatically
# Gets a random name like: 7a8b9c0d1e2f...
```

### Bind Mounts

```bash
# Mount host directory
docker run -d -v /host/path:/container/path nginx

# Mount with read-only
docker run -d -v /host/path:/container/path:ro nginx
```

!!! warning "Warning"
    Bind mounts can expose host filesystem. Use with caution.

## Volume Operations

### Create and Manage Volumes

```bash
# Create volume with driver
docker volume create \
  --driver local \
  --opt type=none \
  --opt device=/path/to/data \
  --opt o=bind \
  myvolume

# Remove volume
docker volume rm myvolume

# Remove all unused volumes
docker volume prune
```

### Backup and Restore

```bash
# Backup volume
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data

# Restore volume
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/backup.tar.gz"
```

## Volume Drivers

### Local Driver (Default)

```bash
# Create local volume
docker volume create --driver local myvolume
```

### NFS Volume

```bash
# Create NFS volume
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt device=:/path/to/nfs \
  --opt o=addr=192.168.1.100 \
  nfsvolume
```

### Volume Plugins

```bash
# Install volume plugin
docker plugin install vieux/sshfs

# Create volume with plugin
docker volume create \
  --driver vieux/sshfs \
  -o sshcmd=user@host:/path \
  -o password=secret \
  sshvolume
```

## Data Patterns

### Database Volumes

```bash
# PostgreSQL with persistent data
docker run -d \
  --name postgres \
  -v postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:13
```

### Application Data

```bash
# Application with config and data volumes
docker run -d \
  --name app \
  -v app_config:/app/config \
  -v app_data:/app/data \
  myapp
```

### Shared Volumes

```bash
# Multiple containers sharing volume
docker volume create shared_data

docker run -d --name app1 -v shared_data:/data app1
docker run -d --name app2 -v shared_data:/data app2
```

## Volume Best Practices

### Use Named Volumes

```dockerfile
# Dockerfile
VOLUME ["/data"]
```

```bash
# Run with named volume
docker run -v mydata:/data myapp
```

### Separate Data and Code

```bash
# Code in image, data in volume
docker run -d \
  -v app_data:/app/data \
  myapp
```

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
VOLUME="mydata"
DATE=$(date +%Y%m%d_%H%M%S)

docker run --rm \
  -v $VOLUME:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/${VOLUME}_${DATE}.tar.gz /data
```

## Troubleshooting Volumes

### Inspect Volume Contents

```bash
# List volume contents
docker run --rm -v mydata:/data alpine ls -la /data

# Check volume size
docker system df -v
```

### Permission Issues

```bash
# Fix permissions
docker run --rm \
  -v mydata:/data \
  alpine chown -R 1000:1000 /data
```

### Volume Not Mounting

```bash
# Check if volume exists
docker volume inspect mydata

# Verify mount point
docker inspect <container> | grep -A 10 Mounts

# Test volume access
docker exec <container> ls -la /data
```

## Exercises

1. Create a named volume and persist database data
2. Set up a backup script for a volume
3. Share a volume between multiple containers
4. Troubleshoot a volume permission issue

---

**Previous**: [Docker Networking](05-networking.md) | **Next**: [Docker Compose](07-docker-compose.md)

