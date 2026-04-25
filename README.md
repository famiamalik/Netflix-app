# Netflix App - Multi-Tier Microservices Deployment

## Overview

This project deploys a Netflix-themed application as two microservices on AWS EC2 using a complete DevSecOps pipeline.

## Architecture

- **Frontend**: React app served via Nginx (Port 80)
- **Backend**: Node.js/Express TMDB API proxy (Port 5000)

## Tech Stack

| Tool                  | Purpose                 |
| --------------------- | ----------------------- |
| Docker                | Containerization        |
| Terraform             | AWS Infrastructure      |
| Ansible               | EC2 Configuration       |
| Kubernetes (microk8s) | Container Orchestration |
| GitHub Actions        | CI Pipeline             |
| ArgoCD                | CD / GitOps             |

## Repository Structure

netflix-app/
├── frontend/ # React Netflix app
├── backend/ # Node.js TMDB proxy API
├── k8s/ # Kubernetes manifests
├── argocd/ # ArgoCD config
├── terraform/ # AWS infrastructure (Person 1)
├── ansible/ # EC2 configuration (Person 1)
└── .github/workflows/ # GitHub Actions CI

## Deployment Steps

### 1. Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

### 2. Configuration

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

### 3. CI Pipeline

- Push to main branch triggers GitHub Actions
- Builds and pushes Docker images to DockerHub
- Updates K8s manifests with new image tags

### 4. CD with ArgoCD

```bash
kubectl apply -f argocd/application.yaml
```

### 5. Access the App
