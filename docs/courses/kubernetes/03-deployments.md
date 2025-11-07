# Deployments

Deployments are higher-level abstractions that manage ReplicaSets and Pods. They provide declarative updates, rolling updates, and rollback capabilities.

## What is a Deployment?

A Deployment provides:
- **Declarative updates** for Pods and ReplicaSets
- **Rolling updates** and rollbacks
- **Scaling** capabilities
- **Self-healing** (replaces failed pods)

!!! success "Key Benefit"
    Deployments manage the desired state of your application, automatically handling pod creation, updates, and scaling.

## Creating a Deployment

### Using YAML

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

Apply it:

```bash
kubectl apply -f deployment.yaml
```

### Using kubectl

```bash
# Create a deployment
kubectl create deployment nginx-deployment --image=nginx:1.21

# Create with replicas
kubectl create deployment nginx-deployment \
  --image=nginx:1.21 \
  --replicas=3
```

## Managing Deployments

### View Deployments

```bash
# List deployments
kubectl get deployments

# Get detailed information
kubectl describe deployment nginx-deployment

# View deployment status
kubectl rollout status deployment/nginx-deployment
```

### Scaling

```bash
# Scale deployment
kubectl scale deployment nginx-deployment --replicas=5

# Or edit the deployment
kubectl edit deployment nginx-deployment
```

Update the YAML:

```yaml
spec:
  replicas: 5
```

## Rolling Updates

### Update Image

```bash
# Update container image
kubectl set image deployment/nginx-deployment nginx=nginx:1.22

# Or edit the deployment
kubectl edit deployment nginx-deployment
```

### Update Strategy

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

!!! info "Rolling Update Parameters"
    - **maxSurge**: Maximum number of pods that can be created above desired count
    - **maxUnavailable**: Maximum number of pods that can be unavailable during update

### Monitor Rollout

```bash
# Watch rollout status
kubectl rollout status deployment/nginx-deployment

# View rollout history
kubectl rollout history deployment/nginx-deployment

# View specific revision
kubectl rollout history deployment/nginx-deployment --revision=2
```

## Rollbacks

### Rollback to Previous Version

```bash
# Rollback to previous version
kubectl rollout undo deployment/nginx-deployment

# Rollback to specific revision
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

### Rollback Strategy

```yaml
spec:
  revisionHistoryLimit: 10  # Keep 10 old ReplicaSets
```

## Deployment Strategies

### Rolling Update (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Gradually replaces old pods with new ones.

### Recreate

```yaml
spec:
  strategy:
    type: Recreate
```

Terminates all old pods before creating new ones (causes downtime).

!!! warning "Warning"
    Recreate strategy causes downtime. Use only when necessary.

## Advanced Deployment Features

### Pause and Resume

```bash
# Pause a deployment
kubectl rollout pause deployment/nginx-deployment

# Make changes
kubectl set image deployment/nginx-deployment nginx=nginx:1.23

# Resume
kubectl rollout resume deployment/nginx-deployment
```

### Canary Deployments

Deploy a new version alongside the old one:

```yaml
# Canary deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
      version: canary
  template:
    metadata:
      labels:
        app: nginx
        version: canary
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
```

### Blue-Green Deployments

Use two separate deployments and switch traffic between them.

## Health Checks in Deployments

```yaml
spec:
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Resource Management

```yaml
spec:
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

## Deleting Deployments

```bash
# Delete deployment (pods are also deleted)
kubectl delete deployment nginx-deployment

# Delete using file
kubectl delete -f deployment.yaml

# Delete with cascade=false (keeps pods)
kubectl delete deployment nginx-deployment --cascade=false
```

## Best Practices

1. **Use Deployments** instead of directly creating Pods
2. **Set resource limits** to prevent resource exhaustion
3. **Use health checks** (liveness and readiness probes)
4. **Keep revision history** for easy rollbacks
5. **Test rollouts** in staging before production
6. **Monitor rollout status** during updates

## Exercises

1. Create a deployment with 3 replicas
2. Scale the deployment to 5 replicas
3. Update the container image and monitor the rollout
4. Rollback to the previous version
5. Configure a canary deployment

---

**Previous**: [Understanding Pods](02-pods.md)

