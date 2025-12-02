# Service Mesh Deep Dive

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand service mesh architecture</li>
    <li>Master Istio and Linkerd operations</li>
    <li>Learn traffic management and security</li>
    <li>Troubleshoot service mesh issues</li>
    <li>Implement advanced mesh patterns</li>
  </ul>
</div>

Service meshes provide advanced traffic management, security, and observability. Understanding service mesh internals is essential for complex microservices deployments.

!!! tip "Service Mesh Benefits"
    Service meshes provide: mTLS, traffic management, observability, and security policies without code changes.

!!! warning "Complexity Trade-off"
    Service meshes add complexity. Ensure benefits outweigh operational overhead.

## Service Mesh Architecture

### Components

**Data Plane:**
- Sidecar proxies (Envoy, Linkerd-proxy)
- Intercept and manage traffic

**Control Plane:**
- Configuration and policy management
- Service discovery
- Certificate management

!!! note "Sidecar Pattern"
    Service meshes use sidecar containers to inject functionality without modifying applications.

## Istio

### Installation

```bash
# Install Istio
istioctl install --set profile=default

# Enable sidecar injection
kubectl label namespace default istio-injection=enabled
```

### Traffic Management

```yaml
# VirtualService
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 50
    - destination:
        host: reviews
        subset: v3
      weight: 50
```

!!! tip "Traffic Splitting"
    Use VirtualService for canary deployments, A/B testing, and traffic shifting.

### Security

```yaml
# PeerAuthentication
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
```

!!! warning "mTLS Impact"
    STRICT mTLS requires all services to have sidecars. Plan migration carefully.

## Troubleshooting

### Common Issues

#### Sidecar Not Injected

```bash
# Check injection label
kubectl get namespace default -o jsonpath='{.metadata.labels}'

# Check sidecar
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'

# Manual injection
kubectl apply -f <(istioctl kube-inject -f deployment.yaml)
```

#### Traffic Not Routing Correctly

```bash
# Check VirtualService
kubectl get virtualservice

# Check DestinationRule
kubectl get destinationrule

# Check Envoy config
istioctl proxy-config route <pod-name>
```

## Best Practices

!!! success "Production Recommendations"
    1. Start with permissive mTLS, then move to STRICT
    2. Monitor service mesh metrics
    3. Use gradual rollout for mesh adoption
    4. Document traffic policies
    5. Test failure scenarios
    6. Monitor sidecar resource usage

---

**Next Chapter**: [Ingress & Load Balancing](07-ingress-loadbalancing.md)

