# Ingress & Load Balancing

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Ingress controllers and configuration</li>
    <li>Understand load balancing strategies</li>
    <li>Learn advanced Ingress patterns</li>
    <li>Troubleshoot Ingress and load balancer issues</li>
    <li>Optimize traffic routing and performance</li>
  </ul>
</div>

Ingress provides external access to services. Understanding Ingress controllers and load balancing is essential for production deployments.

!!! tip "Ingress Controllers"
    Popular controllers: NGINX, Traefik, HAProxy, Istio Gateway. Choose based on features and requirements.

!!! warning "SSL/TLS"
    Always use TLS for production Ingress. Configure certificate management properly.

## Ingress Basics

### Basic Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

### TLS Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - example.com
    secretName: tls-secret
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

!!! note "Certificate Management"
    Use cert-manager for automatic certificate provisioning and renewal.

## Advanced Patterns

### Path-based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

### Load Balancing

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: web
```

!!! tip "Session Affinity"
    Use session affinity for stateful applications. Balance with horizontal scaling needs.

## Troubleshooting

### Common Issues

#### Ingress Not Working

```bash
# Check Ingress status
kubectl get ingress

# Check Ingress controller
kubectl get pods -n ingress-nginx

# Check Ingress controller logs
kubectl logs -n ingress-nginx <controller-pod>

# Test connectivity
curl -H "Host: example.com" http://<ingress-ip>
```

!!! success "Troubleshooting Steps"
    1. Verify Ingress resource exists
    2. Check Ingress controller is running
    3. Verify service endpoints
    4. Check DNS resolution
    5. Test with curl/wget

## Best Practices

!!! success "Production Recommendations"
    1. Use TLS for all Ingress
    2. Implement rate limiting
    3. Monitor Ingress metrics
    4. Use appropriate path types
    5. Configure health checks
    6. Document routing rules

---

**Next Chapter**: [Advanced Storage Patterns](08-advanced-storage.md)

