# Cloud Architecture

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Design scalable and resilient cloud architectures</li>
    <li>Understand high availability and fault tolerance patterns</li>
    <li>Master disaster recovery strategies</li>
    <li>Learn cost optimization techniques</li>
    <li>Know security and compliance in cloud architecture</li>
  </ul>
</div>

Cloud architecture design is crucial for DevOps. This comprehensive chapter covers designing scalable, resilient, secure, and cost-effective cloud architectures.

!!! tip "Interview Focus"
    Be ready to design complete architectures, explain trade-offs, discuss scalability, and optimize for cost and performance.

## Architecture Design Principles

### The Five Pillars of Well-Architected Framework

**1. Operational Excellence:**
- Automate changes and responses
- Test all procedures
- Learn from failures
- Keep procedures current

**2. Security:**
- Implement strong identity foundation
- Enable traceability
- Apply security at all layers
- Automate security best practices

**3. Reliability:**
- Test recovery procedures
- Automatically recover from failures
- Scale horizontally
- Stop guessing capacity

**4. Performance Efficiency:**
- Democratize advanced technologies
- Go global in minutes
- Use serverless architectures
- Experiment more often

**5. Cost Optimization:**
- Adopt consumption model
- Measure overall efficiency
- Stop spending money on undifferentiated heavy lifting
- Analyze and attribute expenditure

## Scalability Patterns

### Horizontal vs Vertical Scaling

**Horizontal Scaling (Scale Out):**
- Add more instances/nodes
- Better for cloud (unlimited capacity)
- Improves availability
- Requires load balancing
- Example: Add more web servers

**Vertical Scaling (Scale Up):**
- Increase instance size
- Limited by hardware
- Single point of failure
- No code changes needed
- Example: Upgrade from t3.medium to t3.large

**When to Use:**
- **Horizontal**: Stateless applications, high availability needed
- **Vertical**: Stateful applications, single instance, quick fix

### Auto Scaling Strategies

**Reactive Scaling:**
- Scale based on current metrics
- CPU, memory, request count
- Responds to actual load

**Predictive Scaling:**
- Use machine learning to predict demand
- Scale before load increases
- Better for predictable patterns

**Scheduled Scaling:**
- Scale based on time schedules
- Known traffic patterns
- Business hours, events

**Example Auto Scaling Configuration:**
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

## High Availability Architecture

### Multi-AZ Deployment

**Architecture:**
```
                    Internet
                       ↓
                  Route 53
                       ↓
            Application Load Balancer
            (Multi-AZ, Health Checks)
                       ↓
        ┌──────────────────────────────┐
        │                              │
    ┌───┴───┐                      ┌───┴───┐
    │ AZ-1a │                      │ AZ-1b │
    │       │                      │       │
    │  Web  │                      │  Web  │
    │  App  │                      │  App  │
    │       │                      │       │
    └───┬───┘                      └───┬───┘
        │                              │
        └──────────┬───────────────────┘
                   ↓
        ┌──────────────────────┐
        │   RDS Multi-AZ       │
        │  Primary (AZ-1a)     │
        │  Standby (AZ-1b)     │
        │  Automatic Failover  │
        └──────────────────────┘
```

**Components:**
- **Load Balancer**: Distributes traffic across AZs
- **Health Checks**: Remove unhealthy instances
- **Database Replication**: Automatic failover
- **Data Synchronization**: Real-time replication

### Active-Active vs Active-Passive

**Active-Active:**
- All instances handle traffic
- Better resource utilization
- More complex to implement
- Use for: Stateless applications

**Active-Passive:**
- Primary handles traffic, standby ready
- Simpler to implement
- Lower resource utilization
- Use for: Stateful applications, databases

## Disaster Recovery Strategies

### RTO and RPO

**RTO (Recovery Time Objective):**
- Maximum acceptable downtime
- How quickly must system recover
- Example: 4 hours RTO

**RPO (Recovery Point Objective):**
- Maximum acceptable data loss
- How much data can be lost
- Example: 1 hour RPO (can lose 1 hour of data)

### Disaster Recovery Strategies

**1. Backup and Restore (Highest RTO/RPO):**
- Regular backups to S3
- Restore when disaster occurs
- Cost: Low
- RTO: Hours to days
- RPO: Hours to days

**2. Pilot Light:**
- Minimal version running in DR region
- Core services ready
- Scale up when needed
- Cost: Low to medium
- RTO: Minutes to hours
- RPO: Minutes

**3. Warm Standby:**
- Scaled-down version always running
- Can handle minimal load
- Scale up quickly
- Cost: Medium
- RTO: Minutes
- RPO: Minutes

**4. Multi-Site Active-Active (Lowest RTO/RPO):**
- Full production in multiple sites
- Load balanced across sites
- Cost: High
- RTO: Near zero
- RPO: Near zero

## Cost Optimization

### Right Sizing

**Process:**
1. Monitor resource utilization
2. Identify over-provisioned resources
3. Identify under-provisioned resources
4. Adjust instance types
5. Use CloudWatch metrics

**Tools:**
- AWS Cost Explorer
- AWS Trusted Advisor
- CloudWatch metrics
- Third-party tools (CloudHealth, Spot.io)

### Reserved Instances

**Types:**
- **Standard RIs**: Up to 72% savings, no modification
- **Convertible RIs**: Up to 54% savings, can modify
- **Scheduled RIs**: For predictable workloads

**Payment Options:**
- All Upfront: Highest discount
- Partial Upfront: Medium discount
- No Upfront: Lowest discount, monthly payments

### Spot Instances

**Use Cases:**
- Fault-tolerant workloads
- Batch processing
- CI/CD pipelines
- Development/testing

**Best Practices:**
- Use Spot Fleet for availability
- Implement checkpointing
- Handle interruptions gracefully
- Diversify across instance types

## Security Architecture

### Defense in Depth

**Layers:**
1. **Network**: VPC, subnets, security groups, NACLs
2. **Identity**: IAM, MFA, least privilege
3. **Data**: Encryption at rest and in transit
4. **Application**: WAF, input validation
5. **Monitoring**: CloudTrail, CloudWatch, GuardDuty

### Network Security

**VPC Design:**
```
Internet
   ↓
Internet Gateway
   ↓
Public Subnet (DMZ)
   ├── NAT Gateway
   └── Bastion Host
        ↓
Private Subnet (Application)
   └── Application Servers
        ↓
Private Subnet (Data)
   └── Database (No Internet)
```

**Security Groups:**
- Stateful firewall
- Instance-level security
- Allow rules only
- Default deny all

**NACLs:**
- Stateless firewall
- Subnet-level security
- Explicit allow/deny
- Rule order matters

## Comprehensive Interview Questions

### Q1: Design a scalable web application architecture

**Answer:**

**Architecture Components:**
```
Users
  ↓
CloudFront CDN (Static Content)
  ↓
Route 53 (DNS)
  ↓
Application Load Balancer (Multi-AZ)
  ↓
Auto Scaling Group
  ├── Web Servers (Stateless)
  └── Application Servers
       ↓
ElastiCache (Redis) - Session Store
       ↓
RDS Multi-AZ (Database)
       ↓
S3 (File Storage)
```

**Key Design Decisions:**
- **CDN**: Reduce latency, offload origin
- **Load Balancer**: Distribute traffic, health checks
- **Auto Scaling**: Handle traffic spikes
- **Stateless Servers**: Enable horizontal scaling
- **Caching**: Reduce database load
- **Multi-AZ Database**: High availability

### Q2: How do you ensure 99.99% availability?

**Answer:**

**Requirements:**
- 99.99% = 52.56 minutes downtime per year
- Requires redundancy at every level

**Implementation:**
1. **Multi-AZ Deployment**: All components in multiple AZs
2. **Health Checks**: Automatic failure detection
3. **Auto Scaling**: Replace failed instances
4. **Database Replication**: Automatic failover
5. **Monitoring**: Real-time alerts
6. **Disaster Recovery**: Multi-region backup

**Example:**
- Load Balancer: Multi-AZ (99.99%)
- Application: Multi-AZ with auto-scaling (99.95%)
- Database: Multi-AZ with automatic failover (99.95%)
- Overall: 99.85% (need redundancy to reach 99.99%)

### Q3: Explain the difference between availability and reliability

**Answer:**

**Availability:**
- System is operational when needed
- Measured as uptime percentage
- Example: 99.9% availability

**Reliability:**
- System performs correctly over time
- Measured as mean time between failures (MTBF)
- Includes correctness of operations

**Relationship:**
- High availability doesn't guarantee reliability
- System can be available but unreliable (buggy)
- Both are important for production systems

## Recommended Resources

### Books
- **"Designing Data-Intensive Applications" by Martin Kleppmann** - System design principles
- **"Site Reliability Engineering" by Google** - Production system design

### Articles
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Google SRE Book](https://sre.google/books/)

---

**Previous**: [AWS Services](11-aws-services) | **Next**: [Monitoring & Logging](13-monitoring-logging)
