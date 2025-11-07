# AWS Services

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master all core AWS services in depth</li>
    <li>Understand EC2, S3, VPC, and networking</li>
    <li>Learn IAM, security, and compliance</li>
    <li>Know container services (ECS, EKS, Fargate)</li>
    <li>Understand serverless and managed services</li>
  </ul>
</div>

AWS is the leading cloud platform. This comprehensive chapter covers all essential AWS services with deep dives into architecture, best practices, and real-world use cases.

!!! tip "Interview Focus"
    Be ready to explain service use cases, design architectures, discuss cost optimization, and understand service integrations.

## AWS Fundamentals

### AWS Global Infrastructure

**Regions:**
- Geographic areas with multiple Availability Zones
- Choose based on latency, compliance, cost
- Data doesn't replicate across regions automatically

**Availability Zones (AZs):**
- Isolated data centers within a region
- Connected by low-latency links
- Use multiple AZs for high availability

**Edge Locations:**
- CloudFront CDN endpoints
- Lower latency for end users
- Global distribution

## Compute Services

### EC2 (Elastic Compute Cloud)

**Instance Types:**
- **General Purpose**: t3, m5 (balanced compute, memory, networking)
- **Compute Optimized**: c5 (high-performance processors)
- **Memory Optimized**: r5 (high memory-to-CPU ratio)
- **Storage Optimized**: i3 (high IOPS, low latency)
- **GPU Instances**: p3, g4 (machine learning, graphics)

**Instance Configuration:**
```bash
# Launch instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-key \
  --security-group-ids sg-12345678 \
  --subnet-id subnet-12345678 \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]'
```

**User Data Scripts:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from EC2</h1>" > /var/www/html/index.html
```

**Instance Metadata:**
```bash
# Get instance metadata
curl http://169.254.169.254/latest/meta-data/

# Get instance ID
curl http://169.254.169.254/latest/meta-data/instance-id

# Get IAM role credentials
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### Auto Scaling Groups

**Configuration:**
```json
{
  "AutoScalingGroupName": "web-asg",
  "MinSize": 2,
  "MaxSize": 10,
  "DesiredCapacity": 3,
  "LaunchTemplate": {
    "LaunchTemplateId": "lt-1234567890abcdef0",
    "Version": "$Latest"
  },
  "VPCZoneIdentifier": "subnet-12345678,subnet-87654321",
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300,
  "TargetGroupARNs": ["arn:aws:elasticloadbalancing:..."],
  "Tags": [
    {
      "Key": "Name",
      "Value": "web-asg",
      "PropagateAtLaunch": true
    }
  ]
}
```

**Scaling Policies:**
```json
{
  "PolicyName": "scale-up-cpu",
  "AutoScalingGroupName": "web-asg",
  "PolicyType": "TargetTrackingScaling",
  "TargetTrackingConfiguration": {
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 70.0
  }
}
```

### ECS (Elastic Container Service)

**ECS Components:**
- **Cluster**: Group of EC2 instances or Fargate capacity
- **Task Definition**: Blueprint for containers
- **Service**: Maintains desired number of tasks
- **Task**: Running container instance

**Task Definition:**
```json
{
  "family": "web-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "myapp:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/web-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**ECS Service:**
```json
{
  "serviceName": "web-service",
  "cluster": "production",
  "taskDefinition": "web-app:10",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345678"],
      "securityGroups": ["sg-12345678"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:...",
      "containerName": "web",
      "containerPort": 80
    }
  ]
}
```

### EKS (Elastic Kubernetes Service)

**EKS Architecture:**
- Managed Kubernetes control plane
- Worker nodes (EC2 or Fargate)
- VPC integration
- IAM integration

**Creating EKS Cluster:**
```bash
# Create cluster
aws eks create-cluster \
  --name production \
  --role-arn arn:aws:iam::123456789012:role/eks-service-role \
  --resources-vpc-config subnetIds=subnet-12345678,subnet-87654321,securityGroupIds=sg-12345678

# Create node group
aws eks create-nodegroup \
  --cluster-name production \
  --nodegroup-name workers \
  --node-role arn:aws:iam::123456789012:role/eks-node-role \
  --subnets subnet-12345678 subnet-87654321 \
  --instance-types t3.medium \
  --scaling-config minSize=2,maxSize=10,desiredSize=3
```

## Storage Services

### S3 (Simple Storage Service)

**S3 Features:**
- Object storage (not file system)
- Unlimited storage
- 99.999999999% (11 9's) durability
- Versioning and lifecycle policies

**S3 Storage Classes:**
- **Standard**: General purpose, frequently accessed
- **Intelligent-Tiering**: Automatically moves objects
- **Standard-IA**: Infrequently accessed, lower cost
- **One Zone-IA**: Single AZ, lower cost
- **Glacier Instant Retrieval**: Archive with instant access
- **Glacier Flexible Retrieval**: Archive (expedited, standard, bulk)
- **Glacier Deep Archive**: Lowest cost, 12-hour retrieval

**S3 Operations:**
```bash
# Create bucket
aws s3 mb s3://my-bucket --region us-east-1

# Upload file
aws s3 cp file.txt s3://my-bucket/

# Sync directory
aws s3 sync ./local-dir s3://my-bucket/remote-dir

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket \
  --lifecycle-configuration file://lifecycle.json
```

**Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "Move to Glacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

**S3 Security:**
- **Bucket Policies**: JSON policies for bucket access
- **ACLs**: Legacy access control
- **Encryption**: SSE-S3, SSE-KMS, SSE-C, client-side
- **MFA Delete**: Require MFA for deletion

### EBS (Elastic Block Store)

**EBS Volume Types:**
- **gp3**: General purpose SSD (latest, best price/performance)
- **gp2**: General purpose SSD (legacy)
- **io1/io2**: Provisioned IOPS SSD (high performance)
- **st1**: Throughput Optimized HDD
- **sc1**: Cold HDD (lowest cost)

**EBS Operations:**
```bash
# Create volume
aws ec2 create-volume \
  --availability-zone us-east-1a \
  --size 100 \
  --volume-type gp3 \
  --encrypted

# Attach volume
aws ec2 attach-volume \
  --volume-id vol-1234567890abcdef0 \
  --instance-id i-1234567890abcdef0 \
  --device /dev/sdf

# Create snapshot
aws ec2 create-snapshot \
  --volume-id vol-1234567890abcdef0 \
  --description "Backup snapshot"
```

## Networking Services

### VPC (Virtual Private Cloud)

**VPC Components:**
- **VPC**: Isolated network
- **Subnets**: Segments of VPC (public/private)
- **Route Tables**: Control traffic routing
- **Internet Gateway**: Connect to internet
- **NAT Gateway**: Outbound internet for private subnets
- **VPC Peering**: Connect VPCs
- **Transit Gateway**: Hub for multiple VPCs

**VPC Configuration:**
```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=main-vpc}]'

# Create subnets
aws ec2 create-subnet \
  --vpc-id vpc-12345678 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Create Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-12345678 \
  --vpc-id vpc-12345678

# Create route table
aws ec2 create-route-table \
  --vpc-id vpc-12345678

# Add route to Internet Gateway
aws ec2 create-route \
  --route-table-id rtb-12345678 \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id igw-12345678
```

### Load Balancers

**ALB (Application Load Balancer):**
- Layer 7 (HTTP/HTTPS)
- Path-based and host-based routing
- SSL termination
- WebSocket support

**NLB (Network Load Balancer):**
- Layer 4 (TCP/UDP)
- Ultra-low latency
- Static IP addresses
- Preserves source IP

**CLB (Classic Load Balancer):**
- Legacy (avoid for new deployments)
- Layer 4 and Layer 7

**Target Groups:**
```json
{
  "Name": "web-targets",
  "Protocol": "HTTP",
  "Port": 80,
  "VpcId": "vpc-12345678",
  "HealthCheckProtocol": "HTTP",
  "HealthCheckPath": "/health",
  "HealthCheckIntervalSeconds": 30,
  "HealthyThresholdCount": 2,
  "UnhealthyThresholdCount": 3
}
```

## Security Services

### IAM (Identity and Access Management)

**IAM Components:**
- **Users**: Individual accounts
- **Groups**: Collections of users
- **Roles**: Temporary credentials
- **Policies**: Permissions documents

**IAM Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

**IAM Roles:**
```json
{
  "RoleName": "EC2-S3-Access",
  "AssumeRolePolicyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  },
  "Policies": [
    {
      "PolicyName": "S3ReadWrite",
      "PolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "s3:GetObject",
              "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::my-bucket/*"
          }
        ]
      }
    }
  ]
}
```

**IAM Best Practices:**
- Least privilege principle
- Use roles instead of users for applications
- Enable MFA for root and privileged users
- Regular access reviews
- Use policy conditions

### Security Groups and NACLs

**Security Groups (Stateful):**
```json
{
  "GroupName": "web-sg",
  "Description": "Security group for web servers",
  "VpcId": "vpc-12345678",
  "IpPermissions": [
    {
      "IpProtocol": "tcp",
      "FromPort": 80,
      "ToPort": 80,
      "IpRanges": [
        {
          "CidrIp": "0.0.0.0/0",
          "Description": "HTTP from anywhere"
        }
      ]
    }
  ]
}
```

**NACLs (Stateless):**
- Network-level firewall
- Applied at subnet level
- Explicit allow/deny rules
- Process rules in order

## Comprehensive Interview Questions

### Q1: Explain the difference between EC2, ECS, and EKS

**Answer:**

**EC2 (Elastic Compute Cloud):**
- Virtual servers in the cloud
- Full control over OS and applications
- Manual container management
- Use for: Traditional applications, custom setups

**ECS (Elastic Container Service):**
- AWS-managed container orchestration
- No Kubernetes knowledge required
- Integrated with AWS services
- Use for: Containerized apps, AWS-native deployments

**EKS (Elastic Kubernetes Service):**
- Managed Kubernetes control plane
- Kubernetes API and tools
- Multi-cloud compatible
- Use for: Kubernetes workloads, complex orchestration

**Comparison:**
- **Control**: EC2 > EKS > ECS
- **Ease of Use**: ECS > EKS > EC2
- **Flexibility**: EKS > EC2 > ECS
- **AWS Integration**: ECS > EKS > EC2

### Q2: Design a highly available architecture on AWS

**Answer:**

**Multi-AZ Architecture:**
```
Internet
   ↓
Route 53 (DNS)
   ↓
Application Load Balancer (Multi-AZ)
   ↓
┌─────────────┬─────────────┐
│   AZ-1a     │   AZ-1b     │
│ ┌─────────┐ │ ┌─────────┐ │
│ │ EC2     │ │ │ EC2     │ │
│ │ Web     │ │ │ Web     │ │
│ └─────────┘ │ └─────────┘ │
│      ↓      │      ↓      │
│ ┌─────────┐ │ ┌─────────┐ │
│ │ RDS     │ │ │ RDS     │ │
│ │ Primary │ │ │ Standby │ │
│ └─────────┘ │ └─────────┘ │
└─────────────┴─────────────┘
```

**Components:**
- Route 53 for DNS failover
- Multi-AZ Load Balancer
- Auto Scaling Groups across AZs
- RDS Multi-AZ for database
- S3 for static assets
- CloudFront for CDN

### Q3: How do you optimize AWS costs?

**Answer:**

1. **Right Sizing:**
   - Use CloudWatch metrics to analyze usage
   - Choose appropriate instance types
   - Use Reserved Instances for predictable workloads

2. **Reserved Instances:**
   - 1-year or 3-year commitments
   - Up to 72% savings vs On-Demand
   - Convertible RIs for flexibility

3. **Spot Instances:**
   - Up to 90% savings
   - For fault-tolerant workloads
   - Use Spot Fleet for availability

4. **S3 Storage Optimization:**
   - Use appropriate storage classes
   - Lifecycle policies to move old data
   - Delete unused objects

5. **Auto Scaling:**
   - Scale down during low usage
   - Use scheduled scaling
   - Right-size based on actual needs

### Q4: Explain S3 consistency model

**Answer:**

**Read-After-Write Consistency:**
- PUTs of new objects: Immediate consistency
- Overwrite PUTs and DELETEs: Eventually consistent
- Can take time to propagate globally

**Implications:**
- New object uploads: Immediately available
- Updates to existing objects: May see old version briefly
- Deletes: May still be accessible briefly

**Best Practices:**
- Use versioning for critical data
- Use ETags for change detection
- Implement retry logic for eventual consistency

## Recommended Resources

### Books
- **"AWS Certified Solutions Architect Study Guide" by Ben Piper** - Comprehensive AWS guide
- **"Amazon Web Services in Action" by Michael Wittig** - Practical AWS usage

### Articles
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Documentation](https://docs.aws.amazon.com/)

---

**Previous**: [Infrastructure as Code](10-infrastructure-as-code) | **Next**: [Cloud Architecture](12-cloud-architecture)
