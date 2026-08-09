# AGENTS.md — Ask Mode (Documentation/Q&A)

This file provides context for answering questions about this repository.

## Architecture Summary

```
Browser → Nginx (:3000) → /api/* proxied → Spring Boot (:8080) → Neo4j (graph DB)
                        → /api/ws/* WS  → Spring Boot → RabbitMQ STOMP relay (:61613)
                                                       → Redis (session store)
Browser → (direct) → FastAPI chatbot (:8000) → Neo4j (LangChain NL→Cypher)
```

## Non-Obvious Design Decisions

- **Why two auth providers?** The app supports switching between Google OAuth and Firebase auth via a single env var (`AUTH_PROVIDER`) without code changes. Firebase is the default.
- **Why is `baseUrl` empty?** Nginx serves the SPA and proxies `/api/*` to the backend at the same origin — no cross-origin calls in production. The Webpack dev server replicates this proxy.
- **Why is Supabase imported but optional?** Supabase is used for image storage (`supaBucket`) but is not the auth provider. The client is null-initialized when credentials are absent.
- **Why does `useAuth` store `idToken`?** The Google/Firebase ID token is passed as a WebSocket query param (`?token=`) because the WS handshake can't use cookies. Spring's `CustomHandshakeInterceptor` reads it.
- **Why does `User.elementId` act as the principal instead of email?** Neo4j generates `elementId` automatically as a stable node identifier; using it as the Spring Security principal avoids coupling auth to email changes.
- **Why RabbitMQ for WebSocket?** STOMP broker relay allows horizontal scaling — multiple backend instances can route user-specific notifications through RabbitMQ's `/user/queue/notifications` destination.

## Where Things Live

| Concern | Location |
|---|---|
| Auth provider selection | `familytree/.../infrastructure/config/AuthAdapterConfig.java` |
| Auth provider implementations | `familytree/.../infrastructure/adapter/auth/` |
| User identity / access checks | `familytree/.../controller/common/CommonUtils.java` |
| Neo4j relationship constants | `familytree/.../utils/Constants.java` |
| RTK Query API slices | `familyTreeUI/src/redux/queries/` |
| Redux store | `familyTreeUI/src/app/store.ts` |
| WebSocket client | `familyTreeUI/src/redux/notificationService.ts` |
| Auth React context | `familyTreeUI/src/hooks/useAuth.tsx` |
| Supabase client | `familyTreeUI/src/config/supabaseClient.ts` |
| API base URL (empty string) | `familyTreeUI/src/constants/constants.ts` |
