# Terraform Infrastructure

Infrastructure as Code using Terraform.

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials

## Usage

### Initialize Terraform

```bash
terraform init
```

### Plan changes

```bash
terraform plan
```

### Apply changes

```bash
terraform apply
```

### Destroy infrastructure

```bash
terraform destroy
```

## Configuration

### Backend

Configure the S3 backend in `main.tf` for remote state storage:

```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "monorepo/terraform.tfstate"
  region = "us-east-1"
}
```

### Variables

Create a `terraform.tfvars` file:

```hcl
aws_region   = "us-east-1"
environment  = "development"
project_name = "monorepo"
```

## Structure

- `main.tf`: Main Terraform configuration
- Add additional `.tf` files for specific resources (networking, compute, etc.)
