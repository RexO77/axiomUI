---
name: axiomui-audit
description: Reviews an existing interface against Axiom UI's 105 UI design rules and reports prioritized findings, each tied to a rule id, a location, and a concrete fix, without editing code. Use when asked to review, audit, critique, or grade a page, component, pull request diff, screenshot, or design system for visual quality, consistency, usability, or accessibility; when preparing a pre-ship design QA pass; or when a review must cite specific, checkable rules instead of opinions. For code changes, use axiomui-website-upgrade only if it is installed; otherwise provide the report for a separate implementation task.
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI audit

Review an interface against Axiom UI's 105 UI design rules and report what is wrong, where it is, and how to fix it. This skill reviews. It does not edit code.

## Procedure

1. Frame the surface. Name the page or component, its primary task, and what is in scope. If the request is vague, audit the primary path first and say so.
2. Gather evidence. Prefer the rendered UI together with its source, because computed styles, tokens and component code show values a screenshot cannot. A screenshot alone is weaker evidence. When it is all you have, say so in the report.
3. Choose the domains. Pick the checklists below that the surface exercises. A form needs forms, components and accessibility at minimum. Anything that moves needs motion.
4. Walk the checklist. For each item, look for a concrete violation and record it with evidence: a file and line, a measured value, or a screen region. Skip items that do not apply, and never report a passing item as a finding.
5. Assign a severity from the scale below.
6. Report in the format below.

Read a rule's file under `references/rules/` before you report a finding you are unsure of. Its "What breaks" section is the impact statement for the finding.

## Severity

- **Blocker**: prevents the task, or fails WCAG A/AA.
- **Major**: visible friction or inconsistency on the primary path.
- **Minor**: polish a careful user would notice.
- **Nit**: a small deviation with no user impact on its own.

## Report format

A table sorted by severity, most severe first:

| # | Severity | Rule | Where | Finding | Fix |
|---|---|---|---|---|---|
| 1 | Minor | [typo-1](https://axiomui.nischal.fyi/rules/typo-1) | `src/components/signup-form.tsx:42` | The submit button reads "Create New Account" in Title Case. | Use sentence case: "Create new account". |

- **Rule** is the rule id, linked to its URL.
- **Where** is `file:line`, or a screen region when there is no source.
- **Fix** is the rule's Do applied to this case, specific enough to implement without rereading the rule.

After the table, add two short sections:

- **Deliberate exceptions**: places that break a rule on purpose, with the reason, so nobody "fixes" them later.
- **Not checked**: domains, states or themes you could not verify, such as motion from a static screenshot or a dark mode you did not render.

## Guardrails

- One finding per root cause. When one token causes ten violations, report the token once and list the places it affects.
- No taste as violation. Every finding cites a rule and shows how the code matches its Don't or misses its Do. When no rule covers a concern, leave it out of the table or put it in a short "Observations" note.
- Do not edit code. When the user wants the fixes made, hand the report to `axiomui-website-upgrade` only if that skill is installed. If it is unavailable, keep this review read-only and provide the report as the checklist for a separate implementation task; do not assume a handoff occurred.

## Checklists

Each file lists every rule in one domain with its Do/Don't pair and the questions to ask in review.

| Domain | Rules | Checklist |
|---|---|---|
| Typography & text | 13 | `references/checklists/typography.md` |
| Layout & spacing | 11 | `references/checklists/layout.md` |
| Color & depth | 12 | `references/checklists/color.md` |
| Components & actions | 12 | `references/checklists/components.md` |
| Forms & inputs | 12 | `references/checklists/forms.md` |
| System & logic | 13 | `references/checklists/system.md` |
| Motion & interaction | 29 | `references/checklists/motion.md` |
| Accessibility & inclusivity | 3 | `references/checklists/accessibility.md` |
