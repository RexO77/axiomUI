# Axiom UI

Axiom UI is a library of {{ruleCount}} UI design rules across {{categoryCount}} domains. Each rule is one decision with a concrete Do, a concrete Don't, and written reasoning. Use the rules to make interface choices you can cite, instead of choices you have to defend on taste.

## Which Axiom UI skill

This skill is the rule library. The other Axiom UI skills each add a procedure for one job, and each applies only if it is installed:

- Building new UI and choosing a value or a treatment: stay here. Find the rule and apply it.
- Changing an existing interface in code: use `axiomui-website-upgrade`. It adds the upgrade loop, the craft standards and a verification contract.
- Reviewing without editing: use `axiomui-audit`. It adds per-domain checklists, a severity scale and a report format.
- Working mostly in one domain: use that domain's skill ({{domainSkills}}). It carries the domain's rules inline, with sharper triggers.

When the matching skill is not installed, stay here. Every rule is in this skill.

## How to apply a rule

1. Find the rule. Pick the domain in the table below and open its file, or scan the rule index for the id or title.
2. Apply its Do as written. Durations, ratios, sizes and easing curves are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the rule's file under `references/rules/` when the case is ambiguous or high-stakes, or when you need the reasoning: why it works, what breaks, how to apply it, and the questions to ask in review.
5. Cite the rule id and its URL when you explain a change, so the reader can check the decision.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## When breaking a rule is right

Axiom UI's tagline is the policy: "Built for consistency. Break rules only after mastering them." A rule gives way when the product's context makes the tradeoff clearly better: an established brand system, a platform convention, or a measured result. When you break one, name the rule, say why, and say what you did instead. Never break a rule silently, and never because following it is inconvenient.

## Domains

{{domainTable}}

## Rule index

{{ruleIndex}}
