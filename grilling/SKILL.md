---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview relentlessly toward shared understanding. Build a **design tree** of decisions and their prerequisites.

Apply two lenses to the tree:

- **Product critique:** hold the user to a high design bar. Challenge audience, problem, demand evidence, success criteria, and complexity. Examine journeys, hierarchy, accessibility, interaction clarity, and loading/empty/error/recovery states. Recommend concrete alternatives; settle material tradeoffs explicitly.
- **Threat modeling:** survey assets, sensitive data, actors, trust boundaries, and abuse cases against the actual design and available code/configuration. Cover applicable authentication, authorization/tenant isolation, inputs, secrets, dependencies/integrations, storage/retention, logging, and operational access; justify exclusions. For each material risk, establish impact, mitigation, and verification. Keep unknowns open until investigated or the user explicitly accepts the residual risk.

Work in **rounds**. The **frontier** contains every decision whose prerequisites are settled. Ask the entire frontier, then wait for answers and recompute it. Defer questions dependent on an unanswered question to a later round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```


**Facts are yours; decisions are the user's.** Dispatch a sub-agent to investigate facts you can look up. Pending research blocks only dependent questions; continue with the remaining frontier. Put decisions to the user and wait.

**Done:** every branch is settled, material product tradeoffs and security risks are accounted for, and no assumption remains implicit. Ask the user to confirm shared understanding before acting on the plan.
