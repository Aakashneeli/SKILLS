# Concise grilling instructions

Researched 2026-10-06 against Matt Pocock's first-party articles and skill source. Scope: preserve the grilling contract while shortening its product-design and security additions.

## Source guidance

- **Prune by behavior.** Pocock recommends deleting explanations the model already understands and duplicated meanings. A shorter draft is insufficient: remove a sentence only when its removal preserves behavior, and resolve uncertainty by trying the skill. Keep each instruction in one authoritative place. [Writing for Agents](https://www.aihero.dev/skills-writing-for-agents)
- **Use familiar concepts.** His source recommends established leading words instead of invented labels, positive target behaviors, and completion criteria that are both observable and exhaustive. Keep necessary steps inline; disclose reference only when some branches need it. [Writing-for-agents source](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md)
- **Preserve the interview contract.** Grilling uses a dependency frontier: each round contains decisions whose prerequisites are settled. Facts belong to the agent; decisions belong to the user. Recompute after answers. Preserve numbered questions, separate recommendations, and confirmation of shared understanding before acting. Wrappers reuse the interview rather than redefine it. [Grilling](https://www.aihero.dev/skills-grilling)
- **Clarity exceeds brevity.** Pocock's short `wait-what` skill restores missing context and familiar project vocabulary. It warns that demanding shorter output alone can produce clipped text that remains unclear. [Wait What](https://www.aihero.dev/skills-wait-what)

## Application to this skill — our inference

Use **product critique** for the design standard and **threat modeling** for the security survey. These familiar terms compress intent; explicit scope and completion criteria preserve the user's requirements:

- Product critique: challenge user value, evidence and success measures; evaluate the journey, hierarchy, accessibility and exceptional states; resolve material tradeoffs.
- Threat modeling: map assets, actors, trust boundaries and abuse cases; cover applicable control areas; record impact, mitigation, verification and accepted residual risk.

Define the frontier once, replace the two-question example with one reusable question format, and retain facts-versus-decisions and the final confirmation gate. Keep security coverage explicit: a bare “threat-model this” could omit required areas. A coverage checklist is useful instruction, not automatically a no-op.

## Verification boundary

The complete skill decreased from 491 to 266 whitespace-delimited words, including frontmatter (45.8%). A static comparison retains the original audience/problem checks, design-state coverage, security control areas, exclusions and residual-risk handling, dependency-based rounds, recommendation format, factual research, user decisions and confirmation gate.

A smaller word or byte count demonstrates a shorter file only. It does not establish better model reliability, lower latency or measured token savings. Review the old and new behavioral contracts, then try representative sessions: dependent decisions, an interface with error/recovery states, and a multi-tenant feature with sensitive data. Check coverage, recommendations, unresolved risks and the confirmation gate.

No live behavior benchmark was performed for this rewrite.
