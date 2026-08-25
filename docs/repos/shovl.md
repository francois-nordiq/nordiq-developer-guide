---
title: SHOVL — Mobile Crew App
sidebar_label: SHOVL
slug: /repos/shovl
---

# SHOVL — Mobile Crew App

React Native / Expo app, TypeScript. This is the field-facing client for
the **SHOVL agent** — the execution engine of the Nordiq Agentic System.
In the agentic loop (KLIMA → VERO → ROSTR → GEAR → **SHOVL** → FLOW),
SHOVL receives service demand from VERO and KLIMA, crew assignments from
ROSTR, and equipment assignments from GEAR — then plans routes, dispatches,
and tracks execution in real time. Completion data flows back out to FLOW
(invoicing) and VERO (customer notification).

Consumes data and APIs exposed by `NAS`, which in turn operates on data
defined in `NDS`.

## Stack

- TypeScript, React Native, Expo
- Firebase client SDKs (Auth, Firestore, Cloud Functions callable/HTTPS)

## What lives here

- `/app` or `/src` — screens, components, navigation
- `/services` — Firebase/API client wrappers
- `/hooks` — shared React hooks

## Conventions

- Simple first: make it work, then iterate. Prefer Expo's built-in
  capabilities over adding native modules unless there's a clear need.
- Treat `NAS`-exposed APIs/events and `NDS` data shapes as external
  contracts — don't reshape them locally; if the shape is awkward for the
  UI, that's a signal to raise it with the architect, not to patch around
  it silently.
- Follow existing component/screen/navigation patterns before introducing
  new ones (e.g. a new state management approach, a new navigation
  library).
- Keep platform-specific (Android) quirks isolated and documented, since
  Expo's cross-platform abstraction is the default assumption.

## Owning subagent

`shovl-developer` — see
[AI Agent Context → Subagents](/ai-agent-context/subagents#shovl-developer).
