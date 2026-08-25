---
title: NDS — Nordiq Data Service
sidebar_label: NDS
slug: /repos/nds
---

# NDS — Nordiq Data Service

NDS is the shared Firestore data model and repository layer underneath the
entire Nordiq Agentic System. Every agent (KLIMA, VERO, ROSTR, GEAR, SHOVL,
FLOW, CLUTCH) reads and writes through NDS repositories — nobody queries
another domain's Firestore collections directly.

The data model itself (Host-Component pattern, branded IDs, sync rules) is
documented in full at [Architecture → Data Model](/architecture/data-model)
— this page covers the repo, not the model.

## Stack

- TypeScript, strict mode
- Firebase (Firestore) + Google Cloud Cloud Functions v2
- Multi-tenant via Firebase Identity Platform: tenant ID from
  `auth.token.firebase.tenant`; Firestore paths scoped
  `tenants/{tenantId}/{collection}`

## What lives here

- `/models` or `/types` — branded ID types and Host/Component TypeScript
  interfaces (source of truth for the data contract)
- `/repositories` — one repository per Host entity (e.g.
  `ContactRepository`, `BillingAccountRepository`, `LocationRepository`),
  consumed by NAS agents via `nds/repositories/...`
- `/functions` — Cloud Functions for data-layer operations (validation,
  triggers, denormalization fan-out)
- `/migrations` — versioned migration scripts

## Conventions

- Simple first: make it work, then iterate. No premature abstraction.
- Follow the existing Host-Component / branded-ID pattern for any new
  entity — don't invent a parallel convention.
- Every schema change is a potential breaking change for `NAS`, `SHOVL`,
  and `Nordiq-mission-control` (all downstream consumers) — state that
  explicitly rather than assuming a change is isolated to NDS.
- Migrations: idempotent and reversible where possible; document rollout
  (backfill strategy, dual-write period if needed).

## Owning subagent

`nds-developer` — see
[AI Agent Context → Subagents](/ai-agent-context/subagents#nds-developer).
