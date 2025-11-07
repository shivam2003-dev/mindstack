# Kubernetes Mastery

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Kubernetes architecture</li>
    <li>Understand pods, services, deployments</li>
    <li>Learn advanced Kubernetes concepts</li>
    <li>Know production best practices</li>
  </ul>
</div>

Kubernetes is essential for container orchestration. This chapter covers Kubernetes from fundamentals to advanced topics.

!!! tip "Interview Focus"
    Be ready to explain Kubernetes architecture, design deployments, and troubleshoot issues. Understand when to use which resource.

## Kubernetes Architecture

### Components

**Master Node:**
- **API Server**: Entry point for all operations
- **etcd**: Key-value store for cluster state
- **Scheduler**: Assigns pods to nodes
- **Controller Manager**: Manages controllers

**Worker Nodes:**
- **kubelet**: Agent managing pods
- **kube-proxy**: Network proxy
- **Container Runtime**: Docker, containerd, etc.

## Core Resources

### Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
```

### Deployments

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
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
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### Services

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Common Commands

```bash
# Get resources
kubectl get pods
kubectl get services
kubectl get deployments

# Describe resource
kubectl describe pod <pod-name>

# Logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>

# Execute command
kubectl exec -it <pod-name> -- /bin/sh

# Apply manifest
kubectl apply -f deployment.yaml

# Delete
kubectl delete pod <pod-name>
```

## Comprehensive Interview Questions

### Q1: Explain Kubernetes architecture in detail

**Answer:**

**Master Node (Control Plane):**
- **API Server**: Entry point for all operations, validates requests
- **etcd**: Key-value store for cluster state, configuration
- **Scheduler**: Assigns pods to nodes based on resources
- **Controller Manager**: Manages controllers (replication, endpoints, etc.)

**Worker Nodes:**
- **kubelet**: Agent managing pods on the node
- **kube-proxy**: Network proxy, load balancing
- **Container Runtime**: Docker, containerd, CRI-O

**Key Concepts:**
- **Pods**: Smallest deployable unit, one or more containers
- **Services**: Network abstraction for pods
- **Deployments**: Manage pod replicas

### Q2: What is the difference between Deployment and StatefulSet?

**Answer:**

**Deployment:**
- Stateless applications
- Random pod names (nginx-deployment-abc123)
- Shared storage (all pods can access same volume)
- No ordering guarantees
- Use for: Web servers, APIs, stateless apps

**StatefulSet:**
- Stateful applications
- Ordered pod names (mysql-0, mysql-1, mysql-2)
- Persistent storage per pod (each pod has its own volume)
- Ordered deployment and scaling
- Use for: Databases, stateful services

**Example:**
```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  # Pods: nginx-abc123, nginx-def456, nginx-ghi789

# StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  replicas: 3
  # Pods: mysql-0, mysql-1, mysql-2 (ordered)
```

### Q3: Explain Kubernetes Services in detail

**Answer:**

**Service Types:**

1. **ClusterIP (default)**: Internal service
   ```yaml
   type: ClusterIP
   # Accessible only within cluster
   # Use for: Internal services
   ```

2. **NodePort**: Exposes service on node's IP
   ```yaml
   type: NodePort
   # Accessible via <NodeIP>:<NodePort>
   # Use for: Development, testing
   ```

3. **LoadBalancer**: External load balancer
   ```yaml
   type: LoadBalancer
   # Cloud provider creates load balancer
   # Use for: Production external access
   ```

4. **ExternalName**: Maps to external DNS
   ```yaml
   type: ExternalName
   externalName: external-service.example.com
   # Use for: External services
   ```

### Q4: How do you scale applications in Kubernetes?

**Answer:**

**Manual Scaling:**
```bash
kubectl scale deployment nginx --replicas=5
```

**Horizontal Pod Autoscaler (HPA):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Vertical Pod Autoscaler (VPA):**
- Adjusts resource requests/limits
- Not recommended for production

### Q5: Explain ConfigMaps and Secrets

**Answer:**

**ConfigMap**: Non-sensitive configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "postgres://localhost:5432/mydb"
  log_level: "info"
```

**Secret**: Sensitive data (base64 encoded)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  password: cGFzc3dvcmQ=  # base64 encoded
```

**Usage in Pod:**
```yaml
spec:
  containers:
  - name: app
    envFrom:
    - configMapRef:
        name: app-config
    - secretRef:
        name: app-secret
```

### Q6: How do you update a deployment without downtime?

**Answer:**

**Rolling Update (default):**
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Can have 1 extra pod
    maxUnavailable: 0  # No downtime
```

**Process:**
1. Create new pod with new version
2. Wait for new pod to be ready
3. Remove old pod
4. Repeat until all pods updated

**Monitor:**
```bash
kubectl rollout status deployment/nginx
kubectl rollout history deployment/nginx
kubectl rollout undo deployment/nginx  # Rollback
```

### Q7: Explain Kubernetes namespaces

**Answer:**
Namespaces provide logical separation of resources.

```bash
# List namespaces
kubectl get namespaces

# Create namespace
kubectl create namespace production

# Use namespace
kubectl apply -f deployment.yaml -n production
```

**Default namespaces:**
- `default`: Default namespace
- `kube-system`: System components
- `kube-public`: Public resources
- `kube-node-lease`: Node heartbeats

### Q8: How do you troubleshoot a pod that won't start?

**Answer:**
```bash
# Describe pod (shows events and status)
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow logs

# Check previous container logs (if crashed)
kubectl logs <pod-name> --previous

# Execute in pod
kubectl exec -it <pod-name> -- /bin/sh

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check node resources
kubectl describe node <node-name>
```

### Q9: Explain Kubernetes resource limits and requests

**Answer:**
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"      # 0.25 CPU
  limits:
    memory: "128Mi"
    cpu: "500m"      # 0.5 CPU
```

**Requests**: Guaranteed resources (scheduling)
**Limits**: Maximum resources (throttling/killing)

**Best practices:**
- Always set requests and limits
- Start with reasonable values
- Monitor and adjust based on usage

### Q10: Explain Ingress and Ingress Controllers

**Answer:**
Ingress provides HTTP/HTTPS routing to services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

**Ingress Controllers:**
- NGINX Ingress Controller
- Traefik
- AWS ALB Ingress Controller
- Istio Gateway

## Recommended Resources

### Books
- **"Kubernetes: Up and Running" by Kelsey Hightower** - Comprehensive K8s guide
- **"The Kubernetes Book" by Nigel Poulton** - Clear explanations
- **"Kubernetes in Action" by Marko Lukša** - Deep dive into K8s

### Articles
- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)

### Research Papers
- **"Borg, Omega, and Kubernetes"** - Google's container orchestration evolution
- **"Kubernetes: The Container Orchestration Platform"** - Architecture overview

---

**Previous**: [Docker Deep Dive](05-docker-deep-dive) | **Next**: [Container Orchestration](07-container-orchestration)

