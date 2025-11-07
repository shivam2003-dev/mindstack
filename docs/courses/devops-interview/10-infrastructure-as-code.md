# Infrastructure as Code

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Terraform</li>
    <li>Learn Ansible automation</li>
    <li>Understand CloudFormation</li>
    <li>Know IaC best practices</li>
  </ul>
</div>

Infrastructure as Code (IaC) manages infrastructure through code. This chapter covers Terraform, Ansible, and CloudFormation.

!!! tip "Interview Focus"
    Understand declarative vs imperative, state management, and infrastructure lifecycle.

## Terraform

### Basic Example

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
  }
}
```

### Terraform Commands

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

## Ansible

### Playbook Example

```yaml
- hosts: webservers
  become: yes
  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
    
    - name: Start nginx
      systemd:
        name: nginx
        state: started
        enabled: yes
```

## Benefits

- Version control
- Reproducibility
- Consistency
- Automation
- Documentation

---

**Previous**: [GitHub Actions & GitLab CI](09-github-actions-gitlab) | **Next**: [AWS Services](11-aws-services)

