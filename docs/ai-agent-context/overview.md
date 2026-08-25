---
title: AI Agent Context — Overview
sidebar_label: Overview
slug: /ai-agent-context/overview
---

# AI Agent Context

Nordiq is built with Claude Code, using a **Chief Architect + specialist
subagent** model. This section documents that workflow itself — it's not
background color, it's how changes actually move through this codebase,
and it's worth understanding whether you're a human contributor working
alongside it or an AI agent picking up a task.

:::info Not to be confused with NAS's agents
"Agent" is overloaded in this codebase. **NAS agents** (KLIMA, VERO, ROSTR,
GEAR, SHOVL, FLOW, CLUTCH) are the *product* — the backend systems that run
the field-service business. **Subagents**, covered on this page, are the
*development* tooling — Claude Code personas that write the code. They're
unrelated concepts that happen to share a word.
:::

## The model

One Claude Code session runs at the root of the workspace as the
**Chief Architect**. It:

- understands incoming work and decides which repo(s) it touches,
- delegates to the right specialist subagent(s) in the right order,
- reviews what comes back before integrating it or handing off to the next
  subagent,
- and keeps the repos consistent with each other.

The Chief Architect does **not** implement code directly in specialist
domains. The exceptions are cross-cutting docs (like this guide) and
trivial one-line fixes that don't warrant spinning up a subagent.

Five repos, five specialists, plus one cross-cutting specialist that
operates inside a repo rather than owning one outright:

| Repo | Subagent |
|---|---|
| `NDS/` | `nds-developer` |
| `NAS/` | `nas-developer` |
| `SHOVL/` | `shovl-developer` |
| `Nordiq-mission-control/` | `mission-control-developer` |
| `Nordiq-ws/` | `website-developer` |
| *(inside `NAS/`)* | `event-bus-developer` |

Full scope, conventions, and output format for each are in
[Subagents](/ai-agent-context/subagents).

## Why a subagent per repo

Each subagent is scoped to exactly one repo and told explicitly to stay
inside it — if a task needs a change elsewhere, the subagent reports that
need back rather than reaching across the boundary itself. Combined with
the contract discipline described in
[Platform Conventions](/architecture/platform-conventions), this means:

- a subagent can't silently create a cross-repo inconsistency, because it
  physically doesn't touch the other repo;
- every cross-repo dependency becomes a visible decision the Chief
  Architect makes, instead of an implicit side effect buried in one
  subagent's diff.

## The CLAUDE.md convention

Every repo carries a `CLAUDE.md` at its root — the workspace-level one
(this guide's primary source) plus one per repo. These are the persistent,
version-controlled context each subagent (and any human reading the repo
cold) starts from: stack, architectural patterns, conventions, and "what
lives here." When a repo's real structure diverges from what its
`CLAUDE.md` says, the fix is to update the file, not to let it drift —
it's documentation that's meant to be read by an agent on every single
task, so staleness compounds immediately in a way a rarely-read wiki page
wouldn't.

## Delegation checklist

Before delegating, the Chief Architect confirms:

1. Which repo(s) does this touch, and which NAS agent(s)
   (KLIMA/VERO/ROSTR/GEAR/FLOW/CLUTCH) if it's a NAS task?
2. Is there a cross-repo dependency? If so, what order do the subagents
   need to run in? (See [Repos → Overview](/repos/overview) for the
   dependency graph — NDS → NAS → SHOVL/Mission Control is never
   parallelized.)
3. What does each subagent need to know that it can't infer from its own
   repo alone? That context goes explicitly into the task handed to it.
4. After a subagent reports back, its summary gets reviewed before either
   integrating, asking it to revise, or handing off to the next subagent.

## What a subagent reports back

Every subagent ends its work with a structured summary rather than just a
diff, because the Chief Architect's next decision depends on it. At
minimum: what changed and why, and any open questions for the architect.
Several subagents have a sharper requirement baked into their brief — see
[Subagents](/ai-agent-context/subagents) for exactly what each one
surfaces (schema contract implications, API/event contract implications,
GCP infrastructure provisioned, access-control implications, and so on).
