---
title: The NORDIQ Event Bus
sidebar_label: Event Bus
slug: /architecture/event-bus
---

# The NORDIQ Event Bus

The Event Bus is the mechanism that lets KLIMA, VERO, ROSTR, GEAR, FLOW,
CLUTCH, and SHOVL react to business facts **without calling each other
directly**. It's built on Google Cloud Pub/Sub and lives in `NAS`.

:::info Source of truth
The full architectural contract lives in
`NAS/doc/NORDIQ_Event_Bus_AI_Agent_Context.md`. This page summarizes it;
that doc is authoritative when they disagree.
:::

## Shape of the mechanism

- **One shared topic** for Phase 1: `nordiq.events.v1`. Don't create a
  topic per domain.
- **Each consuming agent owns its own subscription**
  (`nordiq-<agent>-events`), filtered by event type via message
  attributes — not a separate topic per consumer either.
- Events are **past-tense business facts** (`run.created`, not
  `shovl.createRun`), named `<entity>.<event>`, and never name the
  consumer — an event describes what happened, not who should care.

## The envelope

Every event uses the standard `NordiqEvent<T>` envelope:

```ts
interface NordiqEvent<T> {
  id: string;
  type: string;            // "<entity>.<event>", e.g. "run.completed"
  version: number;
  occurredAt: string;
  source: string;
  organizationId: string;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  causationId: string;
  actor: ActorId;
  data: T;                 // stays focused — reference IDs, not full denormalized objects
}
```

## The Event Outbox pattern

Producers **never** write Firestore state and publish to Pub/Sub as two
independent steps — that gap is exactly where a crashed function leaves
state and event permanently out of sync. Instead:

1. The domain write and an outbox record are committed **in the same
   Firestore transaction**.
2. A Firestore-triggered Cloud Function reads the outbox record and
   publishes it to Pub/Sub.

This guarantees the event is published if and only if the domain write
actually committed.

## Consumer rules

- **Idempotent.** Track processed event IDs or make the reaction naturally
  idempotent — duplicate delivery is expected, not a bug to route around.
- **Isolated failure.** Every subscription needs retry/backoff and a
  dead-letter topic. A failure in one consumer must never block another
  consumer of the same event.
- **Minimal by design.** A consumer proves or performs *one* meaningful
  reaction, not a whole downstream workflow — per the "don't over-model
  Phase 1" principle. Real business logic for a consuming agent (e.g. ROSTR
  actually assigning workforce on `run.created`) is that agent's own work,
  not something bolted onto the event mechanism.

## When to use Pub/Sub vs. Cloud Tasks

- **Pub/Sub** — "something happened." Fan-out, decoupled reactions.
- **Cloud Tasks** — "do this later." Delayed or retryable command
  execution.

Don't build delayed/retryable command execution on top of Pub/Sub
consumers — that's a Cloud Tasks job wearing an event's clothes.

## Ownership

Infrastructure changes (topics, subscriptions, filters, dead-letter
topics, IAM) for project `nordiq-56c71`, region
`northamerica-northeast1`, and the producer/consumer code that plugs into
them are owned by the `event-bus-developer` subagent — see
[AI Agent Context → Subagents](/ai-agent-context/subagents). A new event
`type` is a contract the same way an NDS schema field is: state the exact
`type` string, its `data` shape, its `version`, and which subscription
consumes it whenever one is introduced.
