variable "aws_region" {
  description = "Região AWS onde os recursos serão provisionados"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto — usado como prefixo nos recursos"
  type        = string
  default     = "api-cifras"
}

variable "environment" {
  description = "Ambiente de deploy (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Bloco CIDR da subnet pública"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Zona de disponibilidade para a subnet"
  type        = string
  default     = "us-east-1a"
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "ID da AMI Ubuntu 22.04 LTS (varia por região)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS - us-east-1
}

variable "allowed_ssh_cidr" {
  description = "CIDR permitido para acesso SSH (use o seu IP público)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_port" {
  description = "Porta em que a aplicação Node.js irá escutar"
  type        = number
  default     = 3000
}

variable "key_pair_name" {
  description = "Nome da chave SSH existente na AWS"
  type        = string
}
