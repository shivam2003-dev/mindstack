# Performance Tuning

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Identify performance bottlenecks</li>
    <li>Optimize cluster and node performance</li>
    <li>Learn advanced tuning techniques</li>
    <li>Troubleshoot performance issues</li>
    <li>Implement performance monitoring</li>
  </ul>
</div>

Performance optimization is critical for production clusters. Understanding bottlenecks and tuning techniques ensures optimal cluster performance.

!!! tip "Performance Monitoring"
    Always measure before optimizing. Use metrics to identify bottlenecks, not assumptions.

!!! warning "Over-Optimization"
    Premature optimization can add complexity. Optimize based on actual bottlenecks.

## Performance Metrics

### Key Metrics to Monitor

**Cluster Level:**
- API server latency
- etcd performance
- Scheduler latency
- Controller reconciliation time

**Node Level:**
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput

**Application Level:**
- Pod startup time
- Request latency
- Throughput
- Error rates

!!! note "Baseline Metrics"
    Establish baseline metrics before optimization. Compare before/after measurements.

## API Server Optimization

### Tuning Flags

```bash
# API server performance flags
--max-requests-inflight=400
--max-mutating-requests-inflight=200
--request-timeout=60s
--min-request-timeout=1800
```

!!! tip "Request Limits"
    Adjust request limits based on cluster size and workload. Monitor API server metrics.

### etcd Optimization

```bash
# etcd performance flags
--quota-backend-bytes=8589934592
--max-request-bytes=1572864
--heartbeat-interval=100
--election-timeout=1000
```

!!! warning "etcd Performance"
    etcd performance directly impacts API server. Use SSD storage and optimize network.

## Node Optimization

### Kubelet Tuning

```yaml
# kubelet configuration
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
maxPods: 110
podPidsLimit: 4096
serializeImagePulls: true
```

!!! note "Node Capacity"
    Tune maxPods based on node resources. Higher values enable more pods but increase overhead.

### Container Runtime

```yaml
# containerd configuration
[plugins."io.containerd.grpc.v1.cri"]
  max_concurrent_downloads = 3
  snapshotter = "overlayfs"
```

!!! tip "Runtime Tuning"
    Optimize container runtime for faster image pulls and container startup.

## Application Optimization

### Resource Right-Sizing

```bash
# Use Vertical Pod Autoscaler recommendations
kubectl get vpa <vpa-name> -o yaml

# Analyze resource usage
kubectl top pods --all-namespaces
```

!!! success "Right-Sizing"
    Right-sized resources improve utilization and reduce costs.

### Image Optimization

```dockerfile
# Use multi-stage builds
FROM builder AS build
# ... build steps ...

FROM alpine:latest
COPY --from=build /app /app
# Smaller images = faster pulls
```

!!! tip "Image Size"
    Smaller images reduce pull time and improve pod startup performance.

## Troubleshooting

### Performance Issues

#### High API Server Latency

```bash
# Check API server metrics
kubectl get --raw /metrics | grep apiserver_request_latencies

# Check etcd performance
ETCDCTL_API=3 etcdctl endpoint status

# Review API server logs
kubectl logs -n kube-system kube-apiserver-<node>
```

#### Slow Pod Startup

```bash
# Check image pull time
kubectl get events --field-selector involvedObject.name=<pod-name>

# Check node resources
kubectl describe node <node-name>

# Review kubelet logs
journalctl -u kubelet -f
```

## Best Practices

!!! success "Production Recommendations"
    1. Monitor performance metrics continuously
    2. Establish performance baselines
    3. Optimize based on actual bottlenecks
    4. Test optimizations in non-production
    5. Document performance tuning changes
    6. Regular performance reviews

---

**Next Chapter**: [HPA & VPA Deep Dive](12-hpa-vpa.md)

