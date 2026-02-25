# NovaSaaS Customer Success AI Agent

An autonomous AI agent system for handling customer interactions across Gmail, WhatsApp, and Web Forms.

## 🏗 Architecture

```text
                                  +------------------+
                                  |  Next.js Admin   |
                                  |    Dashboard     |
                                  +--------+---------+
                                           |
                                           v
+----------+      +----------+      +------+-------+      +------------+
|  Gmail   +----->+  Kafka   +----->+    Worker    +----->+  Postgres  |
+----------+      |  Topics  |      | (AI Agent)   |      | (pgvector) |
| WhatsApp +----->+          |      +------+-------+      +------------+
+----------+      |          |             ^
| Web Form +----->+          |             |
+----------+      +----------+      +------+-------+
                                    |  Gemini API  |
                                    +--------------+
```

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Docker & Docker Compose
- Gemini API Key

### 2. Setup Environment
Copy the example environment file and add your keys:
```bash
cp .env.example .env
```

### 3. Run the Stack
```bash
docker-compose up --build
```
- **Dashboard:** http://localhost:3000
- **Support Portal:** http://localhost:3000/support
- **API Docs:** http://localhost:8000/docs

## 📩 Channel Testing

### Web Form
Visit `http://localhost:3000/support` and submit a request. The backend will publish to Kafka, and the worker will process it using the AI Agent.

### WhatsApp (Twilio)
1. Setup a Twilio WhatsApp Sandbox.
2. Use `ngrok http 8000` to expose your local backend.
3. Set the Twilio Sandbox webhook to `https://your-ngrok-url/api/whatsapp/webhook`.

### Gmail
1. Create a Google Cloud Project with Gmail API enabled.
2. Configure OAuth2 and obtain a refresh token.
3. Configure Gmail Push Notifications (Pub/Sub) to point to your backend.

## 🧪 Testing

### Run All Tests
```bash
pip install pytest pytest-asyncio httpx
pytest
```

## ☸️ Kubernetes Deployment

```bash
kubectl apply -f k8s/namespace.yaml
# Edit k8s/secrets.yaml with your base64 encoded keys
kubectl apply -f k8s/
```
The system includes HPA (3 to 20 replicas) and Nginx Ingress with TLS.

---
**NovaSaaS** - Empowering teams through AI-driven support.
