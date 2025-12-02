# Advanced Security Hardening

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Implement pod security policies</li>
    <li>Master network policies and segmentation</li>
    <li>Learn secrets management best practices</li>
    <li>Understand security contexts and capabilities</li>
    <li>Troubleshoot security issues</li>
  </ul>
</div>

Security is non-negotiable in production. Understanding advanced security patterns and hardening techniques protects your cluster and applications.

!!! danger "Security First"
    Security vulnerabilities can lead to data breaches and service compromise. Always prioritize security.

!!! warning "Defense in Depth"
    Use multiple security layers: network policies, RBAC, pod security, secrets management.

## Pod Security Standards

### Pod Security Standards

Kubernetes provides three security levels:

**Privileged:**
- Unrestricted policy
- Allows all pod features

**Baseline:**
- Minimally restrictive
- Prevents known privilege escalations

**Restricted:**
- Highly restrictive
- Follows current hardening best practices

```yaml
# Namespace with restricted policy
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

!!! tip "Security Standards"
    Use Restricted policy for production workloads. Start with Baseline and tighten gradually.

## Network Policies

### Comprehensive Network Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
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
          name: ingress
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
    - protocol: UDP
      port: 53
```

!!! note "Default Deny"
    Network policies are deny-by-default. Explicitly allow required traffic.

## Secrets Management

### Using Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  password: <base64-encoded>
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: app:latest
    env:
    - name: PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: password
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secrets
    secret:
      secretName: app-secret
```

!!! warning "Secret Security"
    - Never commit secrets to git
    - Use external secret management (Vault, Sealed Secrets)
    - Rotate secrets regularly
    - Use encryption at rest

### External Secrets

```yaml
# Using External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-secret
spec:
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-credentials
  data:
  - secretKey: password
    remoteRef:
      key: database/password
```

!!! tip "External Secrets"
    External secret operators enable integration with Vault, AWS Secrets Manager, etc.

## Security Contexts

### Pod Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: app:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

!!! success "Security Best Practices"
    - Run as non-root
    - Drop all capabilities, add only required
    - Use read-only root filesystem
    - Enable seccomp profiles

## Troubleshooting

### Security Issues

#### Pod Not Starting (Security Context)

```bash
# Check pod events
kubectl describe pod <pod-name>

# Check security context
kubectl get pod <pod-name> -o yaml | grep -A 10 securityContext

# Review pod security standards
kubectl get namespace <ns> -o jsonpath='{.metadata.labels}'
```

#### Network Policy Blocking Traffic

```bash
# Check network policies
kubectl get networkpolicies -n <namespace>

# Test connectivity
kubectl run test-pod --image=busybox --rm -it -- wget -O- <service>

# Review policy logs (if available)
kubectl logs -n kube-system <cni-pod>
```

## Best Practices

!!! success "Production Recommendations"
    1. Enforce pod security standards
    2. Implement network policies
    3. Use external secret management
    4. Run containers as non-root
    5. Drop unnecessary capabilities
    6. Enable audit logging
    7. Regular security scans
    8. Keep Kubernetes updated

---

**Next Chapter**: [Compliance & Auditing](14-compliance-auditing.md)

