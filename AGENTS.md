# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

Polyglot monorepo: Spring Boot backend + React/TypeScript frontend + Python chatbot, all containerized via Podman Compose. Each service has its own subdirectory (`familytree/`, `familyTreeUI/`, `chatbot/`).

## Quick Start (Full Stack)

```bash
# Build frontend + restart all containers (preferred workflow)
python3 buildAndRun.py

# Or manually
cd familyTreeUI && npm run build   # Webpack build (NOT vite:build) — writes to dist/
podman-compose down && podman-compose up --build -d
```

## Env Setup

- Root-level `.env` is consumed by both backend (via `env_file:` in compose) and frontend Webpack build (loaded as `process.env.*`)
- `familyTreeUI/.env` provides `VITE_*` vars shimmed as `import.meta.env.*` via Webpack `DefinePlugin`
- Two separate `.env.example` files: `/.example.env` (root) and `familyTreeUI/.env.example`
- Auth provider is switched via `AUTH_PROVIDER=FIREBASE|GOOGLE` in root `.env`

## Backend — `familytree/` (Spring Boot 3 / Java 17 / Gradle)

**Commands** (run from `familytree/`):
```bash
./gradlew bootRun          # Run locally (requires Neo4j, Redis, RabbitMQ running)
./gradlew test             # All tests
./gradlew test --tests "dev.anudeep.familytree.SomeTest"  # Single test
./gradlew bootJar          # Build fat JAR
```

**Key patterns:**
- **Auth is pluggable via `AuthProviderPort`** — `auth.provider=FIREBASE` (default) or `GOOGLE` selects the adapter at startup via `AuthAdapterConfig`. Both adapters are always instantiated; `@Primary` `@Bean` selects the active one.
- **Security principal is `User.elementId` (Neo4j internal element ID, not email)**. All controllers call `CommonUtils.getCurrentAuthenticatedUser()` → resolves `elementId` from `SecurityContext` → looks up `UserRepository`.
- **Session is HTTP session stored in Redis** (`spring-session-data-redis`). Auth endpoints (`/api/auth/**`) are CSRF-exempt. All other endpoints require session.
- **WebSocket uses SockJS + STOMP broker relay to RabbitMQ** on STOMP port 61613. Exchange: `tree_events_exchange`, routing key pattern `tree.#`, queue: `tree_event_queue`.
- **`/api/auth/**` and `/api/ws/**` are the only public (unauthenticated) endpoints.** Swagger UI also public.
- Lombok is used everywhere — `@Getter`, `@Setter`, `@Slf4j`, `@RequiredArgsConstructor` preferred. Constructor injection over `@Autowired`.
- Neo4j models use `@Node`, `@Id` on `elementId`. Relationship types defined as constants in `Constants.java` (`ADMIN_FOR`, `EDITOR_FOR`, `VIEWER_FOR`, `PARENT_OF`, `MARRIED_TO`, `BELONGS_TO`, `PART_OF`).
- Tree-level roles: `ADMIN`, `EDITOR`, `VIEWER`. All protected endpoints call `commonUtils.accessCheck(treeId, roles)`.
- Logs go to `logs/app.log` as well as stdout.

**There is only one test file** (`FamilytreeApplicationTests.java` — context load only). Unit tests do not currently exist.

## Frontend — `familyTreeUI/` (React 18 / TypeScript / Webpack)

**Commands** (run from `familyTreeUI/`):
```bash
npm run dev          # Webpack dev server on :3000, proxies /api → backend :8080
npm run build        # Webpack production build → dist/
npm run lint         # ESLint (max-warnings 0 — zero warnings allowed)
```

> `vite:start` / `vite:build` scripts exist but are **not used** — Webpack is the active bundler. Babel transpiles TS/TSX (not tsc), so type errors don't block builds. Run `tsc --noEmit` separately for type checking.

**Path aliases** (both webpack and tsconfig): `@/` → `src/`, `@styles/` → `src/styles/`, `@types/` → `src/types/`, `@routes/` → `src/routes/`

**Key patterns:**
- All API calls go through RTK Query endpoints in `src/redux/queries/`. `baseUrl` in `constants.ts` is deliberately empty string — nginx proxies `/api/*` to backend in production; Webpack devServer proxy handles it locally.
- `useAuth` hook exposes `idToken` (Google/Firebase ID token) from session — this is passed to WebSocket connection as query param `?token=`.
- `supabase` client in `src/config/supabaseClient.ts` is **optional** and may be `null` — always guard with `if (supabase)` before calling Supabase methods.
- WebSocket connection via `notificationService` (SockJS → STOMP) subscribes to `/user/queue/notifications`. Reads `XSRF-TOKEN` cookie for CSRF header. Init via `initNotificationService(store)` before calling `connect()`.
- Node version is pinned to 22.14.0 (`.nvmrc`). Use `nvm use` before installing.
- SCSS module files must use `.module.scss` extension; global SCSS uses `.scss`. CSS Modules enabled for `.module.scss` only.

## Chatbot — `chatbot/` (Python / FastAPI / LangChain)

```bash
uvicorn main:app --reload --port 8000   # Local dev
pip install -r requirements.txt          # Deps (pinned versions)
```

- Uses `langchain-neo4j` `GraphCypherQAChain` with Groq LLM (`llama3-70b-8192`). Chain is lazily initialized on first request and cached as module-level singleton.
- Reads Neo4j and Groq config from env (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`, `GROQ_KEY`).
- Single endpoint: `POST /api/chat` with `{"message": "..."}`.

## Infrastructure

| Service | Port | Notes |
|---|---|---|
| Frontend (nginx) | `$FRONTEND_PORT` (default 3000) | Serves React SPA + proxies `/api/*` and `/api/ws/*` |
| Backend (Spring) | `$SPRING_PORT` (default 8080) | REST + WebSocket |
| Chatbot (FastAPI) | 8000 | Internal only, not proxied through nginx |
| Neo4j | 7474 (browser), 7687 (bolt) | |
| Redis | 6379 | Session store |
| RabbitMQ | 5672 (AMQP), 15672 (mgmt UI), 61613 (STOMP) | |

- RabbitMQ STOMP plugin must be enabled — `rabbitmq/enabled_plugins` is mounted read-only.
- Backend container name is `familytree-backend`, Redis is `familytree-redis` — used as hostnames within the `backendnet` bridge network.
- Backend Dockerfile uses `registry.access.redhat.com/ubi8/openjdk-17` (runs as UID 185 `jboss`). Chatbot uses `registry.access.redhat.com/ubi9/python-311` (UID 1001).
