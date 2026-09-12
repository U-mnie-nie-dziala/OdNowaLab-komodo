terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    key    = "terraform.tfstate"
    region = "eu-central-1"
  }
}



provider "aws" {
  region = "eu-central-1"
}

# Pobranie najnowszego darmowego obrazu Ubuntu
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

variable "public_ssh_key" {
  description = "Publiczny klucz SSH do maszyny EC2"
  type        = string
}

# Użycie zmiennej zamiast wklejania klucza
resource "aws_key_pair" "deployer_key" {
  key_name   = "hackathon-deploy-key"
  public_key = var.public_ssh_key
}

# Zapora sieciowa przepuszczająca ruch HTTP (80) i SSH (22)
resource "aws_security_group" "hackathon_sg" {
  name        = "hackathon-web-sg"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Konfiguracja serwera EC2
resource "aws_instance" "hackathon_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium" # Uciągnie kompilację Javy i Reacta

  # Podpięcie klucza SSH i zapory
  key_name               = aws_key_pair.deployer_key.key_name
  vpc_security_group_ids = [aws_security_group.hackathon_sg.id]

  # Skrypt startowy instalujący Dockera i Gita
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y ca-certificates curl git
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
              chmod a+r /etc/apt/keyrings/docker.asc
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              usermod -aG docker ubuntu
              systemctl enable docker
              systemctl start docker
              EOF

  tags = {
    Name = "Hackathon-Monorepo-Server"
  }
}

# Wyświetla IP po zakończeniu działania Terraforma
output "public_ip" {
  description = "Publiczny adres IP serwera"
  value       = aws_instance.hackathon_server.public_ip
}