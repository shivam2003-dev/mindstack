# StatefulSets & Operators

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master StatefulSet patterns and operations</li>
    <li>Understand operator pattern and development</li>
    <li>Learn advanced stateful workload management</li>
    <li>Troubleshoot StatefulSet and operator issues</li>
    <li>Build custom operators</li>
  </ul>
</div>

StatefulSets and operators enable complex stateful workloads. Understanding these patterns is essential for databases, message queues, and other stateful applications.

!!! tip "Stateful Workloads"
    StatefulSets provide: stable network identity, ordered deployment, persistent storage. Essential for databases and distributed systems.

!!! warning "Stateful Complexity"
    Stateful workloads require careful management. Plan for backup, restore, and disaster recovery.

## StatefulSets

### Basic StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "web"
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
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 1Gi
```

!!! note "Stable Identity"
    StatefulSet pods have stable network identities: `<statefulset-name>-<ordinal>`. Ordinal starts at 0.

### Ordered Operations

StatefulSets perform operations in order:
- **Scaling Up**: Pods created sequentially (0, 1, 2, ...)
- **Scaling Down**: Pods deleted in reverse order (..., 2, 1, 0)
- **Updates**: Pods updated in reverse order

!!! tip "Ordered Scaling"
    Ordered operations ensure data consistency for distributed systems.

## Operators

### Operator Pattern

Operators extend Kubernetes to manage complex applications.

**Operator Components:**
- **Custom Resource Definition (CRD)**: Defines custom resources
- **Controller**: Reconciles desired state
- **Operator Logic**: Application-specific management

### Example Operator

```yaml
# Custom Resource
apiVersion: apps.example.com/v1
kind: Database
metadata:
  name: my-database
spec:
  replicas: 3
  version: "13.0"
  storage: 100Gi
```

!!! note "Operator Benefits"
    Operators automate complex operations: backups, upgrades, scaling, disaster recovery.

## Troubleshooting

### StatefulSet Issues

#### Pods Not Starting

```bash
# Check StatefulSet status
kubectl get statefulset

# Check pod status
kubectl get pods -l app=nginx

# Check events
kubectl describe statefulset <name>

# Check PVCs
kubectl get pvc
```

!!! success "Troubleshooting Steps"
    1. Verify StatefulSet configuration
    2. Check PVC binding
    3. Review pod events
    4. Check init containers
    5. Verify service exists

#### Scaling Issues

```bash
# Check current replicas
kubectl get statefulset <name> -o jsonpath='{.status.replicas}'

# Check ready replicas
kubectl get statefulset <name> -o jsonpath='{.status.readyReplicas}'

# Force delete stuck pod (use with caution)
kubectl delete pod <pod-name> --force --grace-period=0
```

!!! warning "Force Delete"
    Force delete can cause data inconsistency. Only use when necessary and understand implications.

### Operator Issues

#### Operator Not Reconciling

```bash
# Check operator pod
kubectl get pods -n <operator-namespace>

# Check operator logs
kubectl logs -n <operator-namespace> <operator-pod>

# Check CRD
kubectl get crd

# Check custom resources
kubectl get <custom-resource>
```

## Best Practices

!!! success "Production Recommendations"
    1. Use StatefulSets for stateful workloads
    2. Implement proper backup strategies
    3. Test scaling operations
    4. Monitor operator health
    5. Document operator behavior
    6. Plan for disaster recovery

---

**Next Chapter**: [Resource Management & Limits](10-resource-management.md)

