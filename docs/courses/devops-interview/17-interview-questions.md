# DevOps Interview Questions

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master 200+ DevOps interview questions</li>
    <li>Understand detailed answers with examples</li>
    <li>Practice explaining complex concepts</li>
    <li>Prepare for technical and behavioral rounds</li>
  </ul>
</div>

This chapter contains 200+ DevOps interview questions with detailed answers. Practice these to ace your interviews!

!!! tip "How to Use This Chapter"
    - Read questions and try to answer before looking at solutions
    - Practice explaining answers out loud
    - Focus on understanding, not memorization
    - Use STAR method for behavioral questions

## Linux & System Administration

### Q1: Explain the difference between `kill`, `killall`, and `pkill`

**Answer:**
- **`kill`**: Requires PID, sends signal to specific process
  ```bash
  kill -9 1234
  ```
- **`killall`**: Uses process name, kills all matching processes
  ```bash
  killall nginx
  ```
- **`pkill`**: Pattern-based, more flexible
  ```bash
  pkill -f "python script.py"
  ```

### Q2: What is the difference between `restart` and `reload` for services?

**Answer:**
- **Restart**: Stops service completely, then starts it (downtime)
- **Reload**: Applies new configuration without stopping service (no downtime)
- Use `reload` when possible to avoid service interruption

### Q3: How do you find files larger than 100MB?

**Answer:**
```bash
find / -type f -size +100M 2>/dev/null
find / -type f -size +100M -exec ls -lh {} \;
```

### Q4: Explain file permissions 755

**Answer:**
- **7** (owner): Read(4) + Write(2) + Execute(1) = rwx
- **5** (group): Read(4) + Execute(1) = r-x
- **5** (others): Read(4) + Execute(1) = r-x

## Docker

### Q5: What is the difference between Docker image and container?

**Answer:**
- **Image**: Read-only template, like a class in programming
- **Container**: Running instance of an image, like an object
- Image is static, container is dynamic

### Q6: Explain Docker layers

**Answer:**
- Docker images are built in layers
- Each Dockerfile instruction creates a layer
- Layers are cached for faster builds
- Layers are read-only, containers add writable layer on top

### Q7: How do you reduce Docker image size?

**Answer:**
1. Use multi-stage builds
2. Use Alpine or slim base images
3. Combine RUN commands to reduce layers
4. Use `.dockerignore` to exclude unnecessary files
5. Remove package managers and build tools in final stage

### Q8: What is the difference between `CMD` and `ENTRYPOINT`?

**Answer:**
- **`CMD`**: Default command, can be overridden
- **`ENTRYPOINT`**: Always executed, arguments appended
- Use `ENTRYPOINT` for fixed commands, `CMD` for defaults

## Kubernetes

### Q9: Explain Kubernetes architecture

**Answer:**
- **Master Node**: Control plane (API server, etcd, scheduler, controller manager)
- **Worker Nodes**: Run pods (kubelet, kube-proxy, container runtime)
- **Pods**: Smallest deployable unit
- **Services**: Network abstraction for pods

### Q10: What is the difference between Deployment and StatefulSet?

**Answer:**
- **Deployment**: Stateless apps, random pod names, shared storage
- **StatefulSet**: Stateful apps, ordered pod names, persistent storage per pod

### Q11: Explain Kubernetes Services

**Answer:**
- **ClusterIP**: Internal service (default)
- **NodePort**: Exposes service on node's IP
- **LoadBalancer**: External load balancer
- **ExternalName**: Maps to external DNS name

## CI/CD

### Q12: What is CI/CD?

**Answer:**
- **CI (Continuous Integration)**: Automatically test code on commit
- **CD (Continuous Deployment/Delivery)**: Automatically deploy tested code
- Benefits: Faster releases, fewer bugs, automated testing

### Q13: Explain GitHub Actions workflow

**Answer:**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: docker build -t app .
      - name: Test
        run: npm test
      - name: Deploy
        run: ./deploy.sh
```

### Q14: What is Infrastructure as Code?

**Answer:**
- Managing infrastructure through code (Terraform, Ansible, CloudFormation)
- Benefits: Version control, reproducibility, consistency
- Tools: Terraform, Ansible, Pulumi, CloudFormation

## Cloud & AWS

### Q15: Explain AWS EC2 vs ECS vs EKS

**Answer:**
- **EC2**: Virtual servers, full control
- **ECS**: Container orchestration, AWS-managed
- **EKS**: Kubernetes on AWS, managed control plane

### Q16: What is S3 and its use cases?

**Answer:**
- Object storage service
- Use cases: Static websites, backups, data lakes, content delivery
- Features: Versioning, lifecycle policies, encryption

### Q17: Explain VPC and subnets

**Answer:**
- **VPC**: Virtual private cloud, isolated network
- **Subnets**: Segments of VPC (public/private)
- **Route Tables**: Control traffic between subnets
- **Internet Gateway**: Connect VPC to internet

## System Design

### Q18: Design a scalable web application

**Answer:**
1. Load balancer (distribute traffic)
2. Web servers (stateless, horizontal scaling)
3. Application servers (business logic)
4. Database (master-slave replication)
5. Caching layer (Redis)
6. CDN (static content)
7. Message queue (async processing)

### Q19: How do you ensure high availability?

**Answer:**
- Multi-AZ deployment
- Load balancing
- Auto-scaling
- Health checks
- Disaster recovery plan
- Database replication

## Troubleshooting

### Q20: How do you debug a slow application?

**Answer:**
1. Check application logs
2. Monitor CPU, memory, disk I/O
3. Check database performance
4. Review network latency
5. Use profiling tools
6. Check for memory leaks

### Q21: Container keeps restarting, how do you debug?

**Answer:**
```bash
# Check logs
docker logs container_name

# Inspect container
docker inspect container_name

# Check exit code
docker ps -a

# Run container interactively
docker run -it image_name /bin/bash
```

## Security

### Q22: How do you secure containers?

**Answer:**
- Run as non-root user
- Use minimal base images
- Scan images for vulnerabilities
- Limit container capabilities
- Use secrets management
- Network policies

### Q23: Explain least privilege principle

**Answer:**
- Grant minimum permissions needed
- Use IAM roles with specific permissions
- Avoid root/admin access
- Regular access reviews

## Behavioral Questions

### Q24: Tell me about a time you handled a production incident

**Answer (STAR Method):**
- **Situation**: Production outage affecting users
- **Task**: Restore service quickly
- **Action**: Identified root cause, implemented fix, communicated status
- **Result**: Service restored, post-mortem conducted, prevention measures added

### Q25: How do you handle conflicting priorities?

**Answer:**
- Assess impact and urgency
- Communicate with stakeholders
- Document decisions
- Focus on business value

## Advanced Questions

### Q26: Explain blue-green deployment

**Answer:**
- Two identical environments (blue = current, green = new)
- Deploy to green environment
- Test green environment
- Switch traffic from blue to green
- Rollback by switching back to blue

### Q27: What is canary deployment?

**Answer:**
- Deploy new version to small subset of users
- Monitor metrics
- Gradually increase traffic
- Rollback if issues detected

### Q28: Explain microservices vs monolith

**Answer:**
- **Monolith**: Single application, easier to develop, harder to scale
- **Microservices**: Multiple services, independent scaling, more complex
- Choose based on team size, complexity, scalability needs

## Practice Tips

!!! tip "Answer Structure"
    1. **Direct Answer**: Answer the question directly
    2. **Explanation**: Explain the concept
    3. **Example**: Provide real-world example
    4. **Trade-offs**: Mention pros and cons if applicable

!!! note "Common Mistakes"
    - Don't just list tools, explain why you use them
    - Don't memorize answers, understand concepts
    - Ask clarifying questions if needed
    - Admit when you don't know something

---

**Key Takeaways:**
- Practice explaining concepts clearly
- Understand the "why" behind tools and practices
- Use STAR method for behavioral questions
- Be honest about what you don't know
- Show problem-solving approach

---

**Previous**: [Troubleshooting](16-troubleshooting)

