# Docker Networking

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🌐 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Docker network types</li>
    <li>Configure container networking</li>
    <li>Set up port mapping</li>
    <li>Troubleshoot network issues</li>
  </ul>
</div>

Understand Docker's networking capabilities and how containers communicate.

!!! tip "Network Best Practices"
    Use user-defined bridge networks instead of the default bridge. Containers on custom networks can communicate by name (DNS resolution). Isolate services with separate networks for better security.

!!! note "Port Mapping"
    The format is `-p host_port:container_port`. Use specific host ports in production. For development, you can let Docker assign random ports with `-p container_port` and check with `docker port`.

## Network Types

Docker provides several network types, each with different characteristics and use cases.

### Default Networks

Docker automatically creates three networks when installed:

```bash
# List networks
docker network ls
```

**What you'll see:**
```
NETWORK ID     NAME      DRIVER    SCOPE
abc123def456   bridge    bridge    local
def456ghi789   host      host      local
ghi789jkl012   none      null      local
```

**The three default networks:**
1. **bridge**: Default network for containers (most common)
2. **host**: Uses host's network directly (Linux only)
3. **none**: No networking (completely isolated)

**Inspect a network:**
```bash
# Inspect network
docker network inspect bridge
```

**What this shows:**
- Network configuration (subnet, gateway)
- Connected containers
- Network driver details
- IP address ranges

**Example output (abbreviated):**
```json
{
  "Name": "bridge",
  "Driver": "bridge",
  "IPAM": {
    "Config": [{"Subnet": "172.17.0.0/16"}]
  },
  "Containers": {
    "web": {
      "IPv4Address": "172.17.0.2/16"
    }
  }
}
```

### Bridge Network (Default)

The bridge network is Docker's default network. Containers on this network can communicate with each other and the outside world.

```bash
# Create container on default bridge
docker run -d --name web nginx
```

**What happens:**
- Container is automatically connected to `bridge` network
- Gets an IP address (usually 172.17.0.x)
- Can access internet (if host can)
- Can communicate with other containers on bridge

**Get container IP address:**
```bash
# Containers on default bridge can communicate by IP only
docker inspect web | grep IPAddress
```

**What you'll see:**
```
"IPAddress": "172.17.0.2"
```

**Limitations of default bridge:**
- Containers can't resolve each other by name
- Must use IP addresses for communication
- Less isolation between containers
- Not ideal for multi-container applications

**Example - Communication by IP:**
```bash
# Container 1
docker run -d --name web1 nginx

# Get IP of web1
WEB1_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web1)

# Container 2 can reach web1 by IP
docker run -it --rm alpine wget -O- http://$WEB1_IP
```

!!! note "Why Default Bridge Has Limitations"
    The default bridge network doesn't have automatic DNS resolution. This means containers can't find each other by name - you must use IP addresses. For better networking, use custom bridge networks.

### User-Defined Bridge Network

Custom bridge networks provide better features than the default bridge, especially automatic DNS resolution.

**Create a custom network:**
```bash
# Create custom bridge network
docker network create mynetwork
```

**What this does:**
- Creates a new bridge network named `mynetwork`
- Uses bridge driver (default)
- Gets its own subnet (usually 172.18.0.0/16, 172.19.0.0/16, etc.)
- Isolated from default bridge network

**Run containers on custom network:**
```bash
# Run containers on custom network
docker run -d --name web1 --network mynetwork nginx
docker run -d --name web2 --network mynetwork nginx
```

**What happens:**
- Both containers join `mynetwork`
- Each gets an IP address on this network
- **Key feature:** Automatic DNS resolution by container name

**Test DNS resolution:**
```bash
# Containers can communicate by name
docker exec web1 ping web2
```

**What this does:**
- `web1` can resolve `web2` by name (not just IP)
- Docker's built-in DNS resolves `web2` to its IP address
- Ping works using the container name

**Example output:**
```
PING web2 (172.18.0.3) 56(84) bytes of data.
64 bytes from web2.mynetwork (172.18.0.3): icmp_seq=1 ttl=64 time=0.123 ms
```

**Real-world example - Database connection:**
```bash
# Create network
docker network create app-network

# Run database
docker run -d --name db --network app-network \
  -e POSTGRES_PASSWORD=secret postgres

# Run application (can connect using 'db' as hostname)
docker run -d --name app --network app-network \
  -e DATABASE_URL=postgres://db:5432/mydb \
  my-app
```

**Why this works:**
- Application uses `db` as hostname (not IP address)
- Docker DNS resolves `db` to the database container's IP
- No need to know or hardcode IP addresses
- If database container restarts and gets new IP, DNS automatically updates

!!! success "Benefits of Custom Networks"
    - **Automatic DNS resolution**: Containers can find each other by name
    - **Better isolation**: Separate networks for different applications
    - **Easy management**: Attach/detach containers with `docker network connect/disconnect`
    - **Security**: Isolate services (frontend network, backend network, database network)
    - **Scalability**: Easy to add more containers to the network

### Host Network

```bash
# Use host network (Linux only)
docker run -d --name web --network host nginx

# Container uses host's network directly
# No port mapping needed
```

!!! warning "Warning"
    Host network bypasses Docker's network isolation. Use with caution.

### None Network

```bash
# Container with no network
docker run -d --name isolated --network none alpine sleep 3600

# Container has no network interfaces
docker exec isolated ip addr
```

## Network Drivers

### Bridge Driver

```bash
# Create bridge network with custom subnet
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  mybridge
```

### Overlay Network (Swarm)

```bash
# Initialize swarm
docker swarm init

# Create overlay network
docker network create \
  --driver overlay \
  --attachable \
  myoverlay
```

### Macvlan Network

```bash
# Create macvlan network
docker network create \
  --driver macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  mymacvlan
```

!!! info "Use Case"
    Macvlan allows containers to appear as physical devices on the network.

## Port Mapping

### Basic Port Mapping

```bash
# Map container port to host port
docker run -d -p 8080:80 nginx

# Map to specific interface
docker run -d -p 127.0.0.1:8080:80 nginx

# Map random host port
docker run -d -p 80 nginx
docker port <container_id>
```

### Port Range Mapping

```bash
# Map port range
docker run -d -p 8000-8010:8000-8010 myapp

# Map UDP port
docker run -d -p 53:53/udp dns-server
```

## Container Communication

### Linking Containers (Legacy)

```bash
# Legacy linking (deprecated)
docker run -d --name db postgres
docker run -d --name app --link db:database myapp
```

!!! warning "Deprecated"
    Use networks instead of links.

### Network Communication

```bash
# Create network
docker network create app-network

# Run database
docker run -d --name db --network app-network \
  -e POSTGRES_PASSWORD=secret postgres

# Run application
docker run -d --name app --network app-network \
  -e DATABASE_URL=postgres://db:5432/mydb \
  myapp
```

## Network Inspection

### View Network Details

```bash
# Inspect network
docker network inspect mynetwork

# Show network connections
docker network inspect mynetwork --format '{{range .Containers}}{{.Name}} {{end}}'
```

### Container Network Info

```bash
# View container network settings
docker inspect <container> | grep -A 20 NetworkSettings

# Execute network commands in container
docker exec <container> ip addr
docker exec <container> netstat -tulpn
```

## DNS Resolution

### Custom DNS

```bash
# Use custom DNS server
docker run -d --dns 8.8.8.8 --dns 8.8.4.4 nginx

# Disable DNS
docker run -d --network none nginx
```

### DNS Search Domains

```bash
# Add search domains
docker run -d --dns-search example.com nginx
```

## Network Troubleshooting

### Common Issues

```bash
# Check if containers can reach each other
docker exec container1 ping container2

# Test port connectivity
docker exec container1 nc -zv container2 80

# View network traffic
docker exec container1 tcpdump -i eth0

# Check DNS resolution
docker exec container1 nslookup container2
```

### Debug Network Problems

```bash
# List all networks
docker network ls

# Inspect network configuration
docker network inspect bridge

# Check container IP
docker inspect <container> | grep IPAddress

# Test connectivity
docker run --rm --network mynetwork \
  alpine ping -c 3 container_name
```

## Best Practices

1. **Use user-defined networks** instead of default bridge
2. **Isolate services** with separate networks
3. **Use DNS names** instead of IP addresses
4. **Limit network exposure** with firewall rules
5. **Monitor network traffic** in production

## Exercises

1. Create a custom bridge network and connect multiple containers
2. Set up a web server and database on the same network
3. Configure port mapping for a multi-service application
4. Troubleshoot a network connectivity issue between containers

---

**Previous**: [Advanced Dockerfiles](04-dockerfiles-advanced.md) | **Next**: [Volumes and Data Management](06-volumes.md)

