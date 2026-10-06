---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Hold the user to a **high standard of product design**. Challenge the proposed user problem, target audience, evidence of demand, and success criteria. For product or interface decisions, examine the core journey, information hierarchy, accessibility, interaction clarity, and loading, empty, error, and recovery states. Surface weak assumptions and unnecessary complexity; recommend concrete alternatives and make the user resolve material tradeoffs before treating a design branch as settled.

Conduct a **thorough survey of security implications** as part of the design tree. Map assets, sensitive data, actors, trust boundaries, and plausible abuse cases. Examine applicable risks in authentication, authorization and tenant isolation, input handling, secrets, dependencies and integrations, data storage and retention, logging, and operational access. Ground the survey in the actual design and available code or configuration. For each material risk, identify its impact, proposed mitigation, and how that mitigation will be verified; put unresolved security decisions to the user. Account for each applicable area and explain exclusions. Treat unknowns as open branches until investigated or explicitly accepted with the residual risk understood.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
