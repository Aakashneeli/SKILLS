---
name: feature-ideas
description: Analyze an existing codebase and suggest small, high-value, low-complexity feature opportunities that fit the current product and architecture. Use this when the goal is to find practical next features, quick wins, or small extensions that improve user value, developer productivity, code quality, maintainability, performance, reliability, UX, workflow, automation, or security without major rewrites.
---

# Quick Win Feature Finder

Use this skill when the user wants grounded feature suggestions from an existing repository.

Your job is to behave like a pragmatic product engineer:
- think like a PM and a coder
- stay practical
- prefer small but meaningful wins
- avoid overcomplication
- recommend features that fit the current structure instead of idealized greenfield solutions

## Primary objective

Find the best **practical next tasks** in the codebase:
- features that are easy enough to be realistic
- valuable enough to matter
- aligned with the current product direction
- close enough to the existing system that they do not feel random or out of scope

## Optimize for

Use this priority order when judging suggestions:
1. user value
2. developer productivity
3. code quality
4. maintainability
5. performance
6. reliability
7. UX polish

When ranking final suggestions, prefer:
1. fastest win first
2. business value first
3. low implementation risk
4. reuse of existing code, patterns, or infrastructure

## What to look for

Pay special attention to:
- repeated patterns that should be turned into a small feature or helper flow
- missing UX or workflow steps
- half-built or implied features
- obvious pain points in current usage
- unused or underused existing infrastructure
- places where a small addition unlocks real value
- admin or internal workflows that are clumsy but fixable
- small user-facing improvements that feel natural to the product
- automation opportunities
- lightweight security improvements
- extensions of existing latent features rather than brand-new inventions

If the codebase is mostly backend, AI/LLM, or data pipeline oriented:
- treat API consumer experience, observability, reviewability, operability, guardrails, and workflow smoothness as valid UX/product surfaces
- do not force frontend-style ideas where they do not belong

## Allowed suggestion types

Prefer suggestions in these categories:
- small user-facing features
- workflow improvements
- automation
- lightweight security improvements
- small developer-facing product improvements
- feature completion or extension of an already implied capability

Slight extensions are allowed if they fit the current architecture and feel like a natural next step.

## Do not suggest

Do not suggest:
- huge architecture rewrites
- major platform migrations
- large auth redesigns
- speculative moonshot ideas
- vague “future ideas” with no grounding in the repo
- features that require broad organizational change
- suggestions that clearly exceed the current product direction
- large refactors disguised as “small features”

Do not overcomplicate the answer.

## How to think

Before suggesting features, first form a grounded view of:
- what the product appears to do
- who the likely user or operator is
- what is already present
- what is partially present
- what feels missing but nearby
- what can be improved without fighting the codebase

Prefer:
- extending an unfinished or hinted-at flow
over
- inventing a totally new capability

Prefer:
- current-structure-compatible improvements
over
- theoretically cleaner but disruptive changes

If the repository quality is poor, still suggest features using the current structure.
Do not block on cleanup work.
Only mention cleanup if it directly enables a high-value small feature.

## Analysis workflow

Follow this sequence:

1. Understand the product surface.
   - Identify the main purpose of the service/app/pipeline.
   - Infer the likely users, operators, or stakeholders.

2. Scan for opportunity signals.
   - repeated logic
   - unused utilities or endpoints
   - TODO-like patterns
   - partially implemented flows
   - missing validations, feedback loops, audit trails, retries, fallbacks, summaries, filters, admin controls, or review steps
   - gaps between internal capability and external usefulness

3. Write a few brief observations.
   - Keep them concrete and codebase-grounded.
   - These observations should explain why the final suggestions make sense.

4. Generate candidate feature ideas.

5. Filter candidates aggressively.
   Keep only ideas that are:
   - simple
   - effective
   - close to the current system
   - useful now
   - low-risk
   - not too out of line

6. Rank the final result.
   Return the top 3 immediate feature suggestions only.

7. Separate near-term future ideas.
   If helpful, include a very small “Next-phase ideas” section with up to 2 lower-priority ideas.
   These must be clearly separated from the top 3 immediate suggestions.

## Output rules
The output should be a markdown file.

Be concise, specific, and grounded.
Do not flood the user with too many ideas.
Do not return generic product advice.
Do not return implementation-heavy architecture plans.

## Required output format

### Codebase observations
Give 3 to 6 short observations that explain the opportunity areas you found.

### Top 3 immediate feature suggestions

For each of the 3 suggestions, use this format:

#### 1. Feature name
- **Why it matters:** explain the user, business, or workflow value
- **Why it is low complexity:** explain why it is realistic in this repo
- **Where it fits in the current codebase:** name the likely modules, flows, endpoints, services, jobs, or layers it belongs to
- **Estimated effort:** use one of `Very small`, `Small`, or `Medium-small`
- **Next step:** give the most practical first move

Repeat the same structure for feature 2 and feature 3.

### Next-phase ideas
Optional.
Include at most 2 brief ideas.
These should be clearly lower priority than the top 3.

## Quality bar

A strong answer should feel like:
- “This agent understood the repo”
- “These ideas are actually buildable”
- “These are useful next tasks”
- “This is thinking like a product engineer, not just a coder”
- “These suggestions are small, smart, and realistic”

A weak answer sounds like:
- generic roadmap filler
- obvious advice with no repo grounding
- architecture fantasies
- too many ideas
- ideas that are valuable but not actually small
- ideas that ignore the current structure