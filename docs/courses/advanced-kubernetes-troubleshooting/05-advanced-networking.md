# Advanced Networking & CNI

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand CNI architecture and plugins</li>
    <li>Master network policies and security</li>
    <li>Learn advanced networking patterns</li>
    <li>Troubleshoot complex networking issues</li>
    <li>Optimize network performance</li>
  </ul>
</div>

Networking is one of the most complex aspects of Kubernetes. Understanding CNI, network policies, and advanced patterns is essential for expert-level operations.

!!! tip "Network Complexity"
    Most Kubernetes issues are networking-related. Deep understanding of CNI and network policies is crucial.

!!! warning "Network Policies"
    Misconfigured network policies can block legitimate traffic. Always test policies in non-production first.

## CNI Architecture

### CNI Plugins

CNI (Container Network Interface) plugins provide networking for pods.

**Popular CNI Plugins:**
- **Calico**: BGP-based networking, network policies
- **Flannel**: Simple overlay network
- **Weave**: Encrypted overlay network
- **Cilium**: eBPF-based, advanced features
- **Antrea**: Open vSwitch-based

!!! note "CNI Selection"
    Choose CNI based on requirements: performance, features, encryption, network policies.

### CNI Configuration

```json
{
  "cniVersion": "0.3.1",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cni0",
  "ipam": {
    "type": "host-local",
    "subnet": "10.244.0.0/16"
  }
}
```

!!! tip "CNI Troubleshooting"
    Check CNI plugin logs, verify IPAM allocation, test pod-to-pod connectivity.

## Network Policies

### Basic Network Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

!!! warning "Default Deny"
    Network policies are deny-by-default. Explicitly allow required traffic.

### Advanced Network Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

!!! tip "Network Policy Best Practices"
    - Start with deny-all, then allow specific traffic
    - Use labels for policy matching
    - Test policies incrementally
    - Document policy rationale

## Troubleshooting

### Common Networking Issues

#### Pods Cannot Communicate

```bash
# Check pod IP
kubectl get pod <pod-name> -o wide

# Test connectivity
kubectl exec <pod-1> -- ping <pod-2-ip>

# Check network policies
kubectl get networkpolicies --all-namespaces

# Check CNI plugin
kubectl logs -n kube-system <cni-pod>
```

!!! success "Systematic Troubleshooting"
    1. Verify pod IPs are assigned
    2. Check network policies
    3. Verify CNI plugin is working
    4. Test node-to-node connectivity
    5. Check firewall rules

#### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints <service-name>

# Check service selector
kubectl describe service <service-name>

# Test service from pod
kubectl run test-pod --image=busybox --rm -it -- wget -O- <service-name>
```

## Best Practices

!!! success "Production Recommendations"
    1. Use network policies for security
    2. Monitor network performance metrics
    3. Choose CNI based on requirements
    4. Test network policies thoroughly
    5. Document network architecture
    6. Implement network segmentation

---

**Next Chapter**: [Service Mesh Deep Dive](06-service-mesh.md)

