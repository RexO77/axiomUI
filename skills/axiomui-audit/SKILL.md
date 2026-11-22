---
name: axiomui-audit
description: Reviews an existing interface against Axiom UI's 112 UI design rules and reports prioritized findings, each tied to a rule ID, a location, and a concrete fix, without editing code. Use when asked to review, audit, critique, or grade a page, component, pull request diff, screenshot, or design system for visual quality, consistency, usability, or accessibility; when preparing a pre-ship design QA pass; or when a review must cite specific, checkable rules instead of opinions. For code changes, use axiomui-website-upgrade only if it is installed; otherwise provide the report for a separate implementation task.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI audit

Review an interface against Axiom UI's 112 UI design rules and report what is wrong, where it is, and how to fix it. Leave the code unchanged.

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

Work through the checks in order. Confirm each source match on the rendered page. Report the failure you saw, such as "Tab reaches Pricing with no visible indicator". Drop matches that pass and record checks you could not run.

1. `a11y-1` focus. Search: `outline: none`, `outline-none` or `outline-hidden` with no `:focus-visible` or `focus-visible:` style on the same element. Confirm: Tab through the page; a focused control with no visible indicator is the finding.
2. `sys-11` zoom and reflow. Search: `user-scalable=no` or `maximum-scale=1` in the viewport meta, fixed `min-width` on page wrappers. Confirm: at 320 CSS pixels wide (or 400% zoom at 1280px), the page scrolls sideways or clips the primary action, or pinch zoom is blocked on a phone.
3. `layout-13` media space. Search: `<img`, `<video`, `<iframe` or a background-image box with no `width` and `height` and no `aspect-ratio`. Confirm: reload with the network throttled; content below the media moves when it arrives.
4. `comp-14` links and buttons. Search: `onClick` with `router.push`, `navigate(` or `location.href` on a `div`, `span` or `button`. Confirm: for a control whose primary purpose is opening another URL, try Open in new tab from its context menu. Report when that link action is missing. A button that performs an action first and then redirects, such as Save opening the saved invoice, passes.
5. `layout-12` sticky clearance. Search: a `sticky` or `fixed` header with no `scroll-padding-top` (or `scroll-margin-top` on targets). Confirm: follow an in-page link and Tab to a field below the fold; the target or its focus ring lands under the header.
6. `sys-16` errors on screen. Search: `toast(`, `duration`, `autoHideDuration` or `setTimeout` closing an error, Undo or Retry message. Confirm: force a failure; the message or its only recovery action disappears before you act.
7. `sys-15` return to results. Search: filters, sort, search or page number held in `useState` with no URL query sync. Confirm: apply a filter and sort, scroll down and open an item (for example, item 30). Press Back. The item should be in view with the same query, filters and sort order.
8. `form-14` input purpose. Search: `type="number"` on codes, phone or card numbers; `<input` without `autocomplete` on name, email, address, phone or one-time-code fields. Confirm: on a phone, check the keyboard. Test autofill with a matching saved value and autofill enabled. If it fails, inspect the field’s input type, input mode and autocomplete value.
9. `a11y-7` links in prose. Search: `no-underline` or `text-decoration: none` on links inside paragraphs. Confirm: if color alone identifies the link, measure its contrast against the surrounding text. Below 3:1 fails the G183 check.
10. `a11y-5` heading outline. Search: heading tags chosen for size, such as an `h4` under an `h1` with no `h2`. Confirm: the browser's heading outline (or the accessibility tree) skips a level or orders sections wrongly.
11. `typo-15` display tracking. Search: `tracking-tighter`, `tracking-[-0.04em]` or tighter, `letter-spacing: -0.04em` or tighter on headings. Confirm: at the displayed size and weight, check whether neighboring letters touch or become hard to tell apart.
12. `typo-8` paragraph alignment. Search: `text-center` or `text-align: center` on paragraphs. Confirm: for centered prose that wraps to three lines or more, compare start alignment at the same width. Report where shifting line starts make the passage hard to follow.
13. `sys-13` transition scope. Search: `transition-all`, `transition: all` or a `transition` shorthand with no property. Confirm: changing theme, size or layout animates something nobody intended to move.

Check the first screen and one in-scope flow for the following failures. With only a screenshot, record which interactions and states you could not test.

- `typo-1` casing. Check the capitalization of each button label, link and heading. In an English interface, Title Case on ordinary labels ("Start Monitoring", "Sign In") is the finding; product names and acronyms keep their spelling.
- `comp-7` control names. Inspect each icon-only control’s accessible name. A missing name or an unclear icon without a visible label is the finding. For controls with visible text, check that the accessible name includes the label.
- `color-9` and `color-6` contrast. Measure body text, secondary text, placeholders and hints against their rendered backgrounds, including gradients and images. For text covered by the rule, contrast below 4.5:1 (3:1 for large text) is the finding. For an enabled, author-styled control, check for 3:1 contrast only where its boundary identifies it.
- `form-2` labels. Type into every field. A label that disappears while typing, or a placeholder doing a label's job, is the finding.
- `a11y-2` color-only meaning. View the page in grayscale. A status, error or category that is no longer distinguishable is the finding.
- `comp-15` and `color-1` template chrome. On a page with a product claim, identify the screen or output that supports the headline. Swap in a competitor’s name or reorder decorative 01/02/03 cards. If the decoration still fits and offers no evidence, recommend product evidence to replace it. Check whether the strongest accent draws attention to the priority in its group.

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

| Domain | Rules | Checklist |
|---|---|---|
| Typography & text | 15 | `references/checklists/typography.md` |
| Layout & spacing | 13 | `references/checklists/layout.md` |
| Color & depth | 9 | `references/checklists/color.md` |
| Components & actions | 15 | `references/checklists/components.md` |
| Forms & inputs | 15 | `references/checklists/forms.md` |
| System & logic | 14 | `references/checklists/system.md` |
| Motion & interaction | 23 | `references/checklists/motion.md` |
| Accessibility & inclusivity | 8 | `references/checklists/accessibility.md` |
