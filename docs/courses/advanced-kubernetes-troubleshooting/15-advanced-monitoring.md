# Advanced Monitoring & Metrics

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Prometheus and Grafana</li>
    <li>Understand custom metrics and exporters</li>
    <li>Learn advanced alerting patterns</li>
    <li>Troubleshoot monitoring issues</li>
    <li>Optimize monitoring performance</li>
  </ul>
</div>

Comprehensive monitoring is essential for production clusters. Understanding Prometheus, custom metrics, and alerting enables proactive issue detection and resolution.

!!! tip "Observability"
    Monitoring provides visibility into cluster health. Combine metrics, logs, and traces for full observability.

!!! warning "Monitoring Overhead"
    Monitoring adds overhead. Balance comprehensiveness with performance impact.

## Prometheus Architecture

### Prometheus Components

**Prometheus Server:**
- Scrapes metrics from targets
- Stores time-series data
- Evaluates alerting rules

**Exporters:**
- Expose metrics in Prometheus format
- Node Exporter, cAdvisor, kube-state-metrics

**Alertmanager:**
- Handles alert routing and grouping
- Sends notifications

!!! note "Prometheus Operator"
    Prometheus Operator simplifies Prometheus deployment and management in Kubernetes.

### Prometheus Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node
```

## Custom Metrics

### Exposing Custom Metrics

```python
# Python application exposing metrics
from prometheus_client import Counter, Gauge, start_http_server

requests_total = Counter('http_requests_total', 'Total HTTP requests')
active_connections = Gauge('active_connections', 'Active connections')

# Increment counter
requests_total.inc()

# Set gauge
active_connections.set(10)

# Start metrics server
start_http_server(8000)
```

!!! tip "Custom Metrics"
    Custom metrics enable application-specific monitoring and HPA scaling.

### ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-metrics
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

## Alerting

### Alert Rules

```yaml
groups:
- name: kubernetes
  rules:
  - alert: HighCPUUsage
    expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for 5 minutes"
```

!!! warning "Alert Fatigue"
    Too many alerts reduce effectiveness. Tune alert thresholds and use alert grouping.

## Troubleshooting

### Monitoring Issues

#### Metrics Not Scraped

```bash
# Check ServiceMonitor
kubectl get servicemonitor

# Check Prometheus targets
# Access Prometheus UI and check /targets

# Check pod annotations
kubectl get pod <pod-name> -o yaml | grep annotations
```

#### High Prometheus Resource Usage

```bash
# Check Prometheus metrics
kubectl top pod -n monitoring prometheus-0

# Review retention settings
kubectl get prometheus -n monitoring -o yaml

# Check scrape interval
kubectl get prometheus -n monitoring -o yaml | grep scrapeInterval
```

## Best Practices

!!! success "Production Recommendations"
    1. Monitor all critical components
    2. Set up comprehensive alerting
    3. Use ServiceMonitors for service discovery
    4. Implement custom metrics for applications
    5. Regular review of alert effectiveness
    6. Document monitoring architecture

---

**Next Chapter**: [Logging & Tracing](16-logging-tracing.md)

