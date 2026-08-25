---
title: 'Worked Example: Multi-Modal Quote Generation'
sidebar_label: Generate Quote (VERO)
slug: /examples/generate-quote
---

# Worked Example: Multi-Modal Quote Generation

This walks through `NAS/src/api/vero/generate_quote_v4.ts` — VERO's
GenerateQuote request/response contract — as a concrete illustration of
the conventions covered in
[Architecture](/architecture/overview): branded IDs, consuming NDS types
as a contract, and an agent's API surface as its own contract for
downstream repos.

## What it does

A crew or customer submits a property survey — manual specs, plus
optional audio comments, photos, and video — and VERO turns it into a
tiered quote proposal (essential / standard / premium / custom), using AI
to extract property specs from the media and resolve conflicts between
sources.

## The request

```ts
export interface GenerateQuoteRequest {
  locationId: LocationId;
  billingAccountId: BillingAccountId;
  primaryContactId: ContactId;

  requestedServices: RequestedServiceInput[];
  survey?: PropertySurveyInput;
  options?: GenerateQuoteOptions;
  operatorNotes?: string;

  actorId: ActorId;
}
```

Notice `LocationId`, `BillingAccountId`, and `ContactId` are **imported
from `nds/types/common_data.js`**, not redefined here — this is the
"consume NDS types, don't duplicate them" rule from
[Platform Conventions](/architecture/platform-conventions) applied
directly: VERO doesn't get to have its own opinion about what a
`LocationId` looks like.

## Branded IDs, defined locally where VERO owns the concept

`ProposalId` and `SurveyAssetId` are concepts VERO itself owns (a quote
proposal isn't an NDS Host entity), so they're branded locally in this
file, using the same pattern NDS uses for its own IDs:

```ts
export type ProposalId = BrandedId<'ProposalId'>;
export type SurveyAssetId = BrandedId<'SurveyAssetId'>;
```

This is the general rule: a branded ID lives wherever the entity it
identifies is defined. NDS branded IDs live in NDS; an agent's
agent-local concepts get their own branded IDs the same way, not a bare
`string`.

## Multi-modal survey input

```ts
export interface PropertySurveyInput {
  specifications?: SpecificationMap;
  audioComments?: AudioCommentInput[];
  photos?: PhotoInput[];
  videos?: VideoInput[];
  surveyedAt?: string;
  surveyedBy?: ActorId;
  weatherConditions?: string;
  surveyNotes?: string;
}
```

Each media type is analyzed independently and can produce conflicting
extracted specs (e.g. a photo estimates driveway length differently than
an audio comment):

```ts
export interface ExtractedSpecification {
  specKey: string;
  value: SpecificationValue;
  source: SpecSource;
  confidence: number;

  conflictsWith?: { source: SpecSource; value: SpecificationValue }[];
  resolution?: SpecResolution;
}

export type SpecResolution =
  | 'manual_wins'
  | 'highest_confidence'
  | 'averaged'
  | 'operator_review';
```

`SpecSource` is a discriminated union keyed by `type`, so every extracted
value carries exactly the provenance fields relevant to where it came
from — an `audio` source carries a transcript excerpt, a `photo` source
carries an annotation ID, and so on. This is the same shape of pattern as
`FeatureInclusion` on `ComparisonMatrix` below: a union that makes an
invalid state (e.g. an `'upgrade'` inclusion with no `cost`) unrepresentable
rather than validated after the fact.

## The response: a tiered proposal, not a single quote

```ts
export interface ServicePackageProposal {
  id: ProposalId;
  locationId: LocationId;
  billingAccountId: BillingAccountId;
  primaryContactId: ContactId;

  packages: PackageOffer[];
  comparisonMatrix: ComparisonMatrix;

  validFrom: string;
  validUntil: string;

  createdAt: string;
  createdBy: ActorId;
}
```

`createdBy: ActorId` — not a plain user ID — is how the "all VERO
mutations are attributed to the `agent:vero` actor for the audit trail"
rule from [Architecture → Overview](/architecture/overview) shows up in
the type system: whatever ID goes here has to actually be an `ActorId`,
which can represent either a human or an agent actor.

## Reading this as a downstream consumer

If you're in `SHOVL` or `Nordiq-mission-control` calling this API: the
`GenerateQuoteRequest`/`GenerateQuoteResponse` pair is a contract in the
same sense NDS's schema is (see
[Platform Conventions](/architecture/platform-conventions)) — reshape it
locally to make client code more convenient and you've forked the
contract. If the shape is awkward, that's exactly the kind of thing that
gets raised with the architect rather than patched around, per each
client repo's own conventions
([SHOVL](/repos/shovl#conventions),
[Mission Control](/repos/mission-control#conventions)).
