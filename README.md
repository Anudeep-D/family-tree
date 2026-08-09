# 👨‍👩‍👧‍👦 Family Tree App

A full-stack Family Tree web application for building, visualising, and collaborating on family trees.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.4 · Java 17 · Gradle |
| Database | Neo4j 5.26 (graph database) |
| Session store | Redis 7.2 |
| Messaging | RabbitMQ 3 (STOMP broker relay for WebSocket) |
| Frontend | React 18 · TypeScript · Webpack · MUI · React Flow |
| Chatbot | FastAPI · LangChain · Groq (llama3-70b) |
| Serving | Nginx (SPA + API reverse proxy) |
| Containers | Podman / podman-compose |

---

## Features

- Build family trees with persons, partners, and parent-child relationships
- Visualise the tree as an interactive graph (React Flow + dagre auto-layout)
- Invite collaborators with role-based access: **Admin**, **Editor**, **Viewer**
- Real-time notifications via WebSocket (SockJS + STOMP)
- AI chatbot — ask natural-language questions about your family tree
- Pluggable authentication: **Firebase** (default) or **Google OAuth**
- Image uploads via Supabase Storage (optional)

---

## Roles

| Role | Permissions |
|---|---|
| **Admin** | Full access — manage members, relationships, and invite/manage users |
| **Editor** | Add and edit members and relationships; cannot manage user roles |
| **Viewer** | Read-only access to the tree |

---

## Prerequisites

- [Podman](https://podman.io/) and `podman-compose` — for containerised setup
- Java 17 and Gradle — for running the backend locally
- Node.js 22.14.0 (see `familyTreeUI/.nvmrc`) — for running the frontend locally
- Python 3.11 — for running the chatbot locally
- A Neo4j instance (local or remote)
- A Firebase project **or** a Google OAuth client ID (depending on chosen auth provider)
- A [Groq API key](https://console.groq.com/) for the chatbot

---

## Quick Start — Containerised (Recommended)

### 1. Configure environment

```bash
cp .example.env .env
```

Edit `.env` and fill in required values:

```dotenv
# Auth provider — choose one: FIREBASE or GOOGLE
AUTH_PROVIDER=FIREBASE

# Firebase (required when AUTH_PROVIDER=FIREBASE)
FIREBASE_PROJECT_ID=your_project_id

# Google OAuth (required when AUTH_PROVIDER=GOOGLE, and always needed by the backend)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Security
JWT_SECRET=your_long_random_secret

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# Redis
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
REDIS_SESSION_TTL=3600

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Ports
SPRING_PORT=8080
FRONTEND_PORT=3000
```

Also copy `familyTreeUI/.env.example` → `familyTreeUI/.env` for frontend-specific vars (Firebase client SDK keys, etc.).

### 2. Build and run

```bash
# Recommended: build frontend first, then start all containers
python3 buildAndRun.py

# Or manually
cd familyTreeUI && npm install && npm run build && cd ..
podman-compose up --build -d
```

### 3. Open the app

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Neo4j Browser | http://localhost:7474 |
| RabbitMQ Management | http://localhost:15672 |
| Chatbot API | http://localhost:8000 |

---

## Quick Start — Local Development (Without Containers)

### Backend

```bash
cd familytree
cp .env.example .env   # fill in values
./gradlew bootRun
```

Requires a running Neo4j, Redis, and RabbitMQ instance (or run only those via `podman-compose up neo4j redis rabbitmq -d`).

### Frontend

```bash
cd familyTreeUI
cp .env.example .env   # fill in VITE_* vars
nvm use                # sets Node 22.14.0
npm install
npm run dev            # Webpack dev server on :3000, proxies /api/* → :8080
```

### Chatbot

```bash
cd chatbot
cp .env.example .env   # fill in NEO4J_* and GROQ_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Authentication

The app supports two auth providers, switched via the `AUTH_PROVIDER` env var — **no code changes needed**.

| Value | How it works |
|---|---|
| `FIREBASE` (default) | Frontend uses Firebase SDK to sign in; backend verifies ID tokens via Firebase Admin SDK |
| `GOOGLE` | Frontend uses Google One Tap / OAuth; backend verifies ID tokens via Google API client |

Both providers go through a unified `AuthProviderPort` interface in the backend, so the rest of the application is provider-agnostic.

---

## Project Structure

```
family-tree/
├── familytree/          # Spring Boot backend (Java 17, Gradle)
│   └── src/main/java/dev/anudeep/familytree/
│       ├── config/      # Security, CORS, WebSocket, RabbitMQ, Redis config
│       ├── controller/  # REST controllers
│       ├── service/     # Business logic
│       ├── model/       # Neo4j node models
│       ├── repository/  # Spring Data Neo4j repositories
│       ├── dto/         # Data transfer objects
│       ├── domain/      # Port/adapter interfaces (auth)
│       └── infrastructure/  # Auth adapter implementations (Firebase / Google)
├── familyTreeUI/        # React + TypeScript frontend (Webpack)
│   └── src/
│       ├── app/         # Redux store
│       ├── components/  # UI components
│       ├── hooks/       # useAuth and other custom hooks
│       ├── redux/       # RTK Query API slices + notification service
│       ├── routes/      # React Router route definitions
│       ├── services/    # Non-Redux service utilities
│       ├── styles/      # Global SCSS
│       └── types/       # TypeScript type definitions
├── chatbot/             # FastAPI AI chatbot (Python 3.11)
├── nginx/               # Nginx config (SPA serving + API proxy)
├── rabbitmq/            # RabbitMQ plugin config
├── .example.env         # Root environment variable template
└── podman-compose.yml   # Full stack container orchestration
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `AUTH_PROVIDER` | Yes | `FIREBASE` or `GOOGLE` |
| `FIREBASE_PROJECT_ID` | When `AUTH_PROVIDER=FIREBASE` | Firebase project ID |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `JWT_SECRET` | Yes | Secret for signing session tokens |
| `NEO4J_URI` | Yes | Neo4j Bolt URI (e.g. `bolt://neo4j:7687`) |
| `NEO4J_USERNAME` | Yes | Neo4j username |
| `NEO4J_PASSWORD` | Yes | Neo4j password |
| `SPRING_REDIS_HOST` | Yes | Redis hostname |
| `SPRING_REDIS_PORT` | Yes | Redis port (default `6379`) |
| `REDIS_SESSION_TTL` | Yes | Session timeout in seconds |
| `RABBITMQ_USER` | Yes | RabbitMQ username |
| `RABBITMQ_PASSWORD` | Yes | RabbitMQ password |
| `SPRING_PORT` | Yes | Backend port (default `8080`) |
| `FRONTEND_PORT` | Yes | Frontend port exposed by Nginx (default `3000`) |
| `NEO4J_DATABASE` | No | Neo4j database name (default `neo4j`) — chatbot only |
| `GROQ_KEY` | Yes (chatbot) | Groq API key for the AI chatbot |
| `SUPABASE_URL` | No | Supabase project URL — enables image uploads |
| `SUPABASE_KEY` | No | Supabase anon key |
| `SUPABASE_BUCKET` | No | Supabase storage bucket name |

---

## Development Notes

- **Webpack is the active bundler**, not Vite. Use `npm run dev` / `npm run build`. The `vite:*` scripts are unused.
- **Frontend path aliases**: `@/` → `src/`, `@styles/` → `src/styles/`, `@routes/` → `src/routes/`, `@types/` → `src/types/`
- **Supabase is optional** — the client is `null` when `SUPABASE_URL`/`SUPABASE_KEY` are not set. Image upload features require it.
- **API proxy**: the frontend `baseUrl` is intentionally empty. Nginx proxies all `/api/*` requests to the backend in production; the Webpack dev server does the same locally via its proxy config.
- Logs from the backend are written to `familytree/logs/app.log` and stdout.
- Swagger UI is available at `/swagger-ui.html` (unauthenticated).
