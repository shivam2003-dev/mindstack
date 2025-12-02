# HPA & VPA Deep Dive

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Horizontal Pod Autoscaler (HPA)</li>
    <li>Understand Vertical Pod Autoscaler (VPA)</li>
    <li>Learn advanced autoscaling patterns</li>
    <li>Troubleshoot autoscaling issues</li>
    <li>Optimize autoscaling configurations</li>
  </ul>
</div>

Autoscaling enables dynamic resource adjustment based on demand. Understanding HPA and VPA is essential for cost optimization and performance.

!!! tip "Autoscaling Benefits"
    Autoscaling optimizes resource usage, reduces costs, and maintains performance under varying load.

!!! warning "Scaling Limits"
    Set appropriate min/max replicas to prevent excessive scaling or resource exhaustion.

## Horizontal Pod Autoscaler (HPA)

### Basic HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
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
```

!!! note "HPA Metrics"
    HPA can scale based on: CPU, memory, custom metrics, external metrics, object metrics.

### Custom Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custom-metrics-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

!!! tip "Custom Metrics"
    Custom metrics enable scaling based on application-specific metrics (requests, queue depth, etc.).

## Vertical Pod Autoscaler (VPA)

### VPA Configuration

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: web
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
```

!!! warning "VPA Modes"
    - **Off**: Only provides recommendations
    - **Initial**: Sets resources at pod creation
    - **Auto**: Updates resources dynamically (requires recreating pods)
    - **Recreate**: Recreates pods to apply changes

## Troubleshooting

### HPA Not Scaling

```bash
# Check HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa <hpa-name>

# Check metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/<ns>/pods

# Check HPA controller logs
kubectl logs -n kube-system <hpa-controller-pod>
```

!!! success "Troubleshooting Steps"
    1. Verify metrics are available
    2. Check HPA configuration
    3. Verify target resource exists
    4. Review HPA controller logs
    5. Check resource requests/limits

### VPA Issues

```bash
# Check VPA status
kubectl get vpa

# Check VPA recommendations
kubectl describe vpa <vpa-name>

# Check VPA recommender logs
kubectl logs -n kube-system <vpa-recommender-pod>
```

!!! note "VPA Recommendations"
    VPA needs time to collect metrics before providing recommendations. Monitor for several hours.

## Best Practices

!!! success "Production Recommendations"
    1. Set appropriate min/max replicas
    2. Use multiple metrics for HPA
    3. Test scaling behavior under load
    4. Monitor autoscaling events
    5. Use VPA for right-sizing recommendations
    6. Document autoscaling policies

---

**Next Chapter**: [Advanced Security Hardening](13-security-hardening.md)

