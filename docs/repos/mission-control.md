---
title: Nordiq-mission-control — Admin Web App
sidebar_label: Mission Control
slug: /repos/mission-control
---

# Nordiq-mission-control — Admin Web App

Web app for internal/admin use — the human oversight layer over the
Nordiq Agentic System. Where operators watch and intervene in the
KLIMA → VERO → ROSTR → GEAR → SHOVL → FLOW loop: monitoring forecasts,
dispatch, crew/equipment allocation, execution status, and exceptions
across agents.

:::note
This role is inferred from the agentic system design — confirm/refine
against the real product spec once available.
:::

Consumes data and APIs exposed by `NAS`, which operates on data defined in
`NDS`.

## Stack

- TypeScript
- Web framework (fill in: e.g. Next.js / React + Vite)
- Firebase client SDKs (Auth, Firestore, Cloud Functions callable/HTTPS)

## What lives here

- `/app` or `/src` — pages, components, routing
- `/services` — Firebase/API client wrappers
- `/lib` or `/hooks` — shared utilities

## Conventions

- Simple first: make it work, then iterate.
- Treat `NAS`-exposed APIs/events and `NDS` data shapes as external
  contracts — raise awkward shapes with the architect instead of patching
  around them.
- Follow existing routing/component/state-management patterns before
  introducing new ones.
- This app likely needs stricter auth/role checks than SHOVL (admin
  surface) — access control changes are kept explicit and reviewable.

## Owning subagent

`mission-control-developer` — see
[AI Agent Context → Subagents](/ai-agent-context/subagents#mission-control-developer).
