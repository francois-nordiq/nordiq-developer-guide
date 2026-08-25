---
title: Architecture Overview
sidebar_label: Overview
slug: /architecture/overview
---

# Architecture Overview

The Nordiq Agentic System (NAS) is six specialized agents, each owning a
domain, continuously feeding the others:

```
KLIMA → VERO → ROSTR → GEAR → SHOVL → FLOW → (learning loop)
                                 ↑
                    (SHOVL's client/mobile app is a separate repo;
                     SHOVL's dispatch/backend logic lives in NAS)
```

## The agents

### KLIMA — Prediction Engine
Turns weather, demand signals, and historical data into operational
forecasts. Weather ingestion, event detection (snowfall, growth cycles),
trigger thresholds, predictive workload modeling, storm/event creation.
**Sends** events → SHOVL; **signals** demand → ROSTR & GEAR; **triggers**
client comms → VERO.

### VERO — Customer Intelligence & Revenue Engine
Manages the full customer lifecycle: quote → contract → communication.
AI-assisted pricing, customer portal, contract management, service plans,
communication engine. Phase 1 scope: smart quoting (including multi-modal
survey input — audio/photo/video with AI spec extraction; see
[Examples → Generate Quote](/examples/generate-quote)), new customer
creation (Contact → BillingAccount → Location), quote delivery,
quote→contract conversion, bundle/upsell recommendations. **Sends** service
requirements → SHOVL; revenue data → FLOW. **Receives** execution updates
← SHOVL; uses KLIMA triggers for notifications. All VERO mutations are
attributed to the `agent:vero` actor for the audit trail (`AgentActorId`).

### ROSTR — Workforce Intelligence
Aligns the right people, with the right skills, at the right time. Crew
database, scheduling/availability, payroll inputs, performance tracking.
**Assigns** crews → SHOVL; **receives** demand ← KLIMA; **sends** payroll
inputs → FLOW.

### GEAR — Fleet & Asset Intelligence
Ensures the right equipment is available, operational, and optimized.
Inventory, maintenance scheduling, usage tracking, repair logs. **Assigns**
equipment → SHOVL; **receives** demand ← KLIMA; **sends** cost/usage →
FLOW.

### SHOVL — Execution Engine
Plans routes, dispatches, and tracks field operations in real time. Backend/
dispatch logic lives in `NAS`; the field-facing mobile crew app is its own
repo (see [Repos → SHOVL](/repos/shovl)). Receives service demand from VERO
and KLIMA, crew assignments from ROSTR, equipment assignments from GEAR.
Completion data flows back to FLOW (invoicing) and VERO (customer
notification).

### FLOW — Financial Engine
Turns completed work into cash, insights, and financial control.
Invoicing, subscription billing, payment tracking, financial dashboards.
**Receives** job completion ← SHOVL; contract data ← VERO; payroll/
equipment costs ← ROSTR & GEAR.

### CLUTCH — External Intelligence Network (optional layer)
Connects operators with trusted external expertise/resources (expert
marketplace, partner network). Supports all agents as needed.

## System diagram

```
CLIENT APPS (Web, Mobile, Partner Integrations)
        │
        ▼
API GATEWAY (Firebase Functions v2 / Cloud Run)
        │
   ┌────┴─────────────────────────┐
   ▼                              ▼
VERO (and other agents: KLIMA / ROSTR / GEAR / FLOW / CLUTCH)
   │
   ▼
NDS (Nordiq Data Service) — Contacts, BillingAccounts, Locations,
Services, Contracts, WorkItems, Config
   │
   ▼
FIRESTORE
```

Every agent reads and writes through **NDS repositories** — nobody queries
another domain's Firestore collections directly. See
[Platform Conventions](/architecture/platform-conventions) for the
data-access rules and [Data Model](/architecture/data-model) for the
Host-Component pattern those repositories implement.

## How agents talk to each other

Two mechanisms, used deliberately for different purposes:

1. **Direct API calls** (Cloud Functions `onCall`) — for request/response
   interactions where the caller needs an answer, e.g. SHOVL asking VERO's
   API to generate a quote.
2. **The NORDIQ Event Bus** (Pub/Sub) — for "something happened, react if
   you care" — e.g. SHOVL publishing `run.completed` so FLOW can invoice
   and VERO can notify the customer, without either of them being called
   directly. See [Event Bus](/architecture/event-bus).

Don't parallelize work across a dependency boundary. A change to the NDS
schema is a contract change for NAS; a change to a NAS agent's API or
events is a contract change for SHOVL and Mission Control. Sequence
delegation: **NDS → NAS → (SHOVL / Mission Control)**.
