# AWS Services

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master core AWS services</li>
    <li>Understand EC2, S3, VPC</li>
    <li>Learn IAM and security</li>
    <li>Know AWS best practices</li>
  </ul>
</div>

AWS is the leading cloud platform. This chapter covers essential AWS services for DevOps.

!!! tip "Interview Focus"
    Understand service use cases, architecture patterns, and cost optimization.

## Core Services

### EC2 (Elastic Compute Cloud)

- Virtual servers in the cloud
- Instance types: t2.micro, m5.large, etc.
- Auto Scaling Groups
- Load Balancers

### S3 (Simple Storage Service)

- Object storage
- Use cases: Static websites, backups, data lakes
- Features: Versioning, lifecycle policies, encryption

### VPC (Virtual Private Cloud)

- Isolated network
- Subnets (public/private)
- Route tables
- Internet Gateway

### IAM (Identity and Access Management)

- User and role management
- Policies and permissions
- MFA
- Least privilege principle

## Interview Questions

### Q: Explain EC2 vs ECS vs EKS

**Answer:**
- **EC2**: Virtual servers, full control
- **ECS**: Container orchestration, AWS-managed
- **EKS**: Kubernetes on AWS, managed control plane

### Q: What is S3 and use cases?

**Answer:**
- Object storage service
- Static websites, backups, data lakes, content delivery
- Versioning, lifecycle policies, encryption

---

**Previous**: [Infrastructure as Code](10-infrastructure-as-code) | **Next**: [Cloud Architecture](12-cloud-architecture)

