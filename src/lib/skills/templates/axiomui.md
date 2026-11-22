# Axiom UI

Axiom UI is a library of {{ruleCount}} UI design rules across {{categoryCount}} domains. Each rule shows Do and Don’t examples, explains the choice and gives a URL you can cite.

## Which Axiom UI skill

This skill is the rule library. Choose an installed skill that fits the task.

- Building new UI and choosing a value or a treatment: stay here. Find the rule and apply it.
- Changing an existing interface in code: use `axiomui-website-upgrade`. It lists rules by page type and explains how to find, fix and verify problems.
- Reviewing without editing: use `axiomui-audit`. It adds the detection sweep, per-domain checklists, a severity scale and a report format.
- Working mostly in one domain: use that domain's skill ({{domainSkills}}). Its skill file includes the rules for that domain.

When the matching skill is not installed, stay here. Every rule is in this skill.

## How to apply a rule

1. Find the rule. Pick the domain in the table below and open its file, or scan the rule index for the ID or title.
2. Check what the example covers. A duration describes the transition shown. A contrast requirement has its own scope, threshold and exceptions.
3. Before recommending a change, reproduce the failure or measure the value and compare it with the applicable threshold.
4. Read the rule's file under `references/rules/` when the case is ambiguous or high-stakes, or when you need the reasoning: why it works, what breaks, how to apply it, and the questions to ask in review.
5. Cite the rule ID and its URL when you explain a change, so the reader can check the decision.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## When breaking a rule is right

A platform convention, a language’s reading direction or evidence from the task can justify a different treatment from the example. Document the rule, the evidence and the result. When the decision concerns a standard, use that standard’s own conditions and exceptions to assess conformance.

## Domains

{{domainTable}}

## Rule index

{{ruleIndex}}
