# Axiom UI audit

Review an interface against Axiom UI's {{ruleCount}} UI design rules and report what is wrong, where it is, and how to fix it. Leave the code unchanged.

## Procedure

1. Set the scope. Name the page or component, its main task and what you will review. If the request is vague, audit the primary path first and say so.
2. Gather evidence. Review the rendered interface and its source when available. Computed styles, tokens and component code can explain a visible failure. With only a screenshot, skip the source searches and say so in the report.
3. Run the sweep below as a starting point.
4. Choose the domains. Pick the checklists below that the surface exercises. A form needs forms, components and accessibility at minimum. Anything that moves needs motion.
5. Walk the checklist. For each item, look for a concrete violation and record it with evidence: a file and line, a measured value, or a screen region. Skip items that do not apply, and never report a passing item as a finding.
6. Check the rule's conditions before every finding. Read its description in the checklist, and open its file under `references/rules/` whenever the description names a condition or exception, the fix sets a value, or the finding is a conformance claim. The "What breaks" section describes what can go wrong. Report the impact you observed and identify what still needs testing.
7. Assign a severity from the scale below.
8. Report in the format below.

For motion, watch each transition at 10% or 25% speed in the browser's animation tools to check its origin, path and easing, then try the interaction at full speed to check whether it delays the next action.

## Sweep

{{sweep}}

## Severity

- **Blocker**: the task cannot be completed on a supported path, or a verified failure prevents meeting the applicable WCAG A or AA conformance target. For a WCAG blocker, name the criterion and the conditions you tested.
- **Major**: the task is still possible, but a problem on the primary path slows people down or leaves the next step unclear.
- **Minor**: a visible or interaction problem that leaves the task easy to complete.
- **Nit**: a small deviation with no user impact on its own.

## Report format

Sort findings by severity. Within each severity, prioritize failures that occur earlier on the primary path or affect more people.

| # | Severity | Rule | Where | Finding | Fix and verification |
|---|---|---|---|---|---|
| 1 | Blocker | [a11y-1](https://axiomui.nischal.fyi/rules/a11y-1) | `src/app/globals.css:14` | `*:focus { outline: none }` has no replacement. Tabbing from the address bar reaches Pricing, Sign in and Start trial with no visible indicator (WCAG 2.4.7, AA). | Replace it with `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px }`. Verify: Tab through the header and the sign-up form on light and dark sections; every control shows the outline. |

- **Rule** is the rule ID, linked to its URL.
- **Where** is `file:line`, or a screen region when there is no source.
- **Finding** states the observed failure, not the matched string.
- **Fix and verification** gives the proposed change and the test that shows it resolves the failure.

After the table, add two short sections:

- **Deliberate exceptions**: places that break a rule on purpose, with the reason, so nobody "fixes" them later.
- **Not checked**: domains, states or themes you could not verify, such as motion from a static screenshot or a dark mode you did not render.

## Guardrails

- One finding per root cause. When one token causes ten violations, report the token once and list the places it affects.
- Cite a rule for each finding and describe the observed problem or the measurement that failed the criterion. When no rule covers a concern, leave it out of the table or put it in a short "Observations" note.
- Do not edit code. When the user wants the fixes made, hand the report to `axiomui-website-upgrade` only if that skill is installed. If it is unavailable, keep this review read-only and provide the report as the checklist for a separate implementation task; do not assume a handoff occurred.

## Checklists

Each file lists every rule in one domain with its description, Do/Don’t pair and the questions to ask in review.

{{checklistTable}}
