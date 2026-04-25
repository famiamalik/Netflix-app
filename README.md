# 🎬 Netflix App — Automated Multi-Tier Microservices Deployment

> A complete DevSecOps pipeline deploying a Netflix-themed application as two microservices on AWS EC2 using Docker, Terraform, Ansible, Kubernetes, GitHub Actions, and ArgoCD.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Deployment Guide](#deployment-guide)
  - [Step 1: Infrastructure with Terraform](#step-1-infrastructure-with-terraform)
  - [Step 2: Configuration with Ansible](#step-2-configuration-with-ansible)
  - [Step 3: CI Pipeline with GitHub Actions](#step-3-ci-pipeline-with-github-actions)
  - [Step 4: CD with ArgoCD](#step-4-cd-with-argocd)
  - [Step 5: Access the Application](#step-5-access-the-application)
- [CI/CD Flow](#cicd-flow)
- [Kubernetes Manifests](#kubernetes-manifests)

---

## Overview

This project deploys a Netflix-themed application using a full DevSecOps toolchain. The application is split into two clearly separated microservices:

- **Frontend**: A React-based Netflix UI served via Nginx
- **Backend**: A Node.js/Express API that proxies TMDB (The Movie Database) API calls server-side

The entire deployment is automated, from infrastructure provisioning to container orchestration and continuous delivery.

---

## Architecture

```
User
 │
 ▼
┌─────────────────────────────────────────┐
│           AWS EC2 Instance              │
│         (Provisioned by Terraform)      │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │     Kubernetes (microk8s)        │   │
│  │                                  │   │
│  │  ┌────────────┐  ┌────────────┐  │   │
│  │  │  Frontend  │  │  Backend   │  │   │
│  │  │  (React +  │→ │ (Node.js + │  │   │
│  │  │   Nginx)   │  │  Express)  │  │   │
│  │  │  Port: 80  │  │ Port: 5000 │  │   │
│  │  └────────────┘  └────────────┘  │   │
│  │         │               │        │   │
│  │    NodePort          ClusterIP   │   │
│  │    (30007)           (internal)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         ▼
    TMDB API (external)
```

### Microservices Breakdown

| Tier              | Service          | Technology        | Port | Access                    |
| ----------------- | ---------------- | ----------------- | ---- | ------------------------- |
| Tier 1 — Frontend | Netflix React UI | React + Nginx     | 80   | NodePort 30007 (external) |
| Tier 2 — Backend  | TMDB API Proxy   | Node.js + Express | 5000 | ClusterIP (internal only) |

---

## Tech Stack

| Tool                      | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| **Docker**                | Containerize frontend and backend microservices        |
| **Terraform**             | Provision AWS EC2, VPC, and Security Groups            |
| **Ansible**               | Configure EC2 and install Kubernetes (microk8s)        |
| **Kubernetes (microk8s)** | Orchestrate and manage containers                      |
| **GitHub Actions**        | CI pipeline — build, push images, update manifests     |
| **ArgoCD**                | CD pipeline — sync K8s cluster with repo automatically |
| **DockerHub**             | Store and distribute Docker images                     |
| **TMDB API**              | Movie and TV show data source                          |

---

## Repository Structure

```
netflix-app/
├── frontend/                      # Tier 1 — React Netflix UI
│   ├── src/                       # React source code
│   ├── public/                    # Static assets
│   ├── index.html                 # App entry point
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.ts             # Vite configuration
│   └── Dockerfile                 # Multi-stage Docker build
│
├── backend/                       # Tier 2 — Node.js TMDB Proxy
│   ├── index.js                   # Express server
│   ├── package.json               # Backend dependencies
│   └── Dockerfile                 # Node.js Docker build
│
├── k8s/                           # Kubernetes Manifests
│   ├── frontend-deployment.yaml   # Frontend deployment
│   ├── frontend-service.yaml      # Frontend NodePort service
│   ├── backend-deployment.yaml    # Backend deployment
│   └── backend-service.yaml      # Backend ClusterIP service
│
├── argocd/                        # ArgoCD Configuration
│   └── application.yaml           # ArgoCD app sync config
│
├── terraform/                     # AWS Infrastructure as Code
│   ├── main.tf                    # EC2, VPC, Security Groups
│   ├── variables.tf               # Input variables
│   └── outputs.tf                 # Output values
│
├── ansible/                       # Configuration Management
│   ├── playbook.yml               # EC2 setup + microk8s install
│   └── inventory.ini              # EC2 host details
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
│
└── README.md                      # This file
```

---

## Prerequisites

Before deploying, make sure you have:

- AWS account with IAM credentials (Access Key + Secret Key)
- GitHub account with repository access
- DockerHub account
- TMDB API key (get one free at [themoviedb.org](https://www.themoviedb.org/settings/api))
- Terraform installed locally
- Ansible installed locally
- Git installed locally

---

## Deployment Guide

### Step 1: Infrastructure with Terraform

Provision the AWS EC2 instance, VPC, and Security Groups:

```bash
cd terraform
terraform init
terraform apply
```

This creates:

- EC2 instance (Ubuntu 22.04, t2.large)
- VPC with public subnet
- Security Group with ports: 22, 80, 5000, 30000-32767

Note the **EC2 public IP** from the output — you'll need it next.

---

### Step 2: Configuration with Ansible

Update the inventory file with your EC2 IP:

```ini
# ansible/inventory.ini
[netflix_server]
<YOUR_EC2_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem
```

Then run the playbook to configure the server:

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

This installs:

- Docker
- microk8s (Kubernetes)
- ArgoCD

---

### Step 3: CI Pipeline with GitHub Actions

The CI pipeline runs **automatically** on every push to `main`.

| Secret               | Value                         |
| -------------------- | ----------------------------- |
| `DOCKERHUB_USERNAME` | Your DockerHub username       |
| `DOCKERHUB_TOKEN`    | Your DockerHub password/token |
| `TMDB_API_KEY`       | Your TMDB API key             |

The pipeline will:

1. Build the frontend Docker image
2. Build the backend Docker image
3. Push both images to DockerHub
4. Update K8s manifests with new image tags
5. Commit updated manifests back to the repo

---

### Step 4: CD with ArgoCD

Apply the ArgoCD application config on your EC2 instance:

```bash
microk8s kubectl apply -f argocd/application.yaml
```

Create the TMDB secret on the cluster:

```bash
microk8s kubectl create secret generic tmdb-secret \
  --from-literal=api-key=<YOUR_TMDB_API_KEY>
```

Get the ArgoCD admin password:

```bash
microk8s kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

ArgoCD will now **automatically sync** the cluster whenever the repo is updated.

---

### Step 5: Access the Application

Once everything is deployed, open your browser and go to:

```
http://<EC2-PUBLIC-IP>:30007
```

The Netflix app should be fully running!

---

## 🔄 CI/CD Flow

```
Developer pushes code to GitHub
            │
            ▼
   GitHub Actions triggers
            │
            ▼
   Builds Frontend Docker image
   Builds Backend Docker image
            │
            ▼
   Pushes both images to DockerHub
            │
            ▼
   Updates image tags in k8s/ manifests
   Commits changes back to repo
            │
            ▼
   ArgoCD detects repo changes
            │
            ▼
   ArgoCD syncs Kubernetes cluster
            │
            ▼
   New containers deployed automatically ✅
```

---

## ☸️ Kubernetes Manifests

| File                       | Type                | Description                             |
| -------------------------- | ------------------- | --------------------------------------- |
| `frontend-deployment.yaml` | Deployment          | Runs 1 replica of frontend container    |
| `frontend-service.yaml`    | Service (NodePort)  | Exposes frontend on port 30007          |
| `backend-deployment.yaml`  | Deployment          | Runs 1 replica of backend container     |
| `backend-service.yaml`     | Service (ClusterIP) | Internal access to backend on port 5000 |

---

_Project 3 — Automated Multi-Tier Application Deployment_
_Stack: Docker · Terraform · Ansible · Kubernetes · GitHub Actions · ArgoCD_
