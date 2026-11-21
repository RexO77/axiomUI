# Axiom UI audit

Review an interface against Axiom UI's {{ruleCount}} UI design rules and report what is wrong, where it is, and how to fix it. This skill reviews. It does not edit code.

## Procedure

1. Frame the surface. Name the page or component, its primary task, and what is in scope. If the request is vague, audit the primary path first and say so.
2. Gather evidence. Prefer the rendered UI together with its source, because computed styles, tokens and component code show values a screenshot cannot. A screenshot alone is weaker evidence. When it is all you have, skip the source searches below and say so in the report.
3. Run the sweep below as a starting point.
4. Choose the domains. Pick the checklists below that the surface exercises. A form needs forms, components and accessibility at minimum. Anything that moves needs motion.
5. Walk the checklist. For each item, look for a concrete violation and record it with evidence: a file and line, a measured value, or a screen region. Skip items that do not apply, and never report a passing item as a finding.
6. Check the rule's conditions before every finding. Read its description in the checklist, and open its file under `references/rules/` whenever the description names a condition or exception, the fix sets a value, or the finding is a conformance claim. Its "What breaks" section describes a possible failure; report the impact observed on the reviewed interface and state which effects still need testing.
7. Assign a severity from the scale below.
8. Report in the format below.

For motion, watch each transition at 10% or 25% speed in the browser's animation tools to check its origin, path and easing, then judge it again at full speed, where timing is felt.

## Sweep

{{sweep}}

## Severity

- **Blocker**: the task cannot be completed on a supported path, or a verified failure prevents meeting the applicable WCAG A or AA conformance target. Name the criterion and the tested conditions.
- **Major**: visible friction or inconsistency on the primary path.
- **Minor**: polish a careful user would notice.
- **Nit**: a small deviation with no user impact on its own.

## Report format

A table ordered by user impact: severity first, then, within a severity, failures earlier on the primary path and failures more people meet come first.

| # | Severity | Rule | Where | Finding | Fix and verification |
|---|---|---|---|---|---|
| 1 | Blocker | [a11y-1](https://axiomui.nischal.fyi/rules/a11y-1) | `src/app/globals.css:14` | `*:focus { outline: none }` has no replacement. Tabbing from the address bar reaches Pricing, Sign in and Start trial with no visible indicator (WCAG 2.4.7, AA). | Replace it with `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px }`. Verify: Tab through the header and the sign-up form on light and dark sections; every control shows the outline. |

- **Rule** is the rule id, linked to its URL.
- **Where** is `file:line`, or a screen region when there is no source.
- **Finding** states the observed failure, not the matched string.
- **Fix and verification** names a change that addresses the observed failure and the test that shows it is gone on this surface.

After the table, add two short sections:

- **Deliberate exceptions**: places that break a rule on purpose, with the reason, so nobody "fixes" them later.
- **Not checked**: domains, states or themes you could not verify, such as motion from a static screenshot or a dark mode you did not render.

## Guardrails

- One finding per root cause. When one token causes ten violations, report the token once and list the places it affects.
- No taste as violation. Every finding cites a rule and identifies a failure on this surface or a measured failure against an applicable criterion. When no rule covers a concern, leave it out of the table or put it in a short "Observations" note.
- Do not edit code. When the user wants the fixes made, hand the report to `axiomui-website-upgrade` only if that skill is installed. If it is unavailable, keep this review read-only and provide the report as the checklist for a separate implementation task; do not assume a handoff occurred.

## Checklists

Each file lists every rule in one domain with its description, Do/Don't pair and the questions to ask in review.

{{checklistTable}}
