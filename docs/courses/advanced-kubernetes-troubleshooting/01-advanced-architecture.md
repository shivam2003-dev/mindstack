# Advanced Architecture Deep Dive

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Kubernetes control plane internals</li>
    <li>Master etcd architecture and operations</li>
    <li>Deep dive into API server mechanisms</li>
    <li>Understand scheduler and controller manager internals</li>
    <li>Troubleshoot control plane issues</li>
  </ul>
</div>

This chapter provides an expert-level understanding of Kubernetes architecture, focusing on control plane components and their interactions. Deep knowledge of these internals is essential for troubleshooting complex issues.

!!! tip "Expert Insight"
    Understanding the control plane architecture helps you diagnose issues faster. When troubleshooting, always consider which component might be involved and how they interact.

!!! warning "Production Impact"
    Control plane issues affect the entire cluster. Always have monitoring and alerting in place for control plane components.

## Control Plane Architecture

### Component Overview

The Kubernetes control plane consists of several critical components:

**Core Components:**
- **kube-apiserver**: Central API endpoint
- **etcd**: Distributed key-value store
- **kube-scheduler**: Pod scheduling decisions
- **kube-controller-manager**: Runs controllers
- **cloud-controller-manager**: Cloud-specific logic

!!! note "High Availability"
    In production, all control plane components should be run in HA mode with multiple replicas behind a load balancer.

### API Server Deep Dive

The API server is the front-end to the Kubernetes control plane and the only component that directly communicates with etcd.

#### API Server Responsibilities

```yaml
# API Server handles:
- Authentication: Verify user identity
- Authorization: Check permissions (RBAC, ABAC)
- Admission Control: Validate and mutate requests
- API Versioning: Handle multiple API versions
- Rate Limiting: Prevent API abuse
```

!!! tip "Troubleshooting API Server"
    Common issues:
    - High latency: Check etcd performance, network latency
    - Authentication failures: Verify certificates, tokens
    - Rate limiting: Check request patterns, increase limits if needed
    - Memory issues: Monitor heap usage, adjust flags

#### API Server Flags

```bash
# Critical API server flags for troubleshooting
--etcd-servers=https://127.0.0.1:2379
--etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
--etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
--etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
--request-timeout=60s
--max-requests-inflight=400
--max-mutating-requests-inflight=200
```

!!! warning "Flag Modifications"
    Changing API server flags requires restarting the component. Test changes in non-production first.

### etcd Architecture

etcd is the single source of truth for Kubernetes cluster state.

#### etcd Data Model

```
/registry/pods/<namespace>/<pod-name>
/registry/services/<namespace>/<service-name>
/registry/nodes/<node-name>
/registry/namespaces/<namespace-name>
```

!!! note "Data Organization"
    etcd organizes data hierarchically. Understanding this structure helps with debugging and backup strategies.

#### etcd Performance Tuning

```bash
# etcd performance flags
--quota-backend-bytes=8589934592  # 8GB default
--max-request-bytes=1572864       # 1.5MB default
--heartbeat-interval=100          # milliseconds
--election-timeout=1000           # milliseconds
```

!!! tip "Performance Optimization"
    - Monitor etcd disk I/O latency
    - Use SSD storage for etcd data directory
    - Keep etcd data directory on separate disk
    - Regular compaction to prevent database growth

#### etcd Troubleshooting

```bash
# Check etcd health
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health

# Check etcd status
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status

# List all keys (use with caution)
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  get / --prefix --keys-only
```

!!! warning "etcd Operations"
    Direct etcd operations can corrupt cluster state. Only perform read operations unless you know what you're doing.

### Scheduler Architecture

The scheduler assigns pods to nodes based on resource requirements and constraints.

#### Scheduler Algorithm

```
1. Filtering Phase: Find nodes that can host the pod
2. Scoring Phase: Rank nodes by preference
3. Binding Phase: Assign pod to selected node
```

!!! note "Scheduler Extensibility"
    Kubernetes scheduler is pluggable. You can implement custom schedulers or extend the default scheduler.

#### Scheduler Policies

```yaml
# Custom scheduler policy example
apiVersion: v1
kind: ConfigMap
metadata:
  name: scheduler-policy
data:
  policy.cfg: |
    {
      "kind": "Policy",
      "apiVersion": "v1",
      "predicates": [
        {"name": "PodFitsHostPorts"},
        {"name": "PodFitsResources"}
      ],
      "priorities": [
        {"name": "LeastRequestedPriority", "weight": 1},
        {"name": "BalancedResourceAllocation", "weight": 1}
      ]
    }
```

!!! tip "Scheduler Troubleshooting"
    Common issues:
    - Pods stuck in Pending: Check node resources, taints/tolerations
    - Uneven pod distribution: Review scheduler policies
    - Slow scheduling: Check scheduler performance metrics

### Controller Manager

The controller manager runs controllers that maintain desired cluster state.

#### Core Controllers

```yaml
Controllers:
- Deployment Controller: Manages ReplicaSets
- ReplicaSet Controller: Maintains pod replicas
- StatefulSet Controller: Manages stateful workloads
- DaemonSet Controller: Ensures pods on all nodes
- Job Controller: Manages batch jobs
- Namespace Controller: Manages namespaces
- Node Controller: Monitors node health
- Service Controller: Manages services and endpoints
- Endpoint Controller: Maintains endpoint objects
```

!!! note "Controller Reconciliation"
    Controllers continuously reconcile desired state with actual state. Understanding this loop is key to troubleshooting.

#### Controller Troubleshooting

```bash
# Check controller manager logs
kubectl logs -n kube-system kube-controller-manager-<node-name>

# Common issues:
# - Controllers not reconciling: Check leader election
# - Resource conflicts: Check for conflicting controllers
# - Performance issues: Monitor controller latency metrics
```

!!! warning "Controller Conflicts"
    Multiple controllers managing the same resource can cause conflicts. Always understand which controller owns which resource.

## Control Plane Communication

### Component Interactions

```
Client Request
    ↓
API Server (Authentication/Authorization)
    ↓
etcd (Read/Write)
    ↓
API Server (Response)
    ↓
Controller Manager / Scheduler (Watch for changes)
    ↓
API Server (Update resources)
```

!!! tip "Understanding Flow"
    Understanding request flow helps identify bottlenecks. Use distributed tracing to visualize component interactions.

### Leader Election

Control plane components use leader election to ensure only one instance is active.

```go
// Leader election mechanism
// Components compete for lease in etcd
// Winner becomes leader, others become followers
// If leader fails, new leader is elected
```

!!! note "High Availability"
    Leader election enables HA deployments. Multiple replicas can run, but only the leader performs operations.

## Troubleshooting Control Plane Issues

### Diagnostic Checklist

```bash
# 1. Check API server health
curl -k https://localhost:6443/healthz

# 2. Check etcd health
ETCDCTL_API=3 etcdctl endpoint health

# 3. Check scheduler
kubectl get events --field-selector involvedObject.name=kube-scheduler

# 4. Check controller manager
kubectl get events --field-selector involvedObject.name=kube-controller-manager

# 5. Check component logs
kubectl logs -n kube-system <component-pod>

# 6. Check resource usage
kubectl top nodes
kubectl top pods -n kube-system
```

!!! success "Systematic Approach"
    Always follow a systematic troubleshooting approach: check health endpoints, review logs, examine metrics, and verify configuration.

### Common Issues and Solutions

#### Issue: API Server High Latency

**Symptoms:**
- Slow kubectl responses
- Timeout errors
- High API server CPU usage

**Diagnosis:**
```bash
# Check API server metrics
kubectl get --raw /metrics | grep apiserver_request_latencies

# Check etcd performance
ETCDCTL_API=3 etcdctl endpoint status

# Check network latency
ping <etcd-endpoint>
```

**Solutions:**
- Optimize etcd performance (SSD, separate disk)
- Increase API server resources
- Review and optimize admission controllers
- Check for resource contention

!!! warning "Performance Impact"
    API server latency affects all cluster operations. Monitor this metric closely.

#### Issue: etcd Database Growth

**Symptoms:**
- etcd quota exceeded errors
- Slow etcd operations
- High disk usage

**Diagnosis:**
```bash
# Check etcd database size
ETCDCTL_API=3 etcdctl endpoint status | grep dbSize

# Check revision history
ETCDCTL_API=3 etcdctl endpoint status | grep revision
```

**Solutions:**
```bash
# Compact etcd history
ETCDCTL_API=3 etcdctl compact <revision>

# Defragment etcd
ETCDCTL_API=3 etcdctl defrag

# Increase quota (requires restart)
--quota-backend-bytes=17179869184  # 16GB
```

!!! danger "etcd Maintenance"
    etcd compaction and defragmentation can impact cluster performance. Perform during maintenance windows.

#### Issue: Scheduler Not Assigning Pods

**Symptoms:**
- Pods stuck in Pending state
- No scheduling events
- Scheduler errors in logs

**Diagnosis:**
```bash
# Check scheduler logs
kubectl logs -n kube-system kube-scheduler-<node> --tail=100

# Check pod events
kubectl describe pod <pod-name>

# Check node resources
kubectl describe node <node-name>
```

**Solutions:**
- Verify node resources and capacity
- Check taints and tolerations
- Review pod resource requests
- Verify node selectors and affinity rules
- Check for scheduler policy conflicts

## Best Practices

!!! success "Production Recommendations"
    1. **Monitor Control Plane**: Set up comprehensive monitoring for all components
    2. **Resource Limits**: Set appropriate resource limits for control plane pods
    3. **High Availability**: Run control plane in HA mode with multiple replicas
    4. **Backup etcd**: Regular etcd backups are critical
    5. **Security**: Use TLS for all component communication
    6. **Logging**: Enable structured logging for all components
    7. **Performance Tuning**: Regularly review and optimize component flags

## Key Takeaways

- ✅ API server is the central component and only etcd client
- ✅ etcd is the single source of truth for cluster state
- ✅ Scheduler uses filtering and scoring to assign pods
- ✅ Controllers reconcile desired state with actual state
- ✅ Understanding component interactions is key to troubleshooting
- ✅ Monitor control plane components proactively
- ✅ Regular etcd maintenance is essential

---

**Next Chapter**: [API Server & Authentication](02-api-server-auth.md)

