# Troubleshooting

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master systematic troubleshooting methodology</li>
    <li>Learn debugging techniques for containers and Kubernetes</li>
    <li>Understand network and performance troubleshooting</li>
    <li>Know production debugging strategies</li>
    <li>Handle common issues and incidents</li>
  </ul>
</div>

Troubleshooting is a critical DevOps skill. This comprehensive chapter covers systematic debugging approaches, tools, and techniques for production systems.

!!! tip "Interview Focus"
    Show systematic approach, use logs effectively, demonstrate problem-solving skills, and explain your thought process.

## Troubleshooting Methodology

### Systematic Approach

**1. Reproduce the Issue:**
- Understand what's happening
- Gather initial symptoms
- Reproduce in controlled environment
- Document steps to reproduce

**2. Gather Information:**
- Collect logs (application, system, access)
- Check metrics (CPU, memory, disk, network)
- Review recent changes
- Check error messages

**3. Analyze:**
- Identify patterns
- Correlate events
- Check dependencies
- Review configurations

**4. Hypothesize:**
- Form theories about root cause
- Prioritize most likely causes
- Consider multiple possibilities

**5. Test Hypothesis:**
- Test each theory
- Isolate variables
- Verify or disprove

**6. Fix:**
- Implement solution
- Test fix
- Verify resolution

**7. Verify:**
- Confirm issue is resolved
- Monitor for recurrence
- Check related systems

**8. Document:**
- Record problem and solution
- Update runbooks
- Share knowledge

## Container Troubleshooting

### Docker Debugging

**Check Container Status:**
```bash
# List containers
docker ps -a

# Inspect container
docker inspect container_name

# Check logs
docker logs container_name
docker logs -f container_name  # Follow logs
docker logs --tail 100 container_name  # Last 100 lines
docker logs --since 10m container_name  # Last 10 minutes

# Check exit code
docker ps -a  # Shows exit codes
```

**Execute Commands:**
```bash
# Run command in container
docker exec -it container_name /bin/sh

# Check processes
docker exec container_name ps aux

# Check network
docker exec container_name netstat -tulpn
docker exec container_name ifconfig

# Check environment variables
docker exec container_name env
```

**Resource Usage:**
```bash
# Container stats
docker stats container_name

# Detailed resource usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**Common Issues:**
- **Container won't start**: Check logs, verify image, check resources
- **Container exits immediately**: Check exit code, review logs
- **Out of memory**: Check memory limits, optimize application
- **Network issues**: Check network configuration, DNS, firewall

### Kubernetes Debugging

**Pod Issues:**
```bash
# Describe pod (shows events, status, conditions)
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow
kubectl logs <pod-name> --previous  # Previous container

# Execute in pod
kubectl exec -it <pod-name> -- /bin/sh

# Check pod events
kubectl get events --field-selector involvedObject.name=<pod-name>

# Check pod YAML
kubectl get pod <pod-name> -o yaml
```

**Service Issues:**
```bash
# Describe service
kubectl describe service <service-name>

# Check endpoints
kubectl get endpoints <service-name>

# Test service from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://service-name:port
```

**Deployment Issues:**
```bash
# Check deployment status
kubectl rollout status deployment/<deployment-name>

# View rollout history
kubectl rollout history deployment/<deployment-name>

# Rollback
kubectl rollout undo deployment/<deployment-name>

# Check replica sets
kubectl get replicasets
```

**Common Kubernetes Issues:**

**Pod in Pending State:**
```bash
# Check why pending
kubectl describe pod <pod-name>
# Common causes:
# - Insufficient resources
# - Node selector not matching
# - Taints/tolerations
# - PVC not bound
```

**Pod in CrashLoopBackOff:**
```bash
# Check logs
kubectl logs <pod-name> --previous

# Check events
kubectl describe pod <pod-name>

# Common causes:
# - Application error
# - Resource limits
# - Configuration error
# - Missing dependencies
```

**ImagePullBackOff:**
```bash
# Check image name and registry
kubectl describe pod <pod-name>

# Common causes:
# - Wrong image name
# - Private registry authentication
# - Network issues
# - Image doesn't exist
```

## Network Troubleshooting

### Connectivity Issues

**Test Connectivity:**
```bash
# Ping test
ping hostname
ping -c 4 8.8.8.8

# HTTP test
curl -v http://hostname:port
curl -I http://hostname:port  # Headers only

# DNS test
nslookup hostname
dig hostname
host hostname

# Port test
nc -zv hostname port
telnet hostname port
```

**Check Network Configuration:**
```bash
# Network interfaces
ip addr show
ifconfig

# Routing table
ip route show
route -n

# Network connections
netstat -tulpn
ss -tulpn
lsof -i :port

# Check firewall
iptables -L -n
ufw status
```

### Kubernetes Network Debugging

**Service Discovery:**
```bash
# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup service-name

# Check CoreDNS
kubectl get pods -n kube-system | grep coredns
kubectl logs -n kube-system <coredns-pod>

# Check service endpoints
kubectl get endpoints <service-name>
```

**Network Policies:**
```bash
# List network policies
kubectl get networkpolicies

# Describe network policy
kubectl describe networkpolicy <policy-name>

# Test connectivity
kubectl run -it --rm test --image=busybox --restart=Never -- wget -O- http://service:port
```

## Performance Troubleshooting

### CPU Issues

**Identify High CPU:**
```bash
# Top processes
top
htop

# Per-process CPU
ps aux --sort=-%cpu | head

# System load
uptime
cat /proc/loadavg

# CPU details
lscpu
cat /proc/cpuinfo
```

**Kubernetes CPU:**
```bash
# Pod CPU usage
kubectl top pod <pod-name>

# Node CPU usage
kubectl top node

# Check resource limits
kubectl describe pod <pod-name> | grep -A 5 "Limits"
```

### Memory Issues

**Identify Memory Issues:**
```bash
# Memory usage
free -h
cat /proc/meminfo

# Process memory
ps aux --sort=-%mem | head

# Check for OOM kills
dmesg | grep -i "out of memory"
journalctl -k | grep -i "out of memory"
```

**Kubernetes Memory:**
```bash
# Pod memory usage
kubectl top pod <pod-name>

# Check OOMKilled
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'

# Memory limits
kubectl describe pod <pod-name> | grep -A 5 "Limits"
```

### Disk I/O Issues

**Check Disk Usage:**
```bash
# Disk space
df -h
du -sh /path

# Disk I/O
iostat -x 1
iotop

# Inode usage
df -i
```

**Kubernetes Disk:**
```bash
# PVC status
kubectl get pvc

# Describe PVC
kubectl describe pvc <pvc-name>

# Check pod disk usage
kubectl exec <pod-name> -- df -h
```

## Application Troubleshooting

### Log Analysis

**Search Logs:**
```bash
# Search for errors
grep -i error /var/log/app.log
grep -E "ERROR|FATAL" /var/log/app.log

# Time-based search
grep "2024-01-15 10:" /var/log/app.log

# Count occurrences
grep -c "error" /var/log/app.log

# Context around matches
grep -C 5 "error" /var/log/app.log
```

**Log Aggregation:**
```bash
# Using ELK
# Search in Kibana
# Filter by time, level, service

# Using grep
tail -f /var/log/app.log | grep error
```

### Application Debugging

**Enable Debug Logging:**
```bash
# Environment variable
export LOG_LEVEL=DEBUG

# Application config
# Set log level to DEBUG

# Kubernetes
kubectl set env deployment/app LOG_LEVEL=DEBUG
```

**Profiling:**
```bash
# CPU profiling
# Use application profiler
# pprof for Go
# py-spy for Python

# Memory profiling
# Heap dumps
# Memory profilers
```

## Comprehensive Interview Questions

### Q1: A production service is slow, how do you troubleshoot?

**Answer:**

**Systematic Approach:**

1. **Check Metrics:**
   ```bash
   # CPU, memory, disk
   kubectl top pod <pod-name>
   # Or
   docker stats container_name
   ```

2. **Check Logs:**
   ```bash
   kubectl logs <pod-name> --tail=100
   # Look for errors, warnings, slow queries
   ```

3. **Check Network:**
   ```bash
   # Latency
   curl -w "@curl-format.txt" http://service
   # Connections
   netstat -an | grep ESTABLISHED | wc -l
   ```

4. **Check Database:**
   ```bash
   # Slow queries
   # Connection pool
   # Lock contention
   ```

5. **Check Dependencies:**
   ```bash
   # External APIs
   # Downstream services
   # Cache hit rate
   ```

6. **Profile Application:**
   - CPU profiling
   - Memory profiling
   - Identify bottlenecks

### Q2: Container keeps restarting, how do you debug?

**Answer:**

**Debugging Steps:**

1. **Check Exit Code:**
   ```bash
   docker ps -a  # Shows exit codes
   kubectl get pod <pod-name>  # Shows restart count
   ```

2. **Check Logs:**
   ```bash
   docker logs container_name
   kubectl logs <pod-name> --previous  # Previous container
   ```

3. **Check Events:**
   ```bash
   kubectl describe pod <pod-name>
   # Look for events, warnings, errors
   ```

4. **Check Resources:**
   ```bash
   kubectl describe pod <pod-name>
   # Check if OOMKilled
   # Check resource limits
   ```

5. **Check Configuration:**
   ```bash
   kubectl get pod <pod-name> -o yaml
   # Verify image, command, env vars
   ```

**Common Causes:**
- Application crash (check logs)
- Out of memory (OOMKilled)
- Health check failures
- Configuration errors
- Missing dependencies

### Q3: How do you troubleshoot a network issue in Kubernetes?

**Answer:**

**Debugging Steps:**

1. **Test Pod-to-Pod:**
   ```bash
   kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://service-name:port
   ```

2. **Check Service:**
   ```bash
   kubectl get svc <service-name>
   kubectl describe svc <service-name>
   kubectl get endpoints <service-name>
   ```

3. **Check DNS:**
   ```bash
   kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup service-name
   ```

4. **Check Network Policies:**
   ```bash
   kubectl get networkpolicies
   kubectl describe networkpolicy <policy-name>
   ```

5. **Check Pod Network:**
   ```bash
   kubectl exec <pod-name> -- ip addr
   kubectl exec <pod-name> -- ip route
   ```

**Common Issues:**
- Service selector mismatch
- Network policy blocking
- DNS resolution failure
- Port mismatch
- Firewall rules

## Recommended Resources

### Books
- **"The Site Reliability Workbook" by Google** - Production troubleshooting
- **"Debugging" by David Agans** - Systematic debugging

### Articles
- [Kubernetes Troubleshooting Guide](https://kubernetes.io/docs/tasks/debug/)
- [Docker Troubleshooting](https://docs.docker.com/config/containers/logging/)

---

**Previous**: [Security Best Practices](15-security) | **Next**: [Interview Questions](17-interview-questions)
