# AGENTS.md — Agent Mode (Coding)

This file provides guidance to agents when writing code in this repository.

## Auth Provider Pattern (Non-Obvious)
- Auth is switched via `auth.provider=FIREBASE|GOOGLE` env var — **both adapters are always Spring beans**; `AuthAdapterConfig` selects the `@Primary` one. Adding a new provider means: (1) implement `AuthProviderPort`, (2) register as `@Component`, (3) wire in `AuthAdapterConfig`.
- **Never call `UserService.processGoogleToken()` thinking it's Google-only** — it's a backward-compat alias for `processToken()` which uses whichever provider is active.

## Security Principal Identity
- The Spring Security principal is `User.elementId` (Neo4j internal ID), **not** the email. All `SecurityContext` principal reads return an `elementId` string, which must then be resolved to a `User` via `UserTreeService.getUserByElementId()`.
- Always call `CommonUtils.accessCheck(treeId, roles)` in protected controller methods — it performs both authentication check and tree-level RBAC in one call.

## WebSocket
- WebSocket endpoint is `/api/ws` (SockJS+STOMP). It's explicitly `permitAll()` in `SecurityConfig` — the `CustomHandshakeInterceptor` extracts the `?token=` query param and sets `elementId` in handshake attributes. The `DefaultHandshakeHandler` creates a `PreAuthenticatedAuthenticationToken` from that `elementId`.
- RabbitMQ STOMP relay port is `61613` (not the default AMQP 5672). Set via `spring.rabbitmq.stomp-port`.

## Frontend API Calls
- `baseUrl` in `constants.ts` is **empty string** intentionally — never add a hostname there. Nginx proxies `/api/*` in production; webpack dev server proxies `/api/*` to `process.env.BACKEND_TARGET_URL` (defaults to `localhost:8080`).
- All API slices use `credentials: "include"` for cookie-based sessions. Do not use Authorization header for REST calls — session cookie handles auth.

## Webpack vs Vite
- **Active bundler is Webpack** (`npm run dev` / `npm run build`). The `vite:*` scripts exist but are unused. TypeScript is transpiled by Babel (not tsc), so type errors won't fail a Webpack build — run `npx tsc --noEmit` separately.

## Neo4j Model Conventions
- Relationship type strings come exclusively from `Constants.java` (`ADMIN_FOR`, `EDITOR_FOR`, `VIEWER_FOR`, `PARENT_OF`, `MARRIED_TO`, `BELONGS_TO`, `PART_OF`). Always reference the constant, never inline the string.
- `User.elementId` is the `@Id` — Neo4j sets it. Never set it manually; it's null until the node is saved.

## Supabase is Optional
- `supabase` exported from `src/config/supabaseClient.ts` may be `null` (when env vars are missing). Always guard: `if (supabase) { ... }`.

## SCSS
- Component-scoped styles: `.module.scss` (CSS Modules enabled). Global styles: `.scss`. Never use `.css` for new styles.

## Building / Testing
```bash
# Backend single test
cd familytree && ./gradlew test --tests "dev.anudeep.familytree.FQCN.ClassName.methodName"

# Frontend type-check (separate from build)
cd familyTreeUI && npx tsc --noEmit

# Full rebuild and restart
python3 buildAndRun.py
```
