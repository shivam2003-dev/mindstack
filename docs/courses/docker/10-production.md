# Production Deployment

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🚀 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Deploy containers to production</li>
    <li>Implement deployment strategies</li>
    <li>Set up monitoring and logging</li>
    <li>Create backup and recovery plans</li>
  </ul>
</div>

Deploy Docker containers to production environments.

!!! success "Production Checklist"
    Before deploying: security scanning, resource limits, health checks, logging, monitoring, backups, and rollback plans. Never deploy without these in place.

!!! tip "Deployment Strategies"
    - **Blue-Green**: Zero downtime, easy rollback, requires double resources
    - **Rolling Updates**: Gradual rollout, less resource overhead
    - **Canary**: Test with small traffic, safest for critical systems
    Choose based on your requirements and infrastructure.

## Production Checklist

### Pre-Deployment

- [ ] Security scanning completed
- [ ] Resource limits configured
- [ ] Health checks implemented
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy defined
- [ ] Rollback plan prepared

## Deployment Strategies

### Blue-Green Deployment

```bash
# Deploy new version (green)
docker-compose -f docker-compose.green.yml up -d

# Test green deployment
curl http://green.example.com/health

# Switch traffic (update load balancer)
# Stop blue
docker-compose -f docker-compose.blue.yml down
```

### Rolling Updates

```yaml
# docker-compose.yml
services:
  web:
    image: myapp:v2
    deploy:
      update_config:
        parallelism: 2
        delay: 10s
        failure_action: rollback
```

### Canary Deployment

```bash
# Deploy canary (10% traffic)
docker run -d --name app-canary \
  -p 8081:80 \
  myapp:v2

# Monitor canary
# If successful, deploy to all
docker-compose up -d --scale web=10
```

## Orchestration

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Create service
docker service create \
  --name web \
  --replicas 3 \
  --publish 80:80 \
  myapp:latest

# Update service
docker service update --image myapp:v2 web

# Rollback
docker service rollback web
```

### Kubernetes (Basic)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:v1
        ports:
        - containerPort: 80
```

## Monitoring

### Logging

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Health Checks

```yaml
services:
  app:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Metrics

```bash
# Export metrics
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Use Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Push to registry
        run: docker push myapp:${{ github.sha }}
      - name: Deploy
        run: |
          docker-compose pull
          docker-compose up -d
```

## Backup and Recovery

### Database Backup

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec postgres pg_dump -U postgres mydb > \
  ${BACKUP_DIR}/mydb_${DATE}.sql

# Restore
docker exec -i postgres psql -U postgres mydb < \
  ${BACKUP_DIR}/mydb_20231108_120000.sql
```

### Volume Backup

```bash
# Backup volume
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup_$(date +%Y%m%d).tar.gz /data
```

## Disaster Recovery

### Recovery Plan

1. **Identify failure**: Monitor and alerting
2. **Isolate issue**: Stop affected services
3. **Restore from backup**: Database and volumes
4. **Redeploy**: Use last known good version
5. **Verify**: Health checks and monitoring
6. **Document**: Post-mortem analysis

## Best Practices

1. **Use orchestration** for production (Swarm/Kubernetes)
2. **Implement health checks** for all services
3. **Set resource limits** to prevent resource exhaustion
4. **Enable logging** with rotation
5. **Monitor metrics** continuously
6. **Automate deployments** with CI/CD
7. **Test rollback procedures** regularly
8. **Document runbooks** for common issues

## Exercises

1. Set up a production deployment with health checks
2. Configure automated backups
3. Create a CI/CD pipeline for deployment
4. Test a rollback procedure

---

**Previous**: [Performance Optimization](09-performance.md) | **Next**: [System Troubleshooting](11-troubleshooting.md)

