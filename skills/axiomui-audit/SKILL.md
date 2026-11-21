---
name: axiomui-audit
description: Reviews an existing interface against Axiom UI's 112 UI design rules and reports prioritized findings, each tied to a rule id, a location, and a concrete fix, without editing code. Use when asked to review, audit, critique, or grade a page, component, pull request diff, screenshot, or design system for visual quality, consistency, usability, or accessibility; when preparing a pre-ship design QA pass; or when a review must cite specific, checkable rules instead of opinions. For code changes, use axiomui-website-upgrade only if it is installed; otherwise provide the report for a separate implementation task.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI audit

Review an interface against Axiom UI's 112 UI design rules and report what is wrong, where it is, and how to fix it. This skill reviews. It does not edit code.

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

Run these detections in order, highest user impact first. A source match is a lead, not a finding: reproduce the failure in the rendered page before you report or fix it, and drop any match that does not fail there. Record the confirming observation, such as "Tab reaches Pricing with no visible indicator", not the matched string.

1. `a11y-1` focus. Search: `outline: none`, `outline-none` or `outline-hidden` with no `:focus-visible` or `focus-visible:` style on the same element. Confirm: Tab through the page; a focused control with no visible indicator is the finding.
2. `sys-11` zoom and reflow. Search: `user-scalable=no` or `maximum-scale=1` in the viewport meta, fixed `min-width` on page wrappers. Confirm: at 320 CSS px wide (or 400% zoom at 1280px), the page scrolls sideways or clips the primary action, or pinch zoom is blocked on a phone.
3. `layout-13` media space. Search: `<img`, `<video`, `<iframe` or a background-image box with no `width` and `height` and no `aspect-ratio`. Confirm: reload with the network throttled; content below the media moves when it arrives.
4. `comp-14` links and buttons. Search: `onClick` with `router.push`, `navigate(` or `location.href` on a `div`, `span` or `button`. Confirm: Cmd- or middle-click the control; it does not open in a new tab, or hovering it shows no URL.
5. `layout-12` sticky clearance. Search: a `sticky` or `fixed` header with no `scroll-padding-top` (or `scroll-margin-top` on targets). Confirm: follow an in-page link and Tab to a field below the fold; the target or its focus ring lands under the header.
6. `sys-16` errors on screen. Search: `toast(`, `duration`, `autoHideDuration` or `setTimeout` closing an error, Undo or Retry message. Confirm: force a failure; the message or its only recovery action disappears before you act.
7. `sys-15` return to results. Search: filters, sort, search or page number held in `useState` with no URL query sync. Confirm: filter, scroll, open item 30 or later, press Back; the query or the scroll position is lost.
8. `form-14` input purpose. Search: `type="number"` on codes, phone or card numbers; `<input` without `autocomplete` on name, email, address, phone or one-time-code fields. Confirm: on a phone, the wrong keyboard opens or autofill offers nothing.
9. `a11y-7` links in prose. Search: `no-underline` or `text-decoration: none` on links inside paragraphs. Confirm: a link in running text is distinguishable by color alone.
10. `a11y-5` heading outline. Search: heading tags chosen for size, such as an `h4` under an `h1` with no `h2`. Confirm: the browser's heading outline (or the accessibility tree) skips a level or orders sections wrongly.
11. `typo-15` display tracking. Search: `tracking-tighter`, `tracking-[-0.04em]` or tighter, `letter-spacing: -0.04em` or tighter on headings. Confirm: at the shipped size and weight, neighbouring glyphs touch or counters close.
12. `typo-8` paragraph alignment. Search: `text-center` or `text-align: center` on paragraphs. Confirm: a centered passage wraps to three lines or more at any tested width.
13. `sys-13` transition scope. Search: `transition-all`, `transition: all` or a `transition` shorthand with no property. Confirm: changing theme, size or layout animates something nobody intended to move.

Then look at the rendered first screen and one working flow for what no search finds reliably. Each of these is mandatory, and each confirmed failure is a finding:

- `typo-1` casing. Read every button, link and heading aloud. In an English interface, Title Case on ordinary labels ("Start Monitoring", "Sign In") is the finding; product names and acronyms keep their spelling.
- `comp-7` control names. Hover or inspect every icon-only control. A control with no visible label and no accessible name, or a name that differs from its visible text, is the finding.
- `color-9` and `color-6` contrast. Measure body text, secondary text, placeholder-looking hints and essential control edges on their actual surfaces, including text over gradients or images. Text below 4.5:1 (3:1 for large text) or a field edge below 3:1 is the finding.
- `form-2` labels. Type into every field. A label that disappears while typing, or a placeholder doing a label's job, is the finding.
- `a11y-2` color-only meaning. View the page in grayscale. A status, error or category that is no longer distinguishable is the finding.
- `comp-15` and `color-1` template chrome. List the decoration on the first screen: gradient hero, glow, emoji or icon-tile feature grids, decorative 01/02/03 numbering, a generic eyebrow. Swap in a competitor's name and reorder the cards. Whatever still fits unchanged says nothing about this product; replace it with the product's own evidence or remove it, and keep accent color for the one thing that needs priority.

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
