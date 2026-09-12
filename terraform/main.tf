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

resource "aws_sns_sms_preferences" "sms_settings" {
  default_sender_id = "Hackathon"
  default_sms_type  = "Promotional" # Zmienione na typ promocyjny
}

# Pula użytkowników (baza kont)
resource "aws_cognito_user_pool" "app_pool" {
  name = "hackathon-user-pool"

  # Logowanie za pomocą adresu e-mail
  alias_attributes = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

# Klient dla aplikacji frontendowej (React)
resource "aws_cognito_user_pool_client" "app_client" {
  name         = "hackathon-react-client"
  user_pool_id = aws_cognito_user_pool.app_pool.id

  # Wyłączamy generowanie tzw. Client Secret, ponieważ aplikacje typu SPA (React)
  # nie są w stanie go bezpiecznie przechowywać
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

# Wyplucie ID potrzebnych do konfiguracji frontendu i backendu
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.app_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app_client.id
}