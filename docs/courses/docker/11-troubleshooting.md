# System Troubleshooting

Comprehensive guide to troubleshooting Docker issues in production systems.

## Diagnostic Tools

### Container Inspection

```bash
# Inspect container
docker inspect <container_id>

# View container logs
docker logs <container_id>
docker logs -f <container_id>  # Follow logs
docker logs --tail 100 <container_id>  # Last 100 lines

# View container processes
docker top <container_id>

# Execute commands in container
docker exec -it <container_id> /bin/sh
docker exec <container_id> ps aux
```

### System Information

```bash
# Docker system info
docker info

# Docker version
docker version

# System disk usage
docker system df
docker system df -v  # Detailed

# List all containers
docker ps -a

# List all images
docker images -a
```

## Common Issues

### Container Won't Start

```bash
# Check container status
docker ps -a | grep <container_name>

# View exit code
docker inspect <container> | grep ExitCode

# View logs
docker logs <container>

# Common causes:
# - Port already in use
# - Insufficient resources
# - Image not found
# - Configuration error
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8080
# or
netstat -tulpn | grep 8080

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 8081:80 nginx
```

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune

# Remove unused images
docker image prune -a

# Remove unused volumes (careful!)
docker volume prune

# Remove build cache
docker builder prune
```

### Container Crashes

```bash
# Check exit code
docker inspect <container> | grep -A 5 State

# View crash logs
docker logs <container>

# Check resource limits
docker stats <container>

# Restart policy
docker run --restart=unless-stopped myapp
```

## Network Troubleshooting

### Connectivity Issues

```bash
# Test container connectivity
docker exec <container> ping <target>

# Check DNS resolution
docker exec <container> nslookup <hostname>

# View network configuration
docker network inspect <network>

# List container networks
docker inspect <container> | grep -A 20 NetworkSettings
```

### Port Mapping Issues

```bash
# Verify port mapping
docker port <container>

# Test port connectivity
curl http://localhost:8080
nc -zv localhost 8080

# Check firewall
iptables -L -n | grep 8080
```

### DNS Problems

```bash
# Test DNS in container
docker exec <container> nslookup google.com

# Use custom DNS
docker run --dns 8.8.8.8 myapp

# Check /etc/resolv.conf
docker exec <container> cat /etc/resolv.conf
```

## Performance Issues

### High CPU Usage

```bash
# Monitor CPU
docker stats

# Check specific container
docker stats <container>

# Limit CPU
docker update --cpus="1.0" <container>

# Check processes in container
docker exec <container> top
```

### High Memory Usage

```bash
# Monitor memory
docker stats

# Check memory limit
docker inspect <container> | grep -i memory

# Set memory limit
docker update -m 512m <container>

# Check memory in container
docker exec <container> free -h
```

### Slow I/O

```bash
# Check storage driver
docker info | grep "Storage Driver"

# Monitor disk I/O
docker stats

# Use volumes instead of bind mounts
docker run -v myvolume:/data myapp  # Faster
# vs
docker run -v /host/path:/data myapp  # Slower
```

## Image Issues

### Image Pull Failures

```bash
# Check registry connectivity
docker pull hello-world

# Login to registry
docker login

# Pull with verbose output
docker pull -a myimage

# Check image layers
docker history myimage
```

### Build Failures

```bash
# Build with no cache
docker build --no-cache -t myapp .

# Build with progress
docker build --progress=plain -t myapp .

# Check build context size
du -sh .

# Verify Dockerfile syntax
docker build --dry-run .  # Not available, use linting tools
```

## Volume Issues

### Volume Not Mounting

```bash
# Check if volume exists
docker volume ls
docker volume inspect <volume>

# Verify mount point
docker inspect <container> | grep -A 10 Mounts

# Test volume access
docker exec <container> ls -la /data
```

### Permission Problems

```bash
# Check file permissions
docker exec <container> ls -la /data

# Fix permissions
docker run --rm -v myvolume:/data \
  alpine chown -R 1000:1000 /data

# Run as specific user
docker run --user 1000:1000 -v myvolume:/data myapp
```

## Log Analysis

### View Logs

```bash
# All logs
docker logs <container>

# Last N lines
docker logs --tail 100 <container>

# Follow logs
docker logs -f <container>

# Since timestamp
docker logs --since 2023-11-08T10:00:00 <container>

# Logs with timestamps
docker logs -t <container>
```

### Log Aggregation

```bash
# Use logging driver
docker run --log-driver=syslog myapp

# JSON file logging
docker run --log-opt max-size=10m \
  --log-opt max-file=3 myapp
```

## Debugging Techniques

### Interactive Debugging

```bash
# Run interactive container
docker run -it --rm alpine sh

# Attach to running container
docker attach <container>

# Execute shell in container
docker exec -it <container> /bin/sh
```

### Network Debugging

```bash
# Install network tools in container
docker exec <container> apk add curl wget  # Alpine
docker exec <container> apt-get install curl  # Debian

# Test connectivity
docker exec <container> curl http://target:port

# Capture network traffic
docker exec <container> tcpdump -i eth0
```

### Process Debugging

```bash
# List processes
docker exec <container> ps aux

# Check open files
docker exec <container> lsof

# Check environment
docker exec <container> env

# Check system resources
docker exec <container> df -h
docker exec <container> free -h
```

## Emergency Procedures

### Container Won't Stop

```bash
# Force stop
docker kill <container>

# Stop all containers
docker kill $(docker ps -q)
```

### System Recovery

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Clean up system
docker system prune -a --volumes

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# or restart Docker Desktop (macOS/Windows)
```

### Data Recovery

```bash
# Backup before cleanup
docker run --rm -v myvolume:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz /data

# Recover from backup
docker run --rm -v myvolume:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/backup.tar.gz -C /data
```

## Troubleshooting Checklist

### Container Issues

- [ ] Check container status (`docker ps -a`)
- [ ] View container logs (`docker logs`)
- [ ] Inspect container (`docker inspect`)
- [ ] Check resource usage (`docker stats`)
- [ ] Verify configuration
- [ ] Test connectivity
- [ ] Check dependencies

### System Issues

- [ ] Check disk space (`docker system df`)
- [ ] Verify Docker daemon is running
- [ ] Check system resources
- [ ] Review system logs
- [ ] Verify network connectivity
- [ ] Check firewall rules

### Performance Issues

- [ ] Monitor resource usage
- [ ] Check for resource limits
- [ ] Review application logs
- [ ] Analyze bottlenecks
- [ ] Optimize configuration
- [ ] Scale if needed

## Advanced Debugging

### Enable Debug Mode

```bash
# Docker daemon debug
# Edit /etc/docker/daemon.json
{
  "debug": true,
  "log-level": "debug"
}

# Restart Docker
sudo systemctl restart docker
```

### Use Debugging Tools

```bash
# Install debugging tools in image
FROM alpine
RUN apk add --no-cache strace gdb curl

# Or use debugging image
docker run -it --rm --pid=host \
  --cap-add SYS_PTRACE \
  alpine sh
```

## Exercises

1. Diagnose and fix a container that won't start
2. Troubleshoot a network connectivity issue
3. Resolve a performance problem
4. Recover data from a failed container

---

**Previous**: [Production Deployment](10-production.md) | **Next**: [Advanced Topics](12-advanced.md)

