---
title: NAS — Nordiq Agentic System (backend)
sidebar_label: NAS
slug: /repos/nas
---

# NAS — Nordiq Agentic System (backend)

NAS is the AI-driven, closed-loop operations backend: it predicts, plans,
executes, communicates, and monetizes field service work through six
specialized agents working in sync, each owning a domain but continuously
feeding the others. See [Architecture → Overview](/architecture/overview)
for the agent-by-agent detail and interaction diagram.

```
KLIMA → VERO → ROSTR → GEAR → SHOVL → FLOW → (learning loop)
                                 ↑
                    (SHOVL's client/mobile app is a separate repo;
                     SHOVL's dispatch/backend logic lives here)
```

## Stack

- TypeScript, strict mode
- Firebase Cloud Functions v2, region `northamerica-northeast1`
- Multi-tenant: tenant ID from `auth.token.firebase.tenant`; NDS
  repositories are constructed with a tenant-scoped context
  (`{ db, tenantId, col: (name) => db.collection('tenants/{tenantId}/{name}') }`)
- Consumes `nds/repositories/*` and `nds/types/*` — never queries Firestore
  directly for another domain's data

## What lives here

- `/src/api/<agent>/` — one folder per agent (e.g. `/src/api/vero/types.ts`,
  handlers, request/response contracts). See
  [Examples → Generate Quote](/examples/generate-quote) for a concrete look
  at `/src/api/vero/`.
- `/src/handlers/` — cross-cutting or agent-specific handlers (e.g.
  `CreateCustomerHandler`)
- `/src/index.ts` — Cloud Function entry points (`onCall` exports per
  agent action, e.g. `vero_createCustomer`)
- `/shared` — cross-agent utilities and shared types (including the Event
  Bus's `NordiqEvent` envelope — see [Event Bus](/architecture/event-bus))

## Conventions

- Simple first: make it work, then iterate.
- Consume data shapes from `NDS` as defined there — don't redefine or
  duplicate types; import them and note the source.
- Expose clean, stable APIs/events for `SHOVL` and `Nordiq-mission-control`
  to consume — treat those as contracts, same as NDS's schema.
- Follow existing patterns per agent (KLIMA/VERO/ROSTR/GEAR/FLOW/CLUTCH)
  before introducing new ones; keep agents loosely coupled from each other
  unless the interaction is a deliberate part of the loop.
- Handlers stay thin and delegate to NDS repositories rather than
  reimplementing transaction logic — repositories already wrap their own
  Firestore transactions.

## Owning subagents

- `nas-developer` — business/agentic logic for any of the six agents. See
  [AI Agent Context → Subagents](/ai-agent-context/subagents#nas-developer).
- `event-bus-developer` — the cross-cutting Event Bus mechanism
  specifically (publishing/consuming domain events, Pub/Sub
  infrastructure) — delegated to instead of `nas-developer` for that
  slice of the repo. See
  [AI Agent Context → Subagents](/ai-agent-context/subagents#event-bus-developer).
