# Infrastructure as Code

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Terraform in depth</li>
    <li>Learn Ansible automation comprehensively</li>
    <li>Understand CloudFormation and Pulumi</li>
    <li>Know IaC best practices and patterns</li>
    <li>Understand state management and collaboration</li>
  </ul>
</div>

Infrastructure as Code (IaC) is fundamental to modern DevOps. This comprehensive chapter covers all major IaC tools, advanced patterns, and production best practices.

!!! tip "Interview Focus"
    Be ready to explain declarative vs imperative, state management, modules, and design complex infrastructure.

## Infrastructure as Code Fundamentals

### What is Infrastructure as Code?

IaC is the practice of managing and provisioning infrastructure through machine-readable definition files, rather than manual processes.

**Key Principles:**
- **Version Control**: Infrastructure code in Git
- **Idempotency**: Running same code multiple times produces same result
- **Reproducibility**: Same infrastructure every time
- **Consistency**: Same configuration across environments
- **Documentation**: Code serves as documentation

**Benefits:**
1. **Speed**: Provision infrastructure in minutes, not days
2. **Consistency**: Eliminate configuration drift
3. **Risk Reduction**: Version control and testing
4. **Cost Optimization**: Track and optimize resources
5. **Scalability**: Easily replicate environments

### Declarative vs Imperative

**Declarative (Terraform, CloudFormation):**
- Describe desired end state
- Tool figures out how to achieve it
- Idempotent by nature
- Example: "I want 3 servers"

**Imperative (Ansible, Chef):**
- Describe steps to execute
- Execute commands in sequence
- Requires careful scripting for idempotency
- Example: "Create server 1, then server 2, then server 3"

## Terraform Deep Dive

### Terraform Basics

**Provider Configuration:**
```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

**Resource Definition:**
```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  
  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.public[0].id
  
  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
  EOF
  
  tags = {
    Name = "${var.environment}-web-server"
  }
}
```

### Terraform State Management

**State File:**
- Tracks resources managed by Terraform
- Maps configuration to real resources
- Used for planning and updates

**Remote State:**
```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**State Locking:**
- Prevents concurrent modifications
- Uses DynamoDB for S3 backend
- Prevents state corruption

**State Operations:**
```bash
# View state
terraform state list
terraform state show aws_instance.web

# Move resources
terraform state mv aws_instance.old aws_instance.new

# Remove from state (doesn't delete resource)
terraform state rm aws_instance.web

# Import existing resources
terraform import aws_instance.web i-1234567890abcdef0
```

### Terraform Modules

**Module Structure:**
```
modules/ec2-instance/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
```

**Module Definition:**
```hcl
# modules/ec2-instance/main.tf
resource "aws_instance" "this" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}

# modules/ec2-instance/variables.tf
variable "ami_id" {
  description = "AMI ID for the instance"
  type        = string
}

variable "instance_type" {
  description = "Instance type"
  type        = string
  default     = "t3.micro"
}

variable "name" {
  description = "Name tag"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# modules/ec2-instance/outputs.tf
output "instance_id" {
  description = "Instance ID"
  value       = aws_instance.this.id
}

output "private_ip" {
  description = "Private IP address"
  value       = aws_instance.this.private_ip
}
```

**Using Modules:**
```hcl
module "web_server" {
  source = "./modules/ec2-instance"
  
  ami_id        = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  name          = "web-server"
  
  tags = {
    Environment = "production"
    Role        = "web"
  }
}

output "web_server_ip" {
  value = module.web_server.private_ip
}
```

### Advanced Terraform Patterns

**Workspaces:**
```bash
# Create workspace
terraform workspace new production
terraform workspace new staging

# Switch workspace
terraform workspace select production

# In code
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "production" ? "t3.large" : "t3.small"
}
```

**Data Sources:**
```hcl
# Get latest AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get VPC information
data "aws_vpc" "main" {
  tags = {
    Name = "main-vpc"
  }
}
```

**Locals:**
```hcl
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
  
  instance_count = var.environment == "production" ? 3 : 1
}

resource "aws_instance" "web" {
  count = local.instance_count
  
  tags = merge(
    local.common_tags,
    {
      Name = "web-${count.index}"
    }
  )
}
```

**Conditional Resources:**
```hcl
resource "aws_instance" "monitoring" {
  count = var.enable_monitoring ? 1 : 0
  
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
}
```

## Ansible Comprehensive Guide

### Ansible Basics

**Inventory:**
```ini
# inventory.ini
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[webservers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa

[dbservers]
db1 ansible_host=192.168.1.20

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

**Playbook:**
```yaml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  vars:
    nginx_version: "1.24.0"
    app_port: 8080
  
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600
    
    - name: Install nginx
      apt:
        name: nginx
        state: present
    
    - name: Start and enable nginx
      systemd:
        name: nginx
        state: started
        enabled: yes
    
    - name: Configure nginx
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: restart nginx
  
  handlers:
    - name: restart nginx
      systemd:
        name: nginx
        state: restarted
```

### Ansible Roles

**Role Structure:**
```
roles/nginx/
├── tasks/
│   └── main.yml
├── handlers/
│   └── main.yml
├── templates/
│   └── nginx.conf.j2
├── vars/
│   └── main.yml
├── defaults/
│   └── main.yml
└── meta/
    └── main.yml
```

**Using Roles:**
```yaml
---
- name: Configure servers
  hosts: all
  roles:
    - role: nginx
      vars:
        nginx_worker_processes: 4
    - role: app
    - role: monitoring
```

### Ansible Advanced Features

**Conditionals:**
```yaml
- name: Install package
  apt:
    name: "{{ item }}"
    state: present
  loop: "{{ packages }}"
  when: ansible_os_family == "Debian"

- name: Create user
  user:
    name: "{{ username }}"
  when: user_exists is not defined
```

**Loops:**
```yaml
- name: Add users
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    state: present
  loop:
    - { name: 'alice', groups: 'sudo' }
    - { name: 'bob', groups: 'docker' }
```

**Error Handling:**
```yaml
- name: Attempt risky operation
  command: /usr/bin/risky-command
  ignore_errors: yes
  register: result
  failed_when: "'critical' in result.stderr"

- name: Retry with delay
  command: /usr/bin/command
  retries: 3
  delay: 10
  until: result.rc == 0
```

## CloudFormation

### CloudFormation Templates

**Basic Template:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web server stack'

Parameters:
  InstanceType:
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium

Resources:
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c55b159cbfafe1f0
      InstanceType: !Ref InstanceType
      SecurityGroupIds:
        - !Ref WebServerSecurityGroup
      Tags:
        - Key: Name
          Value: WebServer
  
  WebServerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Web server security group
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

Outputs:
  WebServerIP:
    Description: Web server IP address
    Value: !GetAtt WebServer.PublicIp
    Export:
      Name: !Sub '${AWS::StackName}-WebServerIP'
```

**Nested Stacks:**
```yaml
Resources:
  NetworkStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://s3.amazonaws.com/templates/network.yaml
      Parameters:
        VpcCidr: 10.0.0.0/16
```

## Pulumi

**Pulumi with Python:**
```python
import pulumi
import pulumi_aws as aws

# Create VPC
vpc = aws.ec2.Vpc(
    "main-vpc",
    cidr_block="10.0.0.0/16",
    tags={
        "Name": "main-vpc"
    }
)

# Create subnet
subnet = aws.ec2.Subnet(
    "public-subnet",
    vpc_id=vpc.id,
    cidr_block="10.0.1.0/24",
    availability_zone="us-east-1a",
    tags={
        "Name": "public-subnet"
    }
)

# Export outputs
pulumi.export("vpc_id", vpc.id)
pulumi.export("subnet_id", subnet.id)
```

## Comprehensive Interview Questions

### Q1: Explain Terraform state and why it's important

**Answer:**

**What is State:**
- Maps configuration to real-world resources
- Tracks resource metadata
- Enables Terraform to update/delete correct resources

**State File Contents:**
- Resource addresses
- Resource attributes
- Dependencies between resources
- Output values

**State Management:**
- **Local State**: Default, stored in `terraform.tfstate`
- **Remote State**: Stored in backend (S3, Azure Storage, GCS)
- **State Locking**: Prevents concurrent modifications

**Why Important:**
- Without state, Terraform can't track resources
- Enables incremental updates
- Allows resource import
- Supports collaboration

### Q2: How do you handle secrets in Terraform?

**Answer:**

**Method 1: Environment Variables**
```bash
export TF_VAR_db_password="secret"
terraform apply
```

**Method 2: Terraform Cloud/Enterprise**
- Secure variable storage
- Encryption at rest
- Access control

**Method 3: External Secret Management**
```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "db-password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}
```

**Best Practices:**
- Never commit secrets to Git
- Use secret management tools
- Rotate secrets regularly
- Use least privilege

### Q3: Compare Terraform, Ansible, and CloudFormation

**Answer:**

| Feature | Terraform | Ansible | CloudFormation |
|---------|----------|---------|----------------|
| **Type** | Declarative | Imperative | Declarative |
| **Cloud** | Multi-cloud | Multi-cloud | AWS only |
| **State** | Manages state | Stateless | Manages state |
| **Use Case** | Infrastructure | Configuration | AWS infrastructure |
| **Language** | HCL | YAML | YAML/JSON |
| **Learning Curve** | Medium | Easy | Medium |

**When to use:**
- **Terraform**: Multi-cloud, complex infrastructure
- **Ansible**: Configuration management, application deployment
- **CloudFormation**: AWS-only, native AWS integration

### Q4: How do you test Infrastructure as Code?

**Answer:**

**Terraform Testing:**
```bash
# Validate syntax
terraform validate

# Check formatting
terraform fmt -check

# Plan to verify changes
terraform plan

# Use Terratest (Go)
func TestTerraform(t *testing.T) {
    terraformOptions := &terraform.Options{
        TerraformDir: "../examples/",
    }
    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)
}
```

**Ansible Testing:**
```bash
# Syntax check
ansible-playbook --syntax-check playbook.yml

# Dry run
ansible-playbook --check playbook.yml

# Use Molecule
molecule test
```

**Best Practices:**
- Test in non-production first
- Use infrastructure testing tools
- Validate before applying
- Review plans carefully

## Recommended Resources

### Books
- **"Terraform: Up and Running" by Yevgeniy Brikman** - Comprehensive Terraform guide
- **"Ansible for DevOps" by Jeff Geerling** - Complete Ansible reference

### Articles
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)

---

**Previous**: [GitHub Actions & GitLab CI](09-github-actions-gitlab) | **Next**: [AWS Services](11-aws-services)
