---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Before making changes, record the current `HEAD` commit SHA as the review fixed point.

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Commit your work to the current branch before running /code-review, whose diff only includes committed changes. Include only changes belonging to this task.

Use /code-review with the recorded starting SHA as the fixed point so the review includes the entire implementation.

Address actionable review findings, rerun the affected checks, and commit any fixes to the current branch. If fixes need another review, commit them first and use the same starting SHA.
