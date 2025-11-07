# Container Orchestration

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master advanced container orchestration concepts</li>
    <li>Understand Kubernetes advanced features and patterns</li>
    <li>Learn scaling strategies and auto-scaling in depth</li>
    <li>Know deployment strategies and rollback mechanisms</li>
    <li>Understand service mesh and advanced networking</li>
  </ul>
</div>

Container orchestration is the automated management of containerized applications at scale. This comprehensive chapter covers advanced orchestration patterns, strategies, and production best practices.

!!! tip "Interview Focus"
    Be ready to explain complex orchestration scenarios, design scalable systems, and discuss trade-offs between different approaches.

## Understanding Container Orchestration

### What is Container Orchestration?

Container orchestration automates the deployment, scaling, and management of containerized applications. It handles:

- **Scheduling**: Deciding where containers run
- **Scaling**: Adjusting number of containers based on load
- **Health Monitoring**: Detecting and replacing failed containers
- **Service Discovery**: Finding and connecting services
- **Load Balancing**: Distributing traffic across containers
- **Rolling Updates**: Updating applications without downtime
- **Resource Management**: Allocating CPU, memory, and storage

!!! note "Why Orchestration Matters"
    Manual container management doesn't scale. Orchestration enables:
    - Managing hundreds or thousands of containers
    - Automatic recovery from failures
    - Efficient resource utilization
    - Zero-downtime deployments

## Advanced Scaling Strategies

### Manual Scaling

**Basic scaling:**
```bash
# Scale deployment to specific number of replicas
kubectl scale deployment nginx --replicas=5

# Scale statefulset
kubectl scale statefulset mysql --replicas=3

# Scale based on current replicas
kubectl scale deployment nginx --replicas=10 --current-replicas=5
```

**When to use manual scaling:**
- Known traffic patterns (e.g., scheduled events)
- Initial capacity planning
- Testing specific replica counts
- Emergency scaling during incidents

### Horizontal Pod Autoscaler (HPA)

HPA automatically scales the number of pods based on observed metrics.

**Basic HPA Configuration:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
  namespace: default
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
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

**Understanding HPA Behavior:**
- **`minReplicas`**: Minimum number of pods (always running)
- **`maxReplicas`**: Maximum number of pods (prevents runaway scaling)
- **`stabilizationWindowSeconds`**: Prevents rapid scaling oscillations
- **`policies`**: Control how fast scaling happens

**Custom Metrics HPA:**
```yaml
metrics:
- type: Pods
  pods:
    metric:
      name: requests_per_second
    target:
      type: AverageValue
      averageValue: "100"
```

!!! tip "HPA Best Practices"
    - Set appropriate min/max replicas
    - Use stabilization windows to prevent thrashing
    - Monitor HPA decisions and adjust thresholds
    - Combine CPU and memory metrics for better decisions
    - Use custom metrics for application-specific scaling

### Vertical Pod Autoscaler (VPA)

VPA adjusts resource requests and limits based on historical usage.

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nginx-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  updatePolicy:
    updateMode: "Auto"  # or "Off", "Initial"
  resourcePolicy:
    containerPolicies:
    - containerName: nginx
      minAllowed:
        cpu: 100m
        memory: 50Mi
      maxAllowed:
        cpu: 1
        memory: 500Mi
```

**VPA Modes:**
- **`Off`**: Only provides recommendations
- **`Initial`**: Sets resources only at pod creation
- **`Auto`**: Automatically updates resources (requires pod recreation)

!!! warning "VPA Limitations"
    VPA requires pod recreation to apply changes, causing brief downtime. Not recommended for production without careful planning.

### Cluster Autoscaler

Cluster Autoscaler automatically adjusts the size of the Kubernetes cluster.

**How it works:**
1. Monitors pending pods that can't be scheduled
2. Adds nodes if pods are pending
3. Removes nodes if underutilized (after grace period)

**Configuration:**
```yaml
# Cluster Autoscaler deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        - --nodes=1:10:node-group-name
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m
```

## Advanced Resource Management

### Resource Requests and Limits

**Understanding Requests vs Limits:**

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"      # 0.25 CPU cores
  limits:
    memory: "128Mi"
    cpu: "500m"      # 0.5 CPU cores
```

**Requests:**
- Guaranteed resources for the container
- Used by scheduler to place pods
- Container gets at least this amount
- If not specified, defaults to limits or node capacity

**Limits:**
- Maximum resources container can use
- CPU: Throttled if exceeds limit
- Memory: Container killed (OOMKilled) if exceeds limit
- If not specified, container can use all node resources

**CPU Units:**
- `1` = 1 CPU core
- `1000m` = 1 CPU core
- `500m` = 0.5 CPU cores
- `250m` = 0.25 CPU cores

**Memory Units:**
- `Mi` = Mebibytes (1024^2 bytes)
- `Gi` = Gibibytes (1024^3 bytes)
- `M` = Megabytes (1000^2 bytes)
- `G` = Gigabytes (1000^3 bytes)

### Quality of Service (QoS) Classes

Kubernetes assigns QoS classes based on resource configuration:

**Guaranteed:**
- All containers have requests = limits
- Highest priority, last to be evicted
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "64Mi"
    cpu: "250m"
```

**Burstable:**
- At least one container has request < limit
- Medium priority
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

**BestEffort:**
- No requests or limits specified
- Lowest priority, first to be evicted
```yaml
# No resources section
```

### Resource Quotas

Limit total resources in a namespace:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    persistentvolumeclaims: "10"
    pods: "100"
```

### Limit Ranges

Set default and max/min limits for containers:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-limit-range
  namespace: production
spec:
  limits:
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "250m"
    max:
      memory: "1Gi"
      cpu: "1"
    min:
      memory: "128Mi"
      cpu: "100m"
    type: Container
```

## Advanced Deployment Strategies

### Rolling Update (Default)

Gradually replaces old pods with new ones.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Can have 1 extra pod during update
      maxUnavailable: 0  # No downtime (0 unavailable pods)
  template:
    # Pod template
```

**Rolling Update Process:**
1. Create new pod with new version
2. Wait for new pod to be ready (readiness probe)
3. Remove old pod
4. Repeat until all pods updated

**Configuration Options:**
- **`maxSurge`**: Maximum pods that can be created above desired count
  - Integer: Exact number (e.g., `1`)
  - Percentage: Percentage of replicas (e.g., `25%`)
- **`maxUnavailable`**: Maximum pods that can be unavailable
  - `0`: No downtime (requires maxSurge >= 1)
  - `1`: One pod can be down during update

### Blue-Green Deployment

Deploy new version alongside old, switch traffic when ready.

**Implementation with Services:**
```yaml
# Blue deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: app
        image: myapp:v1.0

---
# Green deployment (new)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: app
        image: myapp:v2.0

---
# Service pointing to blue
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
    version: blue  # Switch to 'green' to deploy new version
  ports:
  - port: 80
```

**Blue-Green Process:**
1. Deploy green version (new)
2. Test green version
3. Switch service selector to green
4. Monitor green version
5. Keep blue for quick rollback

**Advantages:**
- Instant rollback (switch selector back)
- No version mixing during transition
- Easy to test new version before switching

**Disadvantages:**
- Requires double resources during deployment
- More complex to implement
- Database migrations need careful handling

### Canary Deployment

Gradually roll out new version to subset of users.

**Implementation:**
```yaml
# Stable deployment (90% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-stable
spec:
  replicas: 9
  template:
    metadata:
      labels:
        app: myapp
        version: stable
    spec:
      containers:
      - name: app
        image: myapp:v1.0

---
# Canary deployment (10% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: myapp
        version: canary
    spec:
      containers:
      - name: app
        image: myapp:v2.0

---
# Service with both versions
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp  # Matches both stable and canary
  ports:
  - port: 80
```

**Canary with Istio (Advanced):**
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: app-vs
spec:
  hosts:
  - app.example.com
  http:
  - match:
    - headers:
        user-agent:
          regex: ".*Mobile.*"
    route:
    - destination:
        host: app
        subset: canary
      weight: 10
    - destination:
        host: app
        subset: stable
      weight: 90
  - route:
    - destination:
        host: app
        subset: stable
      weight: 100
```

**Canary Process:**
1. Deploy canary with small percentage (e.g., 5%)
2. Monitor metrics (error rate, latency, throughput)
3. Gradually increase canary percentage (5% → 10% → 25% → 50% → 100%)
4. Rollback if issues detected

### A/B Testing Deployment

Similar to canary but for feature testing.

**Use Cases:**
- Testing new features with specific user segments
- Comparing two different implementations
- Gradual feature rollout

## Service Mesh and Advanced Networking

### What is Service Mesh?

Service mesh provides:
- **Traffic Management**: Load balancing, routing, circuit breaking
- **Security**: mTLS, authentication, authorization
- **Observability**: Metrics, logs, traces
- **Policy Enforcement**: Rate limiting, access control

### Istio Service Mesh

**Installation:**
```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*

# Install
istioctl install --set profile=default

# Enable sidecar injection
kubectl label namespace default istio-injection=enabled
```

**Traffic Management:**
```yaml
# VirtualService - Define routing rules
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 50
    - destination:
        host: reviews
        subset: v3
      weight: 50
```

**Circuit Breaker:**
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        http2MaxRequests: 2
        maxRequestsPerConnection: 1
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

## Comprehensive Interview Questions

### Q1: Explain the difference between HPA, VPA, and Cluster Autoscaler

**Answer:**

**Horizontal Pod Autoscaler (HPA):**
- Scales number of pods horizontally
- Adds/removes pods based on metrics
- Works within existing cluster
- Best for stateless applications

**Vertical Pod Autoscaler (VPA):**
- Adjusts resource requests/limits
- Changes CPU/memory per pod
- Requires pod recreation
- Best for applications with predictable resource needs

**Cluster Autoscaler:**
- Scales cluster nodes
- Adds/removes nodes based on demand
- Works at infrastructure level
- Best for dynamic workloads

**When to use which:**
- Use HPA for most applications (stateless)
- Use VPA for stateful apps with predictable patterns
- Use Cluster Autoscaler when nodes are full

### Q2: Design a zero-downtime deployment strategy

**Answer:**

**Approach 1: Rolling Update with Proper Configuration**
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 2        # Allow 2 extra pods
    maxUnavailable: 0  # No downtime
```

**Approach 2: Blue-Green Deployment**
- Deploy new version alongside old
- Switch traffic when ready
- Instant rollback capability

**Approach 3: Canary Deployment**
- Gradual rollout
- Monitor at each stage
- Rollback if issues

**Key Requirements:**
- Readiness probes must be accurate
- Application must handle graceful shutdown
- Database migrations must be backward compatible
- Session affinity considerations

### Q3: How do you handle database migrations in containerized applications?

**Answer:**

**Strategy 1: Separate Migration Job**
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: app:migrate
        command: ["/bin/sh", "-c", "alembic upgrade head"]
      restartPolicy: Never
```

**Strategy 2: Init Container**
```yaml
spec:
  initContainers:
  - name: migrate
    image: app:migrate
    command: ["alembic", "upgrade", "head"]
  containers:
  - name: app
    image: app:latest
```

**Best Practices:**
- Migrations must be backward compatible
- Use feature flags for new schema
- Test migrations in staging first
- Have rollback plan ready

### Q4: Explain Kubernetes networking in detail

**Answer:**

**Pod Networking:**
- Each pod gets unique IP
- Pods can communicate directly
- No NAT between pods

**Service Networking:**
- ClusterIP: Virtual IP, load balances to pods
- kube-proxy implements load balancing
- Uses iptables or IPVS

**Network Policies:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

**CNI Plugins:**
- Calico: Policy-based networking
- Flannel: Simple overlay network
- Weave: Encrypted networking
- Cilium: eBPF-based networking

### Q5: How do you implement service discovery in Kubernetes?

**Answer:**

**Built-in Service Discovery:**
- Services provide DNS names
- Format: `<service-name>.<namespace>.svc.cluster.local`
- Automatic DNS resolution

**Example:**
```yaml
# Service
apiVersion: v1
kind: Service
metadata:
  name: database
  namespace: production
spec:
  selector:
    app: mysql
  ports:
  - port: 3306

# Pod can connect using:
# database.production.svc.cluster.local:3306
# or just: database:3306 (same namespace)
```

**External Service Discovery:**
- ExternalName services
- Endpoints for external services
- Service mesh (Istio, Linkerd)

## Recommended Resources

### Books
- **"Kubernetes Patterns" by Bilgin Ibryam, Roland Huß** - Design patterns for K8s
- **"Production Kubernetes" by Josh Rosso, Rich Lander, Alex Brand, John Harris** - Production best practices

### Articles
- [Kubernetes Autoscaling Guide](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

### Research Papers
- **"Borg: The Next Generation"** - Large-scale cluster management
- **"Omega: Flexible, Scalable Schedulers"** - Kubernetes scheduler design

---

**Previous**: [Kubernetes Mastery](06-kubernetes-mastery) | **Next**: [CI/CD Pipelines](08-cicd-pipelines)
