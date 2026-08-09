# AGENTS.md — Plan Mode (Architecture/Design)

This file provides architectural constraints for planning work in this repository.

## Architectural Constraints

### Auth
- Both `FirebaseAuthProviderAdapter` and `GoogleAuthProviderAdapter` are **always instantiated as Spring beans** regardless of which is active. Designing a new auth provider requires implementing `AuthProviderPort` — the port/adapter boundary is already established.
- The `auth.provider` env var selects the active adapter at startup only (not runtime). There is no runtime switching.

### Identity Flow (Non-Obvious Coupling)
- Login stores `elementId` (Neo4j node ID) as Spring Security principal — this ID is only available **after** the user is saved to Neo4j. The auth flow is: verify token → extract email → find/create Neo4j User node → store `elementId` as principal. Any redesign must preserve this order.
- WebSocket principal is also `elementId` — set during handshake from `?token=` query param, not from Spring Security session. These are two separate auth paths that must stay consistent.

### Session Architecture
- HTTP sessions are stored in Redis (`spring-session-data-redis`). The `idToken` (raw Google/Firebase token) is stored as a session attribute alongside the `SecurityContext`. Both are needed: `SecurityContext` for REST auth, `idToken` for WebSocket auth.
- Session timeout is controlled by `REDIS_SESSION_TTL` env var (default not set — must be provided).

### RabbitMQ / WebSocket
- Backend uses **STOMP broker relay** (not in-memory broker) — RabbitMQ must have the STOMP plugin enabled. The relay port is `61613`, separate from AMQP `5672`. Any deployment must ensure `rabbitmq/enabled_plugins` mounts correctly.
- User-specific notifications route via `/user/queue/notifications` using STOMP user destinations. The user destination prefix is `/user`; `elementId` is the STOMP principal name.

### Frontend State
- RTK Query manages all server state. There is no separate data-fetching library. Adding a new API domain requires a new file in `src/redux/queries/` and registering it in `src/app/store.ts`.
- `useAuth` context is the single source of truth for auth state. It holds `isAuthenticated`, `user`, and `idToken` — consuming components must not derive auth state from other sources.

### Supabase Constraint
- Supabase is storage-only (image bucket). It is **not** the auth system. The client may be null. Do not make auth-critical logic depend on Supabase being initialized.

### Build System Constraint
- Frontend has two bundler configs (Vite + Webpack) but **only Webpack is wired to `npm run dev` / `npm run build`**. Any new env variables must be added to both `webpack.config.mjs` `DefinePlugin` and `.env.example`. Vite config (`vite.config.ts`) is not used in practice.

### Neo4j Graph Model
- Tree access is modeled as Neo4j relationships (`ADMIN_FOR`, `EDITOR_FOR`, `VIEWER_FOR`) between `User` and `Tree` nodes. There is no separate permissions table. Role checks query the graph at request time via `UserTreeService.getRelationshipType()`.
