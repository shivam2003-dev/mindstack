# Security Best Practices

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand DevSecOps principles</li>
    <li>Master security best practices</li>
    <li>Learn secrets management</li>
    <li>Know container and cloud security</li>
    <li>Understand compliance and auditing</li>
  </ul>
</div>

Security is critical in DevOps. This comprehensive chapter covers DevSecOps, security best practices, and securing infrastructure and applications.

!!! tip "Interview Focus"
    Understand security principles, know how to secure containers and cloud infrastructure, and be ready to discuss security automation.

## DevSecOps Fundamentals

### What is DevSecOps?

DevSecOps integrates security practices into the DevOps workflow, making security everyone's responsibility.

**Key Principles:**
- **Shift Left**: Security early in development
- **Security as Code**: Infrastructure and security defined in code
- **Automated Security**: Automated testing and scanning
- **Continuous Security**: Ongoing security monitoring

**Benefits:**
- Faster security fixes
- Reduced security debt
- Better collaboration
- Compliance automation

### Security in CI/CD Pipeline

**Security Stages:**
1. **SAST** (Static Application Security Testing)
2. **DAST** (Dynamic Application Security Testing)
3. **Dependency Scanning**
4. **Container Scanning**
5. **Infrastructure Scanning**
6. **Secrets Scanning**

**Pipeline Integration:**
```yaml
stages:
  - build
  - security-scan
  - test
  - deploy

security-scan:
  stage: security-scan
  script:
    - npm audit
    - bandit -r .  # Python SAST
    - trivy image app:latest
    - git-secrets scan
```

## Secrets Management

### Why Secrets Management Matters

**Problems with Hardcoded Secrets:**
- Committed to Git (visible in history)
- Shared across environments
- Difficult to rotate
- No audit trail

**Best Practices:**
- Never commit secrets to Git
- Use secret management tools
- Rotate secrets regularly
- Use least privilege
- Audit secret access

### Secret Management Tools

**HashiCorp Vault:**
```bash
# Store secret
vault kv put secret/database password=mysecret

# Retrieve secret
vault kv get secret/database

# Use in application
export DB_PASSWORD=$(vault kv get -field=password secret/database)
```

**AWS Secrets Manager:**
```python
import boto3

client = boto3.client('secretsmanager')
response = client.get_secret_value(SecretId='db-password')
password = response['SecretString']
```

**Kubernetes Secrets:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  password: mypassword
---
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

## Container Security

### Securing Docker Images

**Best Practices:**
1. **Use Minimal Base Images:**
   ```dockerfile
   FROM alpine:latest  # Instead of ubuntu:latest
   ```

2. **Run as Non-Root:**
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```

3. **Scan Images:**
   ```bash
   docker scan nginx:latest
   trivy image nginx:latest
   ```

4. **Use Specific Tags:**
   ```dockerfile
   FROM node:18-alpine  # Not node:latest
   ```

5. **Multi-Stage Builds:**
   ```dockerfile
   FROM node:18 AS builder
   # Build stage
   
   FROM alpine:latest
   # Production stage, no build tools
   ```

### Kubernetes Security

**Pod Security:**
```yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

**Network Policies:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 80
```

## Cloud Security

### IAM Best Practices

**Least Privilege:**
- Grant minimum permissions needed
- Regular access reviews
- Use roles instead of users
- Enable MFA

**Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2024-01-01T00:00:00Z"
        }
      }
    }
  ]
}
```

### Network Security

**VPC Security:**
- Private subnets for sensitive resources
- Security groups with least privilege
- NACLs for additional layer
- VPN for secure access

**WAF (Web Application Firewall):**
- Protect against common attacks
- SQL injection
- XSS attacks
- Rate limiting

## Security Scanning

### SAST (Static Application Security Testing)

**Tools:**
- **SonarQube**: Code quality and security
- **Bandit**: Python security scanner
- **ESLint**: JavaScript security rules
- **Brakeman**: Ruby security scanner

**Integration:**
```yaml
- name: SAST Scan
  run: |
    bandit -r . -f json -o bandit-report.json
    sonar-scanner
```

### Dependency Scanning

**Tools:**
- **npm audit**: Node.js dependencies
- **pip-audit**: Python dependencies
- **bundler-audit**: Ruby dependencies
- **Snyk**: Multi-language scanner

**Automation:**
```yaml
- name: Dependency Check
  run: |
    npm audit --audit-level=moderate
    pip-audit
```

### Container Scanning

**Tools:**
- **Trivy**: Comprehensive scanner
- **Clair**: Container vulnerability scanner
- **Docker Scout**: Docker's scanner

**CI Integration:**
```yaml
- name: Scan Container
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:latest
    format: 'sarif'
    exit-code: '1'
```

## Compliance and Auditing

### Audit Logging

**What to Audit:**
- User access and actions
- Configuration changes
- Data access
- Security events

**Tools:**
- **AWS CloudTrail**: AWS API logging
- **Kubernetes Audit Logs**: K8s API logging
- **Syslog**: System event logging

### Compliance Standards

**Common Standards:**
- **SOC 2**: Security, availability, processing integrity
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card industry
- **GDPR**: Data protection (EU)
- **HIPAA**: Healthcare data (US)

## Comprehensive Interview Questions

### Q1: How do you implement security in a CI/CD pipeline?

**Answer:**

**Security Stages:**
1. **Pre-commit**: Git hooks, secrets scanning
2. **Build**: SAST, dependency scanning
3. **Test**: Security testing, DAST
4. **Package**: Container scanning
5. **Deploy**: Infrastructure scanning
6. **Post-deploy**: Runtime security monitoring

**Implementation:**
```yaml
security:
  stage: security
  script:
    - git-secrets scan
    - npm audit
    - bandit -r .
    - trivy fs .
    - docker build -t app .
    - trivy image app
  allow_failure: false
```

### Q2: Explain defense in depth

**Answer:**

**Layers:**
1. **Network**: Firewalls, network segmentation
2. **Identity**: IAM, MFA, least privilege
3. **Data**: Encryption at rest and in transit
4. **Application**: Input validation, secure coding
5. **Monitoring**: Logging, alerting, intrusion detection

**Example:**
- Even if one layer fails, others provide protection
- Multiple security controls
- Reduces single point of failure

### Q3: How do you handle a security breach?

**Answer:**

**Incident Response:**
1. **Detect**: Monitoring, alerts, logs
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore systems
5. **Lessons Learned**: Post-mortem, improve

**Prevention:**
- Regular security audits
- Penetration testing
- Security training
- Automated scanning

## Recommended Resources

### Books
- **"The Web Application Hacker's Handbook"** - Web security
- **"Kubernetes Security" by Liz Rice** - Container security

### Articles
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)

---

**Previous**: [System Design](14-system-design) | **Next**: [Troubleshooting](16-troubleshooting)
