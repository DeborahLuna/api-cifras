terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  # As credenciais são lidas automaticamente das variáveis de ambiente:
  # AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
}
