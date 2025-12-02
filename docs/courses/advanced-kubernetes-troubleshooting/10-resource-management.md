# Resource Management & Limits

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master resource requests and limits</li>
    <li>Understand resource quotas and limit ranges</li>
    <li>Learn advanced resource management patterns</li>
    <li>Troubleshoot resource-related issues</li>
    <li>Optimize resource utilization</li>
  </ul>
</div>

Effective resource management is critical for cluster stability and performance. Understanding requests, limits, quotas, and limit ranges enables optimal resource utilization.

!!! tip "Resource Requests vs Limits"
    **Requests**: Guaranteed resources (used for scheduling)
    **Limits**: Maximum resources (enforced by cgroups)

!!! warning "OOMKilled"
    Containers exceeding memory limits are killed (OOMKilled). Always set appropriate limits.

## Resource Requests and Limits

### Basic Resource Configuration

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:alpine
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

!!! note "CPU Units"
    CPU can be specified as: whole numbers (1, 2) or millicores (1000m = 1 CPU).

### Quality of Service Classes

Kubernetes assigns QoS classes based on resource configuration:

**Guaranteed:**
- All containers have requests = limits
- Highest priority, last to be evicted

**Burstable:**
- At least one container has request < limit
- Medium priority

**BestEffort:**
- No requests or limits
- Lowest priority, first to be evicted

!!! tip "QoS Strategy"
    Use Guaranteed QoS for critical workloads, Burstable for most applications, BestEffort only for non-critical.

## Resource Quotas

### Namespace Quota

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
    pods: "20"
```

!!! warning "Quota Enforcement"
    Resource quotas are enforced at namespace level. Plan quotas carefully to avoid blocking deployments.

## Limit Ranges

### Default Limits

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-limit-range
  namespace: default
spec:
  limits:
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "250m"
    type: Container
```

!!! note "Default Limits"
    Limit ranges provide defaults when containers don't specify resources. Prevents resource exhaustion.

## Troubleshooting

### Common Issues

#### Pods Pending (Insufficient Resources)

```bash
# Check node resources
kubectl describe node <node-name>

# Check resource requests
kubectl get pods -o custom-columns=NAME:.metadata.name,REQ-CPU:.spec.containers[*].resources.requests.cpu,REQ-MEM:.spec.containers[*].resources.requests.memory

# Check quota usage
kubectl describe quota -n <namespace>
```

!!! success "Troubleshooting Steps"
    1. Check node capacity
    2. Verify resource requests
    3. Check resource quotas
    4. Review pod scheduling events
    5. Consider node scaling

#### OOMKilled Pods

```bash
# Check pod status
kubectl get pods | grep OOMKilled

# Check memory usage
kubectl top pod <pod-name>

# Check limits
kubectl describe pod <pod-name> | grep -A 5 Limits
```

!!! danger "Memory Issues"
    OOMKilled indicates memory limit exceeded. Increase limits or optimize application memory usage.

## Best Practices

!!! success "Production Recommendations"
    1. Always set resource requests and limits
    2. Use Guaranteed QoS for critical workloads
    3. Implement resource quotas per namespace
    4. Set limit ranges for defaults
    5. Monitor resource usage
    6. Right-size resources based on metrics

---

**Next Chapter**: [Performance Tuning](11-performance-tuning.md)

