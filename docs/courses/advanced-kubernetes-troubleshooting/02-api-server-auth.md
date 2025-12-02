# API Server & Authentication

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master API server authentication mechanisms</li>
    <li>Understand RBAC and authorization</li>
    <li>Learn admission control and webhooks</li>
    <li>Troubleshoot authentication and authorization issues</li>
    <li>Implement advanced security patterns</li>
  </ul>
</div>

The API server is the gateway to your Kubernetes cluster. Understanding its authentication, authorization, and admission control mechanisms is critical for security and troubleshooting.

!!! tip "Security First"
    Authentication and authorization are the first line of defense. Always follow the principle of least privilege.

!!! warning "Misconfiguration Impact"
    Incorrect authentication or authorization settings can lock you out of the cluster or create security vulnerabilities.

## Authentication Mechanisms

Kubernetes supports multiple authentication methods, evaluated in order:

### Service Account Tokens

Service accounts provide identity for pods running in the cluster.

```yaml
# Service account example
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: default
---
# Pod using service account
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: my-app-sa
  containers:
  - name: app
    image: my-app:latest
```

!!! note "Default Service Account"
    Every namespace has a default service account. Pods without explicit serviceAccountName use the default.

#### Service Account Token Mounting

```bash
# Tokens are automatically mounted at:
/var/run/secrets/kubernetes.io/serviceaccount/token
/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
/var/run/secrets/kubernetes.io/serviceaccount/namespace
```

!!! tip "Token Usage"
    Service account tokens can be used to authenticate API requests from within pods.

### X.509 Client Certificates

Certificates provide strong authentication for users and services.

```bash
# Generate client certificate
openssl genrsa -out user.key 2048
openssl req -new -key user.key -out user.csr -subj "/CN=user/O=group"
openssl x509 -req -in user.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out user.crt -days 365

# Use certificate with kubectl
kubectl --client-certificate=user.crt --client-key=user.key --certificate-authority=ca.crt get pods
```

!!! warning "Certificate Management"
    Certificates expire and need rotation. Implement automated certificate rotation for production.

### Static Token File

```yaml
# /etc/kubernetes/tokens.csv
token123,user1,uid1,"group1,group2"
token456,user2,uid2,"group3"
```

```bash
# API server flag
--token-auth-file=/etc/kubernetes/tokens.csv
```

!!! danger "Static Tokens"
    Static token files are not recommended for production. Use service accounts or OIDC instead.

### Bootstrap Tokens

Bootstrap tokens are used for node joining and initial cluster setup.

```bash
# Generate bootstrap token
kubeadm token create --ttl 0

# List tokens
kubeadm token list
```

!!! note "Token Expiration"
    Bootstrap tokens should have limited TTL and be rotated regularly.

### OpenID Connect (OIDC)

OIDC enables integration with external identity providers.

```yaml
# API server flags for OIDC
--oidc-issuer-url=https://accounts.google.com
--oidc-client-id=kubernetes
--oidc-username-claim=email
--oidc-groups-claim=groups
```

!!! tip "OIDC Integration"
    OIDC is recommended for production environments with external identity providers like Google, Azure AD, or Okta.

## Authorization

Once authenticated, requests must be authorized. Kubernetes supports multiple authorization modes.

### RBAC (Role-Based Access Control)

RBAC is the recommended authorization mode for most clusters.

#### Roles and RoleBindings

```yaml
# Role (namespace-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

#### ClusterRoles and ClusterRoleBindings

```yaml
# ClusterRole (cluster-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-admin
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
---
# ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-binding
subjects:
- kind: User
  name: admin
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

!!! tip "RBAC Best Practices"
    - Use RoleBindings for namespace-scoped access
    - Use ClusterRoleBindings sparingly
    - Follow principle of least privilege
    - Regularly audit permissions

#### Aggregated ClusterRoles

```yaml
# Aggregate permissions from multiple ClusterRoles
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring
aggregationRule:
  clusterRoleSelectors:
  - matchLabels:
      rbac.example.com/aggregate-to-monitoring: "true"
```

!!! note "Aggregation"
    Aggregated ClusterRoles allow combining permissions from multiple sources, useful for addon management.

### ABAC (Attribute-Based Access Control)

ABAC uses policies based on user attributes.

```json
// /etc/kubernetes/abac-policy.json
{
  "apiVersion": "abac.authorization.kubernetes.io/v1beta1",
  "kind": "Policy",
  "spec": {
    "user": "alice",
    "namespace": "production",
    "resource": "pods",
    "readonly": true
  }
}
```

!!! warning "ABAC Limitations"
    ABAC requires API server restart for policy changes. RBAC is preferred for most use cases.

### Node Authorization

Node authorization grants permissions to kubelet based on node identity.

```yaml
# Node authorizer automatically grants:
# - Read access to services, endpoints, nodes
# - Write access to pods, events
# - Write access to node status
```

!!! note "Node Identity"
    Nodes are identified by their certificate CN (Common Name) matching the node name.

### Webhook Authorization

External webhooks can make authorization decisions.

```yaml
# API server configuration
--authorization-webhook-config-file=/etc/kubernetes/webhook-config.yaml
```

```yaml
# webhook-config.yaml
apiVersion: v1
kind: Config
clusters:
- name: authorization-webhook
  cluster:
    server: https://authz.example.com/authorize
    certificate-authority: /etc/kubernetes/webhook-ca.crt
users:
- name: api-server
  user:
    client-certificate: /etc/kubernetes/webhook-client.crt
    client-key: /etc/kubernetes/webhook-client.key
```

!!! tip "Webhook Use Cases"
    Webhooks enable integration with external authorization systems like OPA (Open Policy Agent).

## Admission Control

Admission controllers intercept requests before object persistence.

### Mutating Admission Controllers

Mutating controllers can modify objects before they're stored.

**Built-in Mutating Controllers:**
- `NamespaceLifecycle`: Enforces namespace lifecycle
- `DefaultStorageClass`: Adds default storage class
- `DefaultTolerationSeconds`: Adds default tolerations
- `MutatingAdmissionWebhook`: Calls external mutating webhooks

### Validating Admission Controllers

Validating controllers can only validate, not modify.

**Built-in Validating Controllers:**
- `ResourceQuota`: Enforces resource quotas
- `LimitRanger`: Enforces limit ranges
- `PodSecurityPolicy`: Enforces pod security policies (deprecated)
- `ValidatingAdmissionWebhook`: Calls external validating webhooks

!!! warning "Admission Controller Order"
    Mutating controllers run before validating controllers. Order matters for some controllers.

### Admission Webhooks

External webhooks can implement custom admission logic.

#### Mutating Webhook Example

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: example-mutating-webhook
webhooks:
- name: example.mutating.io
  clientConfig:
    url: https://webhook.example.com/mutate
    caBundle: <base64-encoded-ca>
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1", "v1beta1"]
  sideEffects: None
  failurePolicy: Fail
```

#### Validating Webhook Example

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: example-validating-webhook
webhooks:
- name: example.validating.io
  clientConfig:
    url: https://webhook.example.com/validate
    caBundle: <base64-encoded-ca>
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1", "v1beta1"]
  sideEffects: None
  failurePolicy: Fail
```

!!! tip "Webhook Best Practices"
    - Use `failurePolicy: Ignore` during development
    - Implement idempotent mutating webhooks
    - Set appropriate timeouts
    - Handle webhook failures gracefully
    - Monitor webhook latency

## Troubleshooting Authentication & Authorization

### Diagnostic Commands

```bash
# Check current user context
kubectl config current-context
kubectl config view

# Test permissions
kubectl auth can-i create pods
kubectl auth can-i create pods --namespace=production
kubectl auth can-i '*' '*'

# Check user permissions
kubectl get rolebindings,clusterrolebindings --all-namespaces

# Check service account permissions
kubectl describe serviceaccount <sa-name> -n <namespace>
```

!!! success "Systematic Troubleshooting"
    1. Verify authentication: Check if user can authenticate
    2. Check authorization: Use `kubectl auth can-i` to test permissions
    3. Review RBAC: Check Roles, RoleBindings, ClusterRoles, ClusterRoleBindings
    4. Check admission: Review admission controller logs
    5. Test with different users: Isolate the issue

### Common Issues

#### Issue: "Forbidden" Errors

**Symptoms:**
- `Error from server (Forbidden): ...`
- User cannot perform operations

**Diagnosis:**
```bash
# Check if user can perform action
kubectl auth can-i <verb> <resource> --namespace=<ns>

# Check role bindings
kubectl get rolebindings,clusterrolebindings -o wide

# Check user's groups
kubectl config view -o jsonpath='{.users[*].name}'
```

**Solutions:**
- Verify RoleBinding/ClusterRoleBinding exists
- Check if Role/ClusterRole has required permissions
- Verify user/group matches binding subject
- Check namespace for RoleBindings

#### Issue: Service Account Cannot Access Resources

**Symptoms:**
- Pod cannot access Kubernetes API
- Service account token authentication fails

**Diagnosis:**
```bash
# Check service account
kubectl get serviceaccount <sa-name> -n <namespace> -o yaml

# Check role binding
kubectl get rolebinding -n <namespace>

# Test from pod
kubectl exec -it <pod> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

**Solutions:**
- Create RoleBinding for service account
- Verify service account name in pod spec
- Check token mount (automountServiceAccountToken)
- Verify RBAC permissions

#### Issue: Admission Webhook Failures

**Symptoms:**
- Objects rejected with webhook errors
- Timeout errors during creation

**Diagnosis:**
```bash
# Check webhook configuration
kubectl get mutatingwebhookconfigurations,validatingwebhookconfigurations

# Check webhook endpoint
curl -k https://webhook.example.com/validate

# Check API server logs
kubectl logs -n kube-system kube-apiserver-<node>
```

**Solutions:**
- Verify webhook endpoint is accessible
- Check certificate validity
- Review webhook timeout settings
- Set `failurePolicy: Ignore` if webhook is down
- Check webhook implementation for bugs

## Best Practices

!!! success "Security Recommendations"
    1. **Use RBAC**: Prefer RBAC over ABAC
    2. **Least Privilege**: Grant minimum required permissions
    3. **Regular Audits**: Review permissions regularly
    4. **Service Accounts**: Use dedicated service accounts for applications
    5. **OIDC Integration**: Use OIDC for user authentication
    6. **Webhook Security**: Secure admission webhooks with TLS
    7. **Certificate Rotation**: Implement automated certificate rotation
    8. **Monitor Access**: Log and monitor all API access

## Key Takeaways

- ✅ Multiple authentication methods available (service accounts, certificates, OIDC)
- ✅ RBAC is the recommended authorization mode
- ✅ Admission controllers can mutate and validate requests
- ✅ Webhooks enable custom admission logic
- ✅ Always follow principle of least privilege
- ✅ Regular permission audits are essential
- ✅ Troubleshoot systematically: auth → authorization → admission

---

**Next Chapter**: [etcd Operations & Troubleshooting](03-etcd-operations.md)

