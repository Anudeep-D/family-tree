---
name: architecture-sync
description: >-
  Use this skill whenever making or reviewing architectural, structural, infrastructural, database schema, or API changes in the family-tree repository to inspect, cross-reference, and update ARCHITECTURE.md.
---

# Architecture Sync Skill

This skill enforces continuous documentation alignment between code changes and [ARCHITECTURE.md](../../../ARCHITECTURE.md). Whenever system architecture evolves, this runbook guides the agent in identifying impact areas and updating the architectural specification.

---

## 1. Trigger Conditions

Activate and execute this workflow whenever changes involve any of the following:

| Change Category | Examples | Sections to Update in `ARCHITECTURE.md` |
|---|---|---|
| **API Endpoints** | New controller, added `@GetMapping` / `@PostMapping`, route changes, modified request/response DTOs | Section 2 (Backend), Section 8 (REST API Directory) |
| **Data Model & Graph Schema** | New Neo4j node labels (`@Node`), new relationship types (`Constants.java`), new node properties, modified Cypher queries | Section 3 (Neo4j Graph Data Model), Section 8 |
| **Authentication & Security** | Changes to `AuthProviderPort`, new auth adapter, modified `SecurityConfig`, session handling in Redis, CSRF changes | Section 2.1 (Pluggable Auth), Section 7 (Security & Session) |
| **Messaging & Events** | New `EventType`, changes to `tree_events_exchange`, modified RabbitMQ routing keys, STOMP queue destinations | Section 4 (Real-time Event & Notification Architecture) |
| **Frontend Architecture** | New routes in `App.tsx`, new RTK Query slices, changes to `@xyflow/react` graph rendering, layout or diff logic | Section 5 (Frontend Architecture), diagrams |
| **AI Chatbot** | Changes to LangChain chains, Groq LLM model/prompts, new endpoints, or Neo4j QA integration | Section 6 (AI Chatbot Architecture) |
| **Infrastructure & Containers** | Changes to `podman-compose.yml`, Dockerfiles, Nginx configs (`nginx/default.conf`), ports, or environment variables | Section 1 (Topology), Section 9 (Container Topology) |

---

## 2. Step-by-Step Sync Workflow

### Step 1: Analyze Code Diff for Architectural Scope
Before concluding any implementation task, review all modified and added files using `git status` or file diffs.
Ask:
1. *Did we add, modify, or deprecate any public REST or WebSocket API?*
2. *Did we modify the Neo4j schema (node properties, labels, relationships, or Cypher queries)?*
3. *Did we alter how authentication, sessions, or role-based access checks work?*
4. *Did we change message formats, RabbitMQ queues/exchanges, or STOMP destinations?*
5. *Did we change container configurations, ports, Nginx proxy rules, or environment variables?*

If **YES** to any of the above, proceed to Step 2. If the changes are purely internal implementation fixes or cosmetic refactors with no architectural impact, verify that no existing documentation was invalidated and proceed.

### Step 2: Open and Read `ARCHITECTURE.md`
Read the relevant section(s) in [ARCHITECTURE.md](../../../ARCHITECTURE.md) using `view_file`.

### Step 3: Update Descriptions, Tables, and Code Snippets
- Keep tables sorted and complete.
- When adding endpoints, update **Section 8 (REST API Directory)** with HTTP method, path, parameters, request body, and role requirements.
- When modifying Neo4j models, update **Section 3 (Neo4j Graph Data Model)** with new fields, types, and descriptions.
- When modifying relationships, update `Constants.java` references and the relationship matrix table in Section 3.2.

### Step 4: Update Mermaid Diagrams
If topology, sequence, or component relationships changed:
- Check that Mermaid node names and connections accurately reflect the new data or control flow.
- Ensure all Mermaid labels use proper escaping and quote strings where needed.
- Test that syntax remains valid.

### Step 5: Validate Consistency
Cross-check the updated `ARCHITECTURE.md` against:
- `.env.example` / `familyTreeUI/.env.example` (if environment variables were added or changed).
- `README.md` (if high-level developer setup or port mappings changed).
- `AGENTS.md` (if key agent conventions or toolchains changed).

---

## 3. Architecture Invariant Checklist

Ensure that the code and the updated documentation maintain the core architectural rules:

- [ ] **Auth Decoupling**: Is business logic strictly dependent on `AuthProviderPort` rather than provider-specific SDKs?
- [ ] **Principal Identity**: Is `User.elementId` consistently used as the authenticated security principal?
- [ ] **Tree Partitioning**: Are newly introduced tree entities properly linked to `(Tree)` via `[:PART_OF]`?
- [ ] **Relationship Constants**: Are all Neo4j relationship names defined in `Constants.java`?
- [ ] **Event Parity**: If a new `EventType` is added, is it registered in both backend `EventType.java` and frontend Redux notifications?
- [ ] **Zero Bundler Drift**: Does the frontend continue to rely on Webpack 5 as the primary bundler?
- [ ] **Single Source of Truth**: Is [ARCHITECTURE.md](../../../ARCHITECTURE.md) 100% in sync with the codebase?
