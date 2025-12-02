# Compliance & Auditing

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Implement audit logging</li>
    <li>Understand compliance frameworks</li>
    <li>Learn security scanning and policies</li>
    <li>Master compliance reporting</li>
    <li>Troubleshoot audit and compliance issues</li>
  </ul>
</div>

Compliance and auditing are essential for enterprise deployments. Understanding audit logging, compliance frameworks, and security scanning ensures regulatory compliance.

!!! tip "Compliance Requirements"
    Different industries have different requirements (HIPAA, PCI-DSS, SOC 2). Understand your compliance needs.

!!! warning "Audit Logs"
    Audit logs are critical for security investigations. Ensure proper retention and protection.

## Audit Logging

### Audit Policy

```yaml
# /etc/kubernetes/audit-policy.yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  namespaces: ["kube-system"]
- level: RequestResponse
  verbs: ["create", "update", "patch", "delete"]
  resources:
  - group: ""
    resources: ["secrets", "configmaps"]
- level: Request
  verbs: ["get", "list", "watch"]
  resources:
  - group: ""
    resources: ["pods", "services"]
```

!!! note "Audit Levels"
    - **None**: Don't log
    - **Metadata**: Log metadata only
    - **Request**: Log request and response metadata
    - **RequestResponse**: Log full request and response

### Enabling Audit Logging

```yaml
# API server flags
--audit-log-path=/var/log/kubernetes/audit.log
--audit-policy-file=/etc/kubernetes/audit-policy.yaml
--audit-log-maxage=30
--audit-log-maxbackup=10
--audit-log-maxsize=100
```

!!! tip "Audit Log Management"
    Rotate audit logs regularly. Consider forwarding to centralized logging system.

## Compliance Frameworks

### CIS Kubernetes Benchmark

The CIS Kubernetes Benchmark provides security best practices.

**Key Areas:**
- Control plane components
- etcd configuration
- Worker node configuration
- Policies
- Networking

!!! note "CIS Compliance"
    Use tools like kube-bench to check CIS compliance.

### Security Scanning

```bash
# Scan images for vulnerabilities
trivy image nginx:latest

# Scan cluster configuration
kube-score score deployment.yaml

# Check RBAC permissions
kubectl-who-can create pods
```

!!! warning "Vulnerability Management"
    Regularly scan images and cluster configuration for vulnerabilities. Patch promptly.

## Best Practices

!!! success "Production Recommendations"
    1. Enable comprehensive audit logging
    2. Implement compliance frameworks
    3. Regular security scanning
    4. Document compliance procedures
    5. Review audit logs regularly
    6. Implement automated compliance checks

---

**Next Chapter**: [Advanced Monitoring & Metrics](15-advanced-monitoring.md)

