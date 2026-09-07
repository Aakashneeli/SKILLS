---
name: prune
description: >
  Prune a codebase — hunt dead code, duplicate logic, abandoned files, and
  technical debt, and deliver a safe removal plan. Use when the user wants to
  clean up a codebase, remove dead or unused code, find duplicate logic, drop
  unused components or dependencies, reduce technical debt, simplify
  implementations, or asks "what can we delete?" or for a maintainability audit.
---

# Pruning a Codebase

Act as a senior engineer auditing for quality and maintainability. The stance is
**aggressive but safe**: assume anything that carries no value is a liability,
and assume your reachability claims are wrong until proven. The deliverable is a
plan — never delete anything during the audit.

## 1. Map the codebase

Trace the **entry points** before hunting anything: mains, route tables, UI
pages, CLI commands, job schedulers, public APIs, config that wires modules
together. Everything reachable grows from these roots; everything else is
suspect.

Done when you can name, for the whole app, what starts execution and how
each entry point reaches its code.

## 2. Hunt

Work through the hunt categories in [reference/hunting.md](reference/hunting.md)
— dead code, duplicate logic, complexity, abandonment, redundant I/O — with the
concrete detection techniques for each. Cover **every** category; note the ones
that come up empty rather than skipping them silently.

## 3. Prove each finding

A finding without evidence is a guess. For each candidate, produce proof of
unreachability or duplication: zero references from live code (grep, not
memory), absence from the route table or component tree, or a diff of the
duplicated blocks. Run the test suite or typecheck when a finding's safety
depends on it.

Done when **every finding** carries evidence a reviewer could verify, and every
modified or generated-but-possibly-referenced file (build output, dynamic
imports, reflection, string-built routes) has been checked against its lookup
mechanism, not just static grep.

## 4. Report

For each finding:

- **What** — the dead/duplicated/complex thing, with file paths
- **Why it's dead weight** — the evidence, not the vibe
- **Removal impact** — what shrinks: LOC, deps, queries, cognitive load
- **Risks** — what might secretly reference it (dynamic dispatch, external
  consumers, reflection) and how you ruled it out or couldn't
- **Plan** — the ordered removal step, and what to re-run after it (tests,
  typecheck, build)

End with a cleanup sequence: highest-value, lowest-risk removals first, each
step independently shippable.
