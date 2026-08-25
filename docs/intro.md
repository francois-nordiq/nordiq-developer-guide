---
title: Introduction
sidebar_label: Introduction
slug: /intro
---

# Nordiq Developer Guide

Nordiq is a closed-loop, AI-driven field service operations platform for
snow removal, landscaping, and similar work. This guide is the developer
reference for the **Nordiq Agentic System (NAS)** and the workspace of
repos that implement it.

:::note Status
This platform is early-stage: the data model and agent contracts described
here are firm, but most repos are still scaffolding rather than shipped
code. Treat this guide as the architectural source of truth that
implementation is converging toward, and expect it to be updated as real
code lands.
:::

## What Nordiq does

A field service operator (say, a snow removal company) needs to predict
demand, staff and equip crews, execute the work, keep customers informed,
and get paid — over and over, storm after storm, season after season.
Nordiq automates that loop end-to-end with six specialized agents:

```
KLIMA → VERO → ROSTR → GEAR → SHOVL → FLOW → (learning loop)
```

| Agent | Domain | One line |
|---|---|---|
| **KLIMA** | Prediction | Turns weather/demand signals into operational forecasts |
| **VERO** | Customer & revenue | Quote → contract → communication, full customer lifecycle |
| **ROSTR** | Workforce | Right people, right skills, right time |
| **GEAR** | Fleet/assets | Right equipment, available and operational |
| **SHOVL** | Execution | Plans, dispatches, and tracks field ops in real time |
| **FLOW** | Finance | Turns completed work into invoices, margin, cash flow |
| **CLUTCH** | External network | Optional layer connecting operators to outside expertise |

**Worked example — a snowstorm:** KLIMA detects snowfall → VERO identifies
clients needing service → ROSTR assigns crews → GEAR allocates equipment →
SHOVL builds routes and dispatches → crews execute (tracked in real time)
→ FLOW auto-invoices → VERO notifies clients → the outcome feeds back into
the loop, sharpening the next forecast.

Read [Architecture → Overview](/architecture/overview) for how the agents
actually talk to each other, or jump straight to the [repo you're working
in](/repos/overview).

## How this guide is organized

- **[Architecture](/architecture/overview)** — the agent loop, platform
  conventions (stack, multi-tenancy), the shared data model, and the event
  bus that connects agents to each other.
- **[Repos](/repos/overview)** — the five repos, what each owns, and how
  they depend on one another.
- **[AI Agent Context](/ai-agent-context/overview)** — Nordiq is built with
  Claude Code subagents, one per repo, coordinated by a Chief Architect.
  This section documents that workflow itself, since it shapes how changes
  move through the codebase.
- **[Examples](/examples/generate-quote)** — worked examples that show the
  conventions above applied to a real contract between repos.

## Prerequisites

- TypeScript, strict mode, everywhere.
- Firebase + Google Cloud (Cloud Functions v2, Firestore), region
  `northamerica-northeast1`.
- Multi-tenant via Firebase Identity Platform — every Firestore path is
  scoped `tenants/{tenantId}/{collection}`, and the tenant ID always comes
  from `auth.token.firebase.tenant`, never a client-supplied parameter.

## Philosophy

Simple first: make it work, then iterate. Avoid premature abstraction or
speculative generality. Follow the coding patterns already established in
a repo before introducing new ones — if a new pattern is genuinely needed,
it gets flagged to the architect rather than decided unilaterally by
whichever repo happens to need it first.
