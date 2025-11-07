# Monitoring & Logging

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master monitoring concepts and metrics</li>
    <li>Understand logging best practices</li>
    <li>Learn distributed tracing</li>
    <li>Know observability tools and platforms</li>
    <li>Design effective alerting strategies</li>
  </ul>
</div>

Monitoring and logging are essential for production systems. This comprehensive chapter covers observability, metrics, logs, traces, and best practices.

!!! tip "Interview Focus"
    Understand the three pillars of observability, know when to use which tool, and design effective monitoring strategies.

## Observability Fundamentals

### The Three Pillars of Observability

**1. Metrics:**
- Numerical measurements over time
- Aggregated data
- Low overhead
- Use for: Trends, alerts, dashboards

**2. Logs:**
- Discrete events with timestamps
- Detailed information
- Higher overhead
- Use for: Debugging, audit trails

**3. Traces:**
- Request flow through system
- Distributed system visibility
- Moderate overhead
- Use for: Performance analysis, debugging

!!! note "Observability vs Monitoring"
    - **Monitoring**: Known unknowns (what you expect to monitor)
    - **Observability**: Unknown unknowns (ability to understand system behavior)

## Metrics

### Types of Metrics

**Counter:**
- Always increasing
- Example: Total requests, errors
- Use: Track cumulative values

**Gauge:**
- Can go up or down
- Example: CPU usage, memory, active connections
- Use: Current state values

**Histogram:**
- Distribution of values
- Example: Request latency distribution
- Use: Understand value distribution

**Summary:**
- Similar to histogram with quantiles
- Pre-calculated percentiles
- Use: Latency percentiles (p50, p95, p99)

### Key Metrics to Monitor

**Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network bandwidth
- Disk space

**Application Metrics:**
- Request rate (RPS)
- Error rate
- Latency (p50, p95, p99, p99.9)
- Throughput
- Queue depth

**Business Metrics:**
- User signups
- Revenue
- Conversion rate
- Active users

### Prometheus

**Prometheus Architecture:**
- Pull-based metrics collection
- Time-series database
- PromQL query language
- Service discovery

**Prometheus Configuration:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'web-app'
    static_configs:
      - targets: ['web:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

**PromQL Examples:**
```promql
# CPU usage
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## Logging

### Log Levels

**DEBUG:**
- Detailed information for debugging
- Usually disabled in production
- Example: Variable values, function entry/exit

**INFO:**
- General informational messages
- Normal application flow
- Example: User login, request processed

**WARN:**
- Warning messages
- Something unexpected but handled
- Example: Retry attempt, deprecated API usage

**ERROR:**
- Error messages
- Something failed but application continues
- Example: Database connection failed, retrying

**FATAL/CRITICAL:**
- Critical errors
- Application may terminate
- Example: Cannot connect to database, out of memory

### Structured Logging

**Benefits:**
- Machine-readable
- Easy to query
- Better parsing
- Consistent format

**Example:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "user-service",
  "trace_id": "abc123",
  "user_id": "user-456",
  "message": "Failed to process payment",
  "error": "Insufficient funds",
  "amount": 100.50,
  "currency": "USD"
}
```

### Log Aggregation

**ELK Stack (Elasticsearch, Logstash, Kibana):**

**Logstash Configuration:**
```ruby
input {
  file {
    path => "/var/log/app.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
  }
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

**Fluentd:**
```xml
<source>
  @type tail
  path /var/log/app.log
  pos_file /var/log/fluentd-app.log.pos
  tag app.log
  format json
</source>

<match app.log>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name app-logs
  type_name _doc
</match>
```

## Distributed Tracing

### OpenTelemetry

**Instrumentation:**
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

def process_order(order_id):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        # Process order
        span.add_event("Order processed successfully")
```

**Jaeger:**
- Distributed tracing system
- OpenTracing compatible
- UI for visualization
- Supports multiple backends

## Alerting Strategies

### Alert Design Principles

**Alert Fatigue Prevention:**
- Only alert on actionable items
- Use appropriate severity levels
- Group related alerts
- Implement alert suppression

**Alert Severity Levels:**
- **Critical**: Immediate action required, system down
- **Warning**: Attention needed, may become critical
- **Info**: Informational, no action needed

**Alert Rules:**
```yaml
# Prometheus Alert Rules
groups:
- name: application
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors/sec"
  
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
```

### On-Call Best Practices

**Runbooks:**
- Document common issues
- Step-by-step resolution
- Escalation procedures
- Contact information

**Alert Routing:**
- Route to appropriate team
- Escalate if not acknowledged
- Use PagerDuty, Opsgenie, etc.

## Comprehensive Interview Questions

### Q1: Design a monitoring strategy for a microservices application

**Answer:**

**Metrics:**
- Service-level: Request rate, error rate, latency per service
- Infrastructure: CPU, memory, disk per service
- Business: User actions, conversions

**Logging:**
- Structured logs with trace IDs
- Centralized log aggregation (ELK)
- Log retention policies

**Tracing:**
- Distributed tracing (Jaeger/Zipkin)
- Trace all requests across services
- Identify bottlenecks

**Alerting:**
- Service-level alerts (error rate, latency)
- Infrastructure alerts (resource exhaustion)
- Business alerts (unusual patterns)

### Q2: Explain the difference between metrics and logs

**Answer:**

**Metrics:**
- Aggregated numerical data
- Low overhead
- Time-series data
- Use for: Trends, dashboards, alerts

**Logs:**
- Individual events with details
- Higher overhead
- Text or structured data
- Use for: Debugging, audit trails

**When to use:**
- **Metrics**: Monitoring, alerting, capacity planning
- **Logs**: Debugging, compliance, detailed analysis

### Q3: How do you reduce log volume while maintaining observability?

**Answer:**

1. **Structured Logging**: Easier to filter and query
2. **Log Levels**: Use appropriate levels, disable DEBUG in production
3. **Sampling**: Sample high-volume logs
4. **Retention Policies**: Delete old logs
5. **Aggregation**: Aggregate similar logs
6. **Filtering**: Don't log unnecessary information

## Recommended Resources

### Books
- **"Observability Engineering" by Charity Majors** - Comprehensive observability guide
- **"Site Reliability Engineering" by Google** - SRE practices

### Articles
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)

---

**Previous**: [Cloud Architecture](12-cloud-architecture) | **Next**: [System Design](14-system-design)
