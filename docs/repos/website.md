---
title: Nordiq-ws — Public Website
sidebar_label: Website
slug: /repos/website
---

# Nordiq-ws — Public Website

Nordiq's public/marketing website. Standalone — no data coupling to
`NDS`/`NAS` unless a specific integration (e.g. a contact form writing to
Firestore, or a status page reading from NAS) is deliberately added.

## Stack

- TypeScript
- Web framework (fill in: e.g. Next.js / Astro)
- Firebase Hosting (assumed) + optionally Firestore/Cloud Functions for
  light integrations (contact forms, waitlists, etc.)

## What lives here

- `/pages` or `/app` — site pages
- `/components` — shared UI components
- `/content` — marketing copy / CMS content if applicable

## Conventions

- Simple first: make it work, then iterate. This is the lowest-complexity
  repo in the workspace — resist adding infrastructure it doesn't need.
- Content and SEO structure matter here more than in the other repos —
  keep page structure, metadata, and routing clean and predictable.
- If a genuine data integration is added (e.g. form submissions), treat
  the resulting shape as a small, explicit contract — document it here.

## Owning subagent

`website-developer` — see
[AI Agent Context → Subagents](/ai-agent-context/subagents#website-developer).
