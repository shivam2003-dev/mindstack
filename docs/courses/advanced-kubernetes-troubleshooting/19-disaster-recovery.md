# Disaster Recovery & Backup

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master backup strategies and procedures</li>
    <li>Understand disaster recovery planning</li>
    <li>Learn restore procedures</li>
    <li>Troubleshoot backup and restore issues</li>
    <li>Implement comprehensive DR strategies</li>
  </ul>
</div>

Disaster recovery is critical for production clusters. Understanding backup strategies, restore procedures, and DR planning ensures business continuity.

!!! danger "Data Loss Risk"
    Without proper backups, cluster failures can cause permanent data loss. Always have backup and recovery procedures.

!!! warning "Test Restores"
    Untested backups are not backups. Regularly test restore procedures.

## Backup Strategies

### etcd Backup

```bash
# Automated etcd backup script
#!/bin/bash
BACKUP_DIR="/backup/etcd"
ETCD_ENDPOINTS="https://127.0.0.1:2379"
RETENTION_DAYS=30

SNAPSHOT_FILE="$BACKUP_DIR/etcd-snapshot-$(date +%Y%m%d-%H%M%S).db"

ETCDCTL_API=3 etcdctl \
  --endpoints=$ETCD_ENDPOINTS \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save $SNAPSHOT_FILE

# Verify backup
ETCDCTL_API=3 etcdctl snapshot status $SNAPSHOT_FILE

# Cleanup old backups
find $BACKUP_DIR -name "etcd-snapshot-*.db" -mtime +$RETENTION_DAYS -delete
```

!!! success "Backup Best Practices"
    - Automated daily backups
    - Multiple backup locations
    - Encrypted backups
    - Regular restore testing
    - Documented procedures

### Application Data Backup

```yaml
# Velero backup example
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: daily-backup
spec:
  includedNamespaces:
  - production
  storageLocation: default
  ttl: 720h
```

!!! tip "Velero"
    Velero provides comprehensive backup and restore for Kubernetes resources and persistent volumes.

## Disaster Recovery Planning

### RTO and RPO

**RTO (Recovery Time Objective):**
- Maximum acceptable downtime
- Determines recovery procedures

**RPO (Recovery Point Objective):**
- Maximum acceptable data loss
- Determines backup frequency

!!! note "DR Planning"
    Define RTO and RPO based on business requirements. Plan procedures accordingly.

### DR Procedures

**Procedure Steps:**
1. Assess damage
2. Activate DR plan
3. Restore from backups
4. Verify functionality
5. Document lessons learned

!!! warning "DR Testing"
    Regularly test DR procedures. Untested procedures may not work when needed.

## Restore Procedures

### etcd Restore

```bash
# 1. Stop API server
systemctl stop kube-apiserver

# 2. Backup current data
mv /var/lib/etcd /var/lib/etcd.backup

# 3. Restore from snapshot
ETCDCTL_API=3 etcdctl snapshot restore \
  /backup/etcd-snapshot-20241201-120000.db \
  --data-dir=/var/lib/etcd-new

# 4. Update etcd configuration
# 5. Start etcd
# 6. Verify cluster health
```

!!! danger "Restore Impact"
    Restore procedures are destructive. Only restore when necessary and understand implications.

## Troubleshooting

### Backup Issues

#### Backup Failures

```bash
# Check etcd health
ETCDCTL_API=3 etcdctl endpoint health

# Check disk space
df -h /backup

# Check permissions
ls -la /backup

# Review backup logs
tail -f /var/log/etcd-backup.log
```

#### Restore Failures

```bash
# Verify backup integrity
ETCDCTL_API=3 etcdctl snapshot status <backup-file>

# Check etcd configuration
cat /etc/kubernetes/manifests/etcd.yaml

# Review etcd logs
journalctl -u etcd -f
```

## Best Practices

!!! success "Production Recommendations"
    1. Automated regular backups
    2. Multiple backup locations
    3. Encrypted backups
    4. Documented restore procedures
    5. Regular DR testing
    6. Monitor backup success
    7. Test restores regularly
    8. Document lessons learned

---

**Next Chapter**: [Day-2 Operations](20-day2-operations.md)

