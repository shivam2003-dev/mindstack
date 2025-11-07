# Kubernetes Mastery

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Kubernetes architecture</li>
    <li>Understand pods, services, deployments</li>
    <li>Learn advanced Kubernetes concepts</li>
    <li>Know production best practices</li>
  </ul>
</div>

Kubernetes is essential for container orchestration. This chapter covers Kubernetes from fundamentals to advanced topics.

!!! tip "Interview Focus"
    Be ready to explain Kubernetes architecture, design deployments, and troubleshoot issues. Understand when to use which resource.

## Kubernetes Architecture

### Components

**Master Node:**
- **API Server**: Entry point for all operations
- **etcd**: Key-value store for cluster state
- **Scheduler**: Assigns pods to nodes
- **Controller Manager**: Manages controllers

**Worker Nodes:**
- **kubelet**: Agent managing pods
- **kube-proxy**: Network proxy
- **Container Runtime**: Docker, containerd, etc.

## Core Resources

### Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
```

### Deployments

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### Services

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Common Commands

```bash
# Get resources
kubectl get pods
kubectl get services
kubectl get deployments

# Describe resource
kubectl describe pod <pod-name>

# Logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>

# Execute command
kubectl exec -it <pod-name> -- /bin/sh

# Apply manifest
kubectl apply -f deployment.yaml

# Delete
kubectl delete pod <pod-name>
```

## Interview Questions

### Q: Explain Kubernetes architecture

**Answer:**
- Master node: Control plane (API server, etcd, scheduler, controllers)
- Worker nodes: Run pods (kubelet, kube-proxy, container runtime)
- Pods: Smallest deployable unit
- Services: Network abstraction

### Q: Difference between Deployment and StatefulSet?

**Answer:**
- **Deployment**: Stateless, random pod names, shared storage
- **StatefulSet**: Stateful, ordered pod names, persistent storage per pod

### Q: Explain Services

**Answer:**
- **ClusterIP**: Internal service (default)
- **NodePort**: Exposes on node IP
- **LoadBalancer**: External load balancer
- **ExternalName**: Maps to external DNS

---

**Previous**: [Docker Deep Dive](05-docker-deep-dive) | **Next**: [Container Orchestration](07-container-orchestration)

