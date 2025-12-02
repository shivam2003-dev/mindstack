# Advanced Storage Patterns

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand storage classes and CSI drivers</li>
    <li>Master volume provisioning and management</li>
    <li>Learn advanced storage patterns</li>
    <li>Troubleshoot storage issues effectively</li>
    <li>Optimize storage performance</li>
  </ul>
</div>

Storage is critical for stateful workloads. Understanding storage classes, CSI drivers, and advanced patterns is essential for production deployments.

!!! tip "Storage Classes"
    Storage classes define storage characteristics. Use different classes for different workload requirements.

!!! warning "Data Persistence"
    Understand volume lifecycle. Data loss can occur if volumes are not properly configured.

## Storage Classes

### Dynamic Provisioning

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

!!! note "Volume Binding"
    `WaitForFirstConsumer` delays binding until pod is scheduled, enabling topology-aware provisioning.

### Volume Claims

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 100Gi
```

## CSI Drivers

### CSI Architecture

CSI (Container Storage Interface) enables external storage providers.

**CSI Components:**
- **CSI Driver**: Storage provider implementation
- **External Provisioner**: Handles volume provisioning
- **External Attacher**: Handles volume attachment
- **Node Plugin**: Manages volume operations on nodes

!!! tip "CSI Benefits"
    CSI enables storage vendors to develop drivers without modifying Kubernetes core.

## Troubleshooting

### Common Issues

#### Volume Not Mounting

```bash
# Check PVC status
kubectl get pvc

# Check PV status
kubectl get pv

# Check pod events
kubectl describe pod <pod-name>

# Check CSI driver
kubectl get pods -n kube-system | grep csi
```

!!! success "Troubleshooting Steps"
    1. Verify PVC is bound
    2. Check storage class exists
    3. Verify CSI driver is running
    4. Check node capabilities
    5. Review CSI driver logs

#### Volume Performance Issues

```bash
# Check volume metrics
kubectl top pod <pod-name>

# Test I/O performance
kubectl exec <pod-name> -- dd if=/dev/zero of=/data/test bs=1M count=1000

# Check storage class parameters
kubectl get storageclass <sc-name> -o yaml
```

## Best Practices

!!! success "Production Recommendations"
    1. Use appropriate storage classes for workloads
    2. Enable volume expansion where supported
    3. Implement backup strategies
    4. Monitor storage usage
    5. Test disaster recovery procedures
    6. Document storage architecture

---

**Next Chapter**: [StatefulSets & Operators](09-statefulsets-operators.md)

