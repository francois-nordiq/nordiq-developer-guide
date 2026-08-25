---
title: Data Model
sidebar_label: Data Model
slug: /architecture/data-model
---

# Data Model

The shared Firestore data model lives in **NDS** (Nordiq Data Service) —
see [Repos → NDS](/repos/nds) for the repo itself. This page is the
conceptual reference every other repo builds against.

## Host-Component pattern

Every primary entity (a "Host": `BillingAccount`, `Contract`, `Location`,
`Contact`, `Service`, `WorkItem`, etc.) carries a set of **Universal
Components** as sub-collections:

| Component | Purpose |
|---|---|
| `workflows` | Immutable log of state transitions (`from` → `to`) |
| `eventLogs` | General audit trail for non-state events |
| `notes` | Internal and customer-facing communication |
| `associations` | Dynamic many-to-many relationship management |

## Branded IDs (pointer safety)

All IDs are **branded types** — strings at runtime, unique types at
compile time:

```ts
export type LocationId = string & { __brand: 'LocationId' };
```

**Rule:** always use the specific branded ID type in function signatures,
never bare `string`. This is what makes it a compile error to pass a
`ContactId` where a `LocationId` is expected, even though both are just
strings underneath.

## Core entity hierarchy

```
BillingAccount ──< Contract ──< Service ──< WorkItem
       │                            │
       └──< Location ───────────────┘
Contact ──< Association >── BillingAccount (roles)
```

1. **BillingAccount** — the legal entity; everything starts here.
2. **Contract** — pricing model (base rate, unit overages) for services.
3. **Location** — physical site (`timezone`, `geopoint`, `metadata`).
4. **Service** — operational intent linking a Location + Contract +
   ServiceType.
5. **WorkItem** — a specific occurrence of work (e.g. "Mowing on June 12").

## Financials

- `ResourceSet` — an array of `ResourceEntry` (labor, equipment, materials
  used).
- `Financials` — snapshot arrays of `estimates` and `actuals`.
- `FinancialBreakdown.totalCost` is **always derived** as
  `subtotal + taxTotal` — never set independently.

## Config / master data

- `ConfigGlobal` — base currency, etc.
- `ConfigResource` — asset catalog.
- `ConfigServiceType` — work type definitions.

## Sync & integrity rules

These are load-bearing — violating them corrupts data, not just style.

### Hard syncs
Must run **inside the App-layer `runTransaction`**, never deferred to a
Cloud Function. Any delay is a corruption window:

- `Host.currentStatus` always equals the latest `workflows[].toState`.
- `Host.updatedAt` / `Host.updatedBy` set on every mutation.
- `FinancialBreakdown.totalCost` derived, never set independently.
- `FinancialBreakdown.costs[].qty` / `.resourceId` mirror the referenced
  `ResourceEntry`.

### Denormalized copies
Propagate via a Cloud Function on source change:

- `WorkItem.locationName` copies `Location.metadata.name` at creation; if
  the Location name changes, fan out a batch update to child WorkItems.
- `WorkItem.locationId` is inherited from the parent `Service` at creation
  and is **immutable** after.

### Referential integrity
Every branded ID field must resolve to an existing document, e.g.:

- `Contract.billingAccountId → BillingAccount.id`
- `Service.locationId → Location.id`
- `Service.contractId → Contract.id`
- `Service.typeId → ConfigServiceType.id`

Deletes are **soft-deletes**, guarded against orphaning active children —
e.g. deleting a Contract is rejected if active Services still reference
it.

## Why this matters beyond NDS

This model is what makes "treat NDS's schema as a contract" (see
[Platform Conventions](/architecture/platform-conventions)) a concrete,
checkable thing rather than a slogan: a branded ID that doesn't resolve, a
`totalCost` set outside a transaction, or a denormalized field that wasn't
fanned out are all bugs the pattern is specifically designed to make
visible, in code review or in production, rather than silent.
