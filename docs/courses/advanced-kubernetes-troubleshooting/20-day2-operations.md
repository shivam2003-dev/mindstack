# Day-2 Operations

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master cluster upgrades and maintenance</li>
    <li>Understand operational best practices</li>
    <li>Learn capacity planning and scaling</li>
    <li>Troubleshoot operational issues</li>
    <li>Implement operational excellence</li>
  </ul>
</div>

Day-2 operations are ongoing cluster management tasks. Understanding upgrades, maintenance, and operational best practices ensures cluster reliability and performance.

!!! tip "Operational Excellence"
    Day-2 operations determine long-term cluster success. Invest in automation and best practices.

!!! warning "Operational Debt"
    Neglecting day-2 operations accumulates technical debt. Regular maintenance is essential.

## Cluster Upgrades

### Upgrade Strategy

**Upgrade Approaches:**
- **In-Place**: Upgrade existing cluster
- **Blue-Green**: New cluster, migrate workloads
- **Canary**: Gradual rollout

!!! note "Upgrade Planning"
    Plan upgrades carefully. Test in non-production, have rollback plan, schedule maintenance window.

### kubeadm Upgrade

```bash
# Upgrade control plane
kubeadm upgrade plan
kubeadm upgrade apply v1.28.0

# Upgrade kubelet
apt-get update
apt-get install kubelet=1.28.0-00 kubectl=1.28.0-00
systemctl daemon-reload
systemctl restart kubelet

# Upgrade worker nodes
kubeadm upgrade node
```

!!! warning "Upgrade Order"
    Upgrade control plane first, then worker nodes. Follow Kubernetes upgrade documentation.

## Maintenance Operations

### Node Maintenance

```bash
# Drain node
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Perform maintenance
# ...

# Uncordon node
kubectl uncordon <node-name>
```

!!! tip "Node Draining"
    Draining ensures pods are gracefully terminated and rescheduled. Always drain before maintenance.

### Certificate Rotation

```bash
# Check certificate expiration
kubeadm certs check-expiration

# Renew certificates
kubeadm certs renew all

# Restart control plane components
systemctl restart kubelet
```

!!! warning "Certificate Expiration"
    Expired certificates cause cluster failures. Monitor and renew before expiration.

## Capacity Planning

### Resource Planning

```bash
# Check cluster capacity
kubectl describe nodes

# Check resource requests
kubectl top nodes
kubectl top pods --all-namespaces

# Plan scaling
# Based on growth projections and current usage
```

!!! note "Capacity Planning"
    Regular capacity planning prevents resource exhaustion. Plan for growth and peak loads.

## Operational Best Practices

### Monitoring and Alerting

- Monitor all critical components
- Set up comprehensive alerting
- Review alerts regularly
- Tune alert thresholds

### Documentation

- Document cluster architecture
- Maintain runbooks
- Document procedures
- Keep diagrams updated

### Automation

- Automate repetitive tasks
- Use infrastructure as code
- Implement GitOps
- Automate testing

!!! success "Operational Excellence"
    1. Comprehensive monitoring
    2. Documented procedures
    3. Automation where possible
    4. Regular reviews
    5. Continuous improvement
    6. Team knowledge sharing

## Troubleshooting

### Operational Issues

#### Upgrade Failures

```bash
# Check upgrade status
kubectl get nodes

# Review upgrade logs
journalctl -u kubelet -f

# Check component versions
kubectl version

# Rollback if necessary
# Follow rollback procedures
```

#### Maintenance Issues

```bash
# Check node status
kubectl get nodes

# Check pod status
kubectl get pods --all-namespaces

# Review events
kubectl get events --all-namespaces
```

## Best Practices

!!! success "Production Recommendations"
    1. Regular cluster upgrades
    2. Scheduled maintenance windows
    3. Comprehensive monitoring
    4. Documented procedures
    5. Automation and GitOps
    6. Regular capacity planning
    7. Team training and knowledge sharing
    8. Continuous improvement

---

**Course Complete!** 🎉

You've completed the Advanced Kubernetes Troubleshooting & Expert Course. Continue practicing and applying these concepts in your production environments.

