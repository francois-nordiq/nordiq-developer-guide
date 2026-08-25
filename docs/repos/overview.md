---
title: Repos Overview
sidebar_label: Overview
slug: /repos/overview
---

# Repos Overview

The Nordiq workspace is five independently-versioned repos, plus one
cross-cutting specialist that operates inside one of them.

| Repo | Owns | Stack |
|---|---|---|
| [`NDS`](/repos/nds) | The shared Firestore data model (Contacts, BillingAccounts, Locations, Contracts, Services, WorkItems, Config) that every agent reads/writes | TypeScript, Firestore, Cloud Functions v2 |
| [`NAS`](/repos/nas) | The agentic backend — KLIMA, VERO, ROSTR, GEAR, FLOW, CLUTCH (and SHOVL's dispatch/backend logic) | TypeScript, Firebase Cloud Functions v2 |
| [`SHOVL`](/repos/shovl) | The SHOVL mobile crew app — the field-facing execution client | TypeScript, React Native, Expo |
| [`Nordiq-mission-control`](/repos/mission-control) | The admin/ops web app — human oversight over the agentic loop | TypeScript, web framework TBD |
| [`Nordiq-ws`](/repos/website) | The public marketing website | TypeScript, web framework TBD |

## Dependency graph

```
NDS (data model / source of truth)
   │  every agent reads/writes through NDS repositories
   ▼
NAS (KLIMA, VERO, ROSTR, GEAR, FLOW, CLUTCH — agentic backend logic)
   │  exposes APIs/events, drives SHOVL dispatch
   ├──────────────┬─────────────────────┐
   ▼              ▼                     ▼
SHOVL app    Mission Control        (Nordiq-ws is standalone —
(field crew) (ops oversight)         marketing only, no data coupling)
```

**Implication:** a change to the NDS schema is a contract change for NAS,
and a change to a NAS agent's API or events is a contract change for
SHOVL and Mission Control. Work is sequenced across this boundary, not
parallelized: **NDS → NAS → (SHOVL / Mission Control)**.

`Nordiq-ws` sits outside this graph entirely — no data coupling to
NDS/NAS unless a specific integration (e.g. a contact form) is
deliberately added.

## Cross-cutting: the Event Bus

The **NORDIQ Event Bus** (GCP Pub/Sub, the Event Outbox pattern, the
`NordiqEvent` envelope) is infrastructure inside `NAS` that every agent
publishes to and consumes from — see
[Architecture → Event Bus](/architecture/event-bus). It's owned by its own
specialist rather than folded into general NAS work; see
[AI Agent Context → Subagents](/ai-agent-context/subagents).
