# Logging & Tracing

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Implement centralized logging</li>
    <li>Master distributed tracing</li>
    <li>Learn log aggregation patterns</li>
    <li>Troubleshoot logging issues</li>
    <li>Optimize log collection and storage</li>
  </ul>
</div>

Centralized logging and distributed tracing provide visibility into application behavior. Understanding logging patterns and tracing enables effective troubleshooting.

!!! tip "Logging Strategy"
    Centralized logging enables searching across all services. Use structured logging for better analysis.

!!! warning "Log Volume"
    High log volume can impact performance and storage. Implement log rotation and retention policies.

## Centralized Logging

### EFK Stack (Elasticsearch, Fluentd, Kibana)

**Fluentd DaemonSet:**
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  template:
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

!!! note "Fluentd Collection"
    Fluentd runs as DaemonSet to collect logs from all nodes.

### Loki Stack

Loki provides log aggregation with Prometheus-like querying.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki-config
data:
  loki.yaml: |
    auth_enabled: false
    server:
      http_listen_port: 3100
    ingester:
      lifecycler:
        address: 127.0.0.1
        ring:
          kvstore:
            store: inmemory
          replication_factor: 1
```

!!! tip "Loki Benefits"
    Loki is designed for Kubernetes, integrates with Prometheus, and uses object storage.

## Distributed Tracing

### OpenTelemetry

OpenTelemetry provides vendor-neutral instrumentation.

```yaml
# OpenTelemetry Collector
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
spec:
  template:
    spec:
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector
        args:
        - --config=/etc/otel-collector-config.yaml
```

!!! note "Tracing Benefits"
    Distributed tracing shows request flow across services, enabling performance optimization.

### Jaeger

Jaeger provides distributed tracing backend.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  template:
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one
        ports:
        - containerPort: 16686
```

## Troubleshooting

### Logging Issues

#### Logs Not Collected

```bash
# Check Fluentd pods
kubectl get pods -n logging

# Check Fluentd logs
kubectl logs -n logging fluentd-<node>

# Verify log paths
kubectl exec -n logging fluentd-<pod> -- ls -la /var/log
```

#### High Log Volume

```bash
# Check log sizes
kubectl exec <pod> -- du -sh /var/log/*

# Review log retention
kubectl get configmap fluentd-config -o yaml

# Check Elasticsearch indices
curl http://elasticsearch:9200/_cat/indices
```

## Best Practices

!!! success "Production Recommendations"
    1. Use structured logging (JSON)
    2. Implement log rotation
    3. Set appropriate retention policies
    4. Use distributed tracing for microservices
    5. Monitor log collection performance
    6. Document logging architecture

---

**Next Chapter**: [Troubleshooting Methodology](17-troubleshooting-methodology.md)

