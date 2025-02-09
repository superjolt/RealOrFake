# Discord Bot Deployment Instructions

## Prerequisites
1. Install Docker
```bash
sudo apt update
sudo apt install docker.io
sudo systemctl enable --now docker
```

2. Install kubectl and Minikube
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Deployment Steps

1. Build Docker image
```bash
docker build -t discord-bot:latest .
```

2. Start Minikube
```bash
minikube start
```

3. Create base64 encoded secrets
```bash
echo -n "your-discord-token" | base64
echo -n "your-client-id" | base64
```

4. Update k8s/secret.yaml with your base64 encoded values

5. Apply Kubernetes configurations
```bash
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
```

6. Verify deployment
```bash
kubectl get pods
kubectl logs -f deployment/discord-bot
```

Your Discord bot should now be running 24/7 in a Kubernetes cluster!

## Maintenance

- To update the bot: Build a new Docker image and restart the deployment
- To check logs: `kubectl logs -f deployment/discord-bot`
- To restart: `kubectl rollout restart deployment discord-bot`
