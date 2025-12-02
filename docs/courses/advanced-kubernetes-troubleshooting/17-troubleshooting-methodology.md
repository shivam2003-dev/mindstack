# Troubleshooting Methodology

<div style="background: linear-gradient(135deg, #326ce5 0%, #1e3a8a 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master systematic troubleshooting approaches</li>
    <li>Learn diagnostic techniques and tools</li>
    <li>Understand common issue patterns</li>
    <li>Develop troubleshooting playbooks</li>
    <li>Build effective troubleshooting workflows</li>
  </ul>
</div>

Systematic troubleshooting methodology enables efficient problem resolution. Understanding diagnostic techniques and common patterns accelerates issue resolution.

!!! tip "Systematic Approach"
    Always follow a systematic approach: gather information, identify symptoms, form hypotheses, test, and verify.

!!! warning "Rush to Solutions"
    Avoid jumping to solutions. Gather comprehensive information first.

## Troubleshooting Framework

### 1. Information Gathering

```bash
# Cluster overview
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces

# Component health
kubectl get componentstatuses
kubectl get --raw /healthz

# Events
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

!!! note "Information First"
    Comprehensive information gathering prevents incorrect assumptions.

### 2. Symptom Identification

**Common Symptoms:**
- Pods not starting
- Services not accessible
- High resource usage
- Network connectivity issues
- Performance degradation

!!! tip "Symptom Patterns"
    Document symptom patterns. Similar symptoms often indicate similar root causes.

### 3. Hypothesis Formation

**Hypothesis Framework:**
- What component is involved?
- What changed recently?
- What's the expected behavior?
- What could cause this?

!!! success "Multiple Hypotheses"
    Form multiple hypotheses. Test systematically, starting with most likely.

### 4. Testing and Verification

```bash
# Test connectivity
kubectl run test-pod --image=busybox --rm -it -- wget -O- <service>

# Test resource availability
kubectl describe node <node-name>

# Test configuration
kubectl get <resource> -o yaml
```

## Diagnostic Tools

### kubectl Commands

```bash
# Describe resources
kubectl describe pod <pod-name>
kubectl describe node <node-name>
kubectl describe service <service-name>

# Get logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container>
kubectl logs <pod-name> --previous

# Execute commands
kubectl exec <pod-name> -- <command>
kubectl exec <pod-name> -c <container> -- <command>

# Port forward
kubectl port-forward <pod-name> 8080:80
```

### Debugging Tools

```bash
# Check resource usage
kubectl top nodes
kubectl top pods

# Check API resources
kubectl api-resources
kubectl explain <resource>

# Check events
kubectl get events --field-selector involvedObject.name=<pod-name>
```

## Common Issue Patterns

### Pattern: Pod Not Starting

**Symptoms:**
- Pod status: Pending, CrashLoopBackOff, ImagePullBackOff

**Diagnosis:**
```bash
# Check pod status
kubectl get pod <pod-name> -o wide

# Check events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check image
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[*].image}'
```

**Common Causes:**
- Insufficient resources
- Image pull failures
- Configuration errors
- Resource quotas
- Node selectors/taints

### Pattern: Service Not Accessible

**Symptoms:**
- Cannot reach service from pods
- Service endpoints empty
- Connection timeouts

**Diagnosis:**
```bash
# Check service
kubectl get service <service-name>
kubectl describe service <service-name>

# Check endpoints
kubectl get endpoints <service-name>

# Check pod labels
kubectl get pods -l app=<label>

# Test connectivity
kubectl run test-pod --image=busybox --rm -it -- wget -O- <service>
```

**Common Causes:**
- Pod selector mismatch
- Network policies blocking traffic
- Service type misconfiguration
- DNS resolution issues

## Troubleshooting Playbooks

### Playbook: Cluster Not Responding

1. Check API server health
2. Check etcd health
3. Check node status
4. Review control plane logs
5. Check network connectivity
6. Verify certificates

### Playbook: Performance Degradation

1. Check resource usage
2. Review recent changes
3. Check for resource contention
4. Analyze metrics and logs
5. Review network performance
6. Check for throttling

## Best Practices

!!! success "Production Recommendations"
    1. Document troubleshooting procedures
    2. Maintain runbooks for common issues
    3. Use systematic approach
    4. Test hypotheses before making changes
    5. Document solutions for future reference
    6. Regular troubleshooting practice

---

**Next Chapter**: [Multi-Cluster Management](18-multi-cluster.md)

