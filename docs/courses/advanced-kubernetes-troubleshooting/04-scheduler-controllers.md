# Scheduler & Controller Manager

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand scheduler internals and algorithms</li>
    <li>Master custom scheduler implementation</li>
    <li>Learn controller reconciliation patterns</li>
    <li>Build custom controllers and operators</li>
    <li>Troubleshoot scheduling and controller issues</li>
  </ul>
</div>

The scheduler and controller manager are critical for maintaining desired cluster state. Understanding their internals enables advanced troubleshooting and customization.

!!! tip "State Reconciliation"
    Controllers continuously reconcile desired state with actual state. Understanding this pattern is key to troubleshooting.

!!! warning "Controller Conflicts"
    Multiple controllers managing the same resource can cause conflicts. Always understand controller ownership.

## Scheduler Architecture

### Scheduling Algorithm

The scheduler uses a two-phase algorithm:

**Phase 1: Filtering (Predicates)**
- Filters out nodes that cannot host the pod
- Checks resource availability, node selectors, taints/tolerations

**Phase 2: Scoring (Priorities)**
- Ranks remaining nodes
- Considers resource balance, affinity, anti-affinity

```yaml
# Scheduler policy example
apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- schedulerName: default-scheduler
  plugins:
    filter:
      enabled:
      - name: NodeResourcesFit
      - name: NodeAffinity
    score:
      enabled:
      - name: NodeResourcesLeastAllocated
        weight: 1
      - name: NodeAffinity
        weight: 1
```

!!! note "Scheduler Extensibility"
    Kubernetes scheduler is highly extensible. You can implement custom schedulers or extend the default.

### Custom Scheduler

```yaml
# Pod with custom scheduler
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  schedulerName: my-custom-scheduler
  containers:
  - name: app
    image: my-app:latest
```

!!! tip "Custom Schedulers"
    Custom schedulers enable specialized scheduling logic for specific workloads (e.g., GPU scheduling, batch jobs).

## Controller Manager

### Controller Pattern

Controllers follow a reconciliation loop:

```go
// Pseudo-code for controller pattern
for {
    desiredState := getDesiredState()
    actualState := getActualState()
    
    if desiredState != actualState {
        reconcile(desiredState, actualState)
    }
    
    sleep(reconciliationInterval)
}
```

!!! note "Reconciliation Loop"
    Controllers continuously watch for changes and reconcile state. This ensures eventual consistency.

### Core Controllers

**Deployment Controller:**
- Manages ReplicaSets
- Handles rolling updates
- Maintains deployment history

**ReplicaSet Controller:**
- Maintains desired pod replicas
- Creates/deletes pods as needed
- Handles pod failures

**StatefulSet Controller:**
- Manages stateful workloads
- Maintains pod identity
- Handles ordered scaling

!!! warning "Controller Dependencies"
    Controllers have dependencies (Deployment → ReplicaSet → Pod). Understanding these helps troubleshoot issues.

## Troubleshooting

### Scheduler Issues

#### Pods Stuck in Pending

```bash
# Check pod events
kubectl describe pod <pod-name>

# Check node resources
kubectl describe node <node-name>

# Check taints
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints

# Check scheduler logs
kubectl logs -n kube-system kube-scheduler-<node> --tail=100
```

!!! tip "Pending Pods"
    Common causes: insufficient resources, node selectors, taints without tolerations, affinity rules.

### Controller Issues

#### Controllers Not Reconciling

```bash
# Check controller manager logs
kubectl logs -n kube-system kube-controller-manager-<node>

# Check leader election
kubectl get endpoints -n kube-system kube-controller-manager

# Check controller status
kubectl get deployments,replicasets,pods
```

!!! warning "Leader Election"
    Only the leader performs reconciliation. If leader election fails, controllers won't work.

## Best Practices

!!! success "Production Recommendations"
    1. Monitor scheduler metrics (scheduling latency, pending pods)
    2. Set appropriate resource requests and limits
    3. Use node affinity for workload placement
    4. Implement custom schedulers for specialized needs
    5. Monitor controller reconciliation loops
    6. Test controller behavior under failure scenarios

---

**Next Chapter**: [Advanced Networking & CNI](05-advanced-networking.md)

