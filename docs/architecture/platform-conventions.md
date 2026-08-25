---
title: Platform Conventions
sidebar_label: Platform Conventions
slug: /architecture/platform-conventions
---

# Platform Conventions

These apply everywhere in the workspace unless a specific repo's own docs
override them.

## Language & platform

- **Language:** TypeScript, strict mode, in every repo.
- **Platform:** Firebase + Google Cloud. Cloud Functions v2, region
  `northamerica-northeast1`.
- **Multi-tenant:** via Firebase Identity Platform. The tenant ID always
  comes from `auth.token.firebase.tenant` — never a client-supplied
  parameter — and every Firestore path is scoped
  `tenants/{tenantId}/{collection}`.

## Data access

- The data model follows the **Host-Component pattern with Branded IDs** —
  see [Data Model](/architecture/data-model) for the full reference.
- Every agent that touches data goes through **NDS repositories**. Nobody
  hand-rolls a Firestore query against another domain's collections —
  that's what turns a schema change into an uncoordinated multi-repo
  incident instead of a reviewable contract change.
- NAS agents construct NDS repositories with a tenant-scoped context:

  ```ts
  { db, tenantId, col: (name) => db.collection(`tenants/${tenantId}/${name}`) }
  ```

## Contracts, not suggestions

Three things in this system are treated as **contracts** — changing them
has downstream blast radius, and that has to be surfaced explicitly rather
than discovered later:

1. **NDS schema** — every field NDS defines is consumed by NAS, SHOVL, and
   Mission Control. Adding is usually safe; removing, renaming, or
   retyping a field is a breaking change that may need a dual-write or
   migration period.
2. **NAS APIs and events** — what NAS exposes to SHOVL and Mission Control
   is a contract the same way NDS's schema is. A handler signature or an
   event's `data` shape isn't an implementation detail once something else
   consumes it.
3. **Event Bus event types** — every new event `type` published on the
   Event Bus is a contract other agents may come to depend on. See
   [Event Bus](/architecture/event-bus).

A downstream repo hitting an awkward shape from an upstream contract does
**not** reshape it locally to paper over the awkwardness — it flags the
awkwardness upstream instead. Silent local reshaping is how a data model
quietly forks across repos.

## Philosophy

- **Simple first.** Make it work, then iterate. Don't build abstraction
  layers for requirements that don't exist yet.
- **Match existing patterns.** Follow the conventions already established
  in a repo before introducing new ones. A genuinely new pattern gets
  flagged to the architect, not decided unilaterally by whichever repo
  needs it first.
- **No half-finished implementations.** A bug fix doesn't need surrounding
  cleanup; a one-shot operation doesn't need a helper; three similar lines
  beat a premature abstraction.
