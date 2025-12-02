# etcd Operations & Troubleshooting

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master etcd backup and restore procedures</li>
    <li>Understand etcd performance tuning</li>
    <li>Learn etcd maintenance operations</li>
    <li>Troubleshoot etcd issues effectively</li>
    <li>Implement etcd disaster recovery</li>
  </ul>
</div>

etcd is the brain of your Kubernetes cluster. Understanding etcd operations is critical for cluster reliability and disaster recovery.

!!! danger "Critical Component"
    etcd failure can cause complete cluster unavailability. Always have backup and recovery procedures in place.

!!! warning "Data Loss Risk"
    Incorrect etcd operations can cause permanent data loss. Always backup before making changes.

## etcd Architecture

### Data Storage

etcd stores all Kubernetes cluster state:
- Pod definitions
- Service endpoints
- ConfigMaps and Secrets
- RBAC policies
- Node information
- Namespace metadata

!!! note "Single Source of Truth"
    etcd is the only place where cluster state is persisted. All other components derive state from etcd.

### etcd Cluster

```yaml
# Typical etcd cluster (3 nodes for HA)
etcd-0: https://etcd-0.example.com:2379
etcd-1: https://etcd-1.example.com:2379
etcd-2: https://etcd-2.example.com:2379
```

!!! tip "High Availability"
    Run etcd in odd-numbered clusters (3, 5, 7) for quorum. 3 nodes can tolerate 1 failure.

## Backup Operations

### Manual Backup

```bash
# Backup etcd
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd-snapshot-$(date +%Y%m%d-%H%M%S).db

# Verify backup
ETCDCTL_API=3 etcdctl \
  --write-out=table \
  snapshot status /backup/etcd-snapshot-20241201-120000.db
```

!!! success "Backup Best Practices"
    - Schedule regular automated backups
    - Store backups in multiple locations
    - Test restore procedures regularly
    - Keep backups for at least 30 days
    - Encrypt backups containing sensitive data

### Automated Backup Script

```bash
#!/bin/bash
# etcd-backup.sh

BACKUP_DIR="/backup/etcd"
ETCD_ENDPOINTS="https://127.0.0.1:2379"
CA_CERT="/etc/kubernetes/pki/etcd/ca.crt"
CERT="/etc/kubernetes/pki/etcd/server.crt"
KEY="/etc/kubernetes/pki/etcd/server.key"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create snapshot
SNAPSHOT_FILE="$BACKUP_DIR/etcd-snapshot-$(date +%Y%m%d-%H%M%S).db"
ETCDCTL_API=3 etcdctl \
  --endpoints=$ETCD_ENDPOINTS \
  --cacert=$CA_CERT \
  --cert=$CERT \
  --key=$KEY \
  snapshot save $SNAPSHOT_FILE

# Verify snapshot
ETCDCTL_API=3 etcdctl \
  --write-out=table \
  snapshot status $SNAPSHOT_FILE

# Cleanup old backups
find $BACKUP_DIR -name "etcd-snapshot-*.db" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $SNAPSHOT_FILE"
```

!!! tip "Automation"
    Use cron or Kubernetes CronJob to automate backups. Test the script regularly.

## Restore Operations

### Restore from Snapshot

!!! danger "Destructive Operation"
    Restore operations will overwrite existing etcd data. Only restore when necessary.

```bash
# 1. Stop all etcd instances
systemctl stop etcd

# 2. Backup current data (if possible)
mv /var/lib/etcd /var/lib/etcd.backup

# 3. Restore from snapshot
ETCDCTL_API=3 etcdctl \
  snapshot restore /backup/etcd-snapshot-20241201-120000.db \
  --data-dir=/var/lib/etcd-new \
  --name=etcd-0 \
  --initial-cluster=etcd-0=https://etcd-0.example.com:2380 \
  --initial-cluster-token=etcd-cluster-1 \
  --initial-advertise-peer-urls=https://etcd-0.example.com:2380

# 4. Update etcd configuration
# Update etcd.service to use new data directory

# 5. Start etcd
systemctl start etcd

# 6. Verify cluster health
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health
```

!!! warning "Cluster Coordination"
    In multi-node etcd clusters, coordinate restore across all nodes. Restore procedures vary by deployment method.

## Performance Tuning

### Key Performance Metrics

```bash
# Check etcd performance
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status -w table
```

**Important Metrics:**
- `dbSize`: Database size (watch for quota limits)
- `leader`: Current leader
- `raftIndex`: Raft log index
- `raftTerm`: Current term

### Performance Optimization

```bash
# etcd performance flags
--quota-backend-bytes=8589934592      # 8GB default, increase if needed
--max-request-bytes=1572864           # 1.5MB max request size
--heartbeat-interval=100              # 100ms heartbeat
--election-timeout=1000               # 1s election timeout
--max-txn-ops=128                     # Max operations per transaction
--snapshot-count=100000               # Snapshots after N writes
```

!!! tip "Performance Tuning"
    - Use SSD storage for etcd data directory
    - Keep etcd on dedicated disks (separate from OS)
    - Monitor disk I/O latency (should be < 10ms)
    - Increase quota-backend-bytes before reaching limit
    - Tune heartbeat/election timeout based on network latency

### Database Compaction

```bash
# Check current revision
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status | grep revision

# Compact to specific revision
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  compact <revision>

# Defragment after compaction
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  defrag
```

!!! warning "Compaction Impact"
    Compaction and defragmentation can impact cluster performance. Perform during maintenance windows.

## Maintenance Operations

### Health Checks

```bash
# Check endpoint health
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health

# Check cluster status
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status -w table

# Check member list
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member list -w table
```

### Member Management

```bash
# Add new member
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member add etcd-3 --peer-urls=https://etcd-3.example.com:2380

# Remove member
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member remove <member-id>
```

!!! note "Member Operations"
    Member add/remove operations require coordination. Follow etcd documentation carefully.

## Troubleshooting

### Common Issues

#### Issue: etcd Quota Exceeded

**Symptoms:**
- `etcdserver: mvcc: database space exceeded`
- API server errors
- Cluster instability

**Diagnosis:**
```bash
# Check database size
ETCDCTL_API=3 etcdctl endpoint status | grep dbSize

# Check quota
ETCDCTL_API=3 etcdctl endpoint status | grep quota
```

**Solutions:**
```bash
# 1. Compact database
ETCDCTL_API=3 etcdctl compact <revision>

# 2. Defragment
ETCDCTL_API=3 etcdctl defrag

# 3. Increase quota (requires restart)
# Edit etcd.service and add:
--quota-backend-bytes=17179869184  # 16GB
```

!!! danger "Quota Exceeded"
    When quota is exceeded, etcd enters read-only mode. Immediate action required.

#### Issue: etcd Leader Election Failures

**Symptoms:**
- Frequent leader changes
- High election timeout
- Cluster instability

**Diagnosis:**
```bash
# Check leader
ETCDCTL_API=3 etcdctl endpoint status | grep leader

# Check network latency
ping <etcd-endpoints>

# Check etcd logs
journalctl -u etcd -f
```

**Solutions:**
- Increase election timeout if network latency is high
- Check network connectivity between etcd nodes
- Verify etcd node resources (CPU, memory)
- Review etcd logs for errors

#### Issue: Slow etcd Operations

**Symptoms:**
- High API server latency
- Slow kubectl responses
- Timeout errors

**Diagnosis:**
```bash
# Check etcd metrics
ETCDCTL_API=3 etcdctl endpoint status

# Check disk I/O
iostat -x 1

# Check etcd process
top -p $(pgrep etcd)
```

**Solutions:**
- Use SSD storage for etcd
- Separate etcd disk from OS disk
- Increase etcd resources
- Optimize network between API server and etcd
- Review and optimize etcd flags

### Diagnostic Checklist

```bash
# 1. Check etcd health
ETCDCTL_API=3 etcdctl endpoint health

# 2. Check cluster status
ETCDCTL_API=3 etcdctl endpoint status

# 3. Check member list
ETCDCTL_API=3 etcdctl member list

# 4. Check database size
ETCDCTL_API=3 etcdctl endpoint status | grep dbSize

# 5. Check etcd logs
journalctl -u etcd --since "1 hour ago"

# 6. Check disk space
df -h /var/lib/etcd

# 7. Check disk I/O
iostat -x 1
```

## Best Practices

!!! success "Production Recommendations"
    1. **Regular Backups**: Automated daily backups with retention policy
    2. **Test Restores**: Regularly test restore procedures
    3. **Monitor Metrics**: Track dbSize, latency, and health
    4. **Performance Tuning**: Use SSD, separate disks, optimize flags
    5. **Maintenance Windows**: Schedule compaction during low traffic
    6. **High Availability**: Run 3+ etcd nodes in separate failure domains
    7. **Security**: Use TLS for all etcd communication
    8. **Documentation**: Document backup/restore procedures

## Key Takeaways

- ✅ etcd is critical - always have backup and recovery procedures
- ✅ Regular backups are essential for disaster recovery
- ✅ Monitor database size and quota limits
- ✅ Performance depends on storage (SSD recommended)
- ✅ Compaction and defragmentation require maintenance windows
- ✅ High availability requires 3+ nodes
- ✅ Troubleshoot systematically: health → status → logs → metrics

---

**Next Chapter**: [Scheduler & Controller Manager](04-scheduler-controllers.md)

