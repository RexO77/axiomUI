---
name: axiomui-website-upgrade
description: Changes an existing website, landing page, dashboard, SaaS product, or design system in code, using Axiom UI's rules as the standard. Use when an existing interface feels sloppy, generic, cluttered, flat, inconsistent, cramped, visually misaligned, unresponsive, hard to scan, or insufficiently polished; when asked to make a site look better, or to refine, fix, or polish its hierarchy, typography, spacing, components, forms, states, accessibility, responsive behavior, or motion; or when a critique should end in implemented changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Website upgrade playbook

Change an existing interface in code until it is correct, then until it is specific to its product. Work through the five steps in order; each ends on a done-when check. Rule ids such as `a11y-1` point into Axiom UI's rules; the rule lookup at the end says where each one's full reference lives. Open rules when a step sends you to them, not all at once.

## Step 1: Frame

1. Name the page's job and take its entry list from the table below. A page that mixes jobs takes the list for each region. When the request names a symptom instead ("feels cramped", "looks off on my phone"), start from the symptom list.
2. Capture the first screen at 1440×900 and at 390×844 before any edit. For each, write what a visitor sees, understands and can do first, and the vertical position of the main heading, the primary action and the first section heading. Step 4 compares against this baseline.
3. For a marketing or product page, name the headline's proof object before fixing anything: the screen, record or output of this product that shows the headline's claim coming true (for a monitoring tool, the alert that caught the outage; for a scheduler, the conflict it resolved). Build it from data the page already has. Step 3 makes room for it and step 4 checks it.
4. Write what must stay unchanged: content, brand, accepted flows. A flow that fails on a supported path, such as a code field that rejects paste or a submit button disabled with no reason, is in scope to fix; say so in the report. A request about one component or one symptom keeps the work to that region. Moving existing content to show the proof object is allowed. Brand means the brand's hue, type and voice; a gradient, glow or eyebrow wrapped around them is template chrome, not brand.

| Page job | Signs | Entry list |
|---|---|---|
| Marketing or product page | Hero, feature sections, pricing, sign-up | `comp-15` `comp-1` `typo-15` `typo-12` `layout-1` `layout-10` `layout-13` `layout-14` `comp-14` `comp-12` `sys-3` `motion-16` `a11y-7` `motion-29` `a11y-6` |
| Working tool or dashboard | Tables, filters, forms, saved state | `sys-15` `sys-16` `sys-1` `sys-2` `sys-10` `comp-9` `comp-8` `comp-1` `typo-7` `sys-8` `a11y-8` `form-15` |
| Article or docs | Long prose, headings, in-page links | `layout-2` `typo-3` `typo-11` `typo-6` `a11y-5` `a11y-7` `layout-12` `typo-8` `typo-13` |

Symptom list:

- Crowded: `layout-3` `layout-10` `layout-5` `comp-1`
- Flat or empty: `typo-9` `layout-10` `color-1` `color-12`
- Inconsistent: `layout-1` `typo-5` `comp-10` `color-10` `sys-5`
- Misaligned: `layout-4` `layout-6` `comp-3` `typo-7`
- Hard to scan: `layout-2` `typo-3` `typo-6` `a11y-5`
- Slow: `motion-1` `motion-6` `motion-29` `comp-9` `sys-1`
- Unsafe or confusing: `comp-2` `sys-6` `sys-16` `form-8` `form-15` `comp-8`
- Breaks on mobile: `sys-11` `layout-9` `layout-14` `typo-10` `sys-3`

Done when the job (or symptom) is named, both baseline captures and their notes exist, the proof object is named (marketing and product pages), and the keep-list is written.

## Step 2: Sweep

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

Then check each rule on the entry list against the page, using its Do and Don't.

Done when every detection has been searched, every match is confirmed or dropped, and every entry-list rule is marked passing or failing with the observation.

## Step 3: Fix

Fix in this order: structure (hierarchy, reading order, the proof object's place on the first screen, links and buttons, headings, reflow), then states (loading, empty, error, recovery, focus), then type and spacing, then motion. When one token or component causes several failures, fix it once at the source.

Open the rule's full reference before you change code when any of these hold:

- the fix sets a value the rule's Do and Don't do not already state (a duration, a ratio, a size, a breakpoint);
- the rule's description names a condition or exception ("when", "unless", "only", "beside other content");
- you are about to keep a violation as a deliberate exception;
- the finding is an accessibility conformance claim.

Otherwise the Do and Don't are enough. Reuse the project's tokens and components, and add no dependency for an effect the stack can already express; when a token contradicts a rule, flag the conflict instead of quietly rewriting the system.

Done when every confirmed failure is fixed or recorded as a deliberate exception with its reason, and its confirming test from step 2 now passes.

## Step 4: Elevate

Correct is the floor. This pass makes the page belong to its product. Run all four checks on marketing and product pages, and the first-screen check on every page.

1. First screen. Capture both sizes again and compare with the baseline. The visitor must see, understand and be able to do at least as much as before. Anything that was on the first screen at 390×844 (main heading, primary action, the evidence for the claim) stays there; if an edit pushed it down, recompose or revert that edit.
2. Evidence over decoration (`comp-15`). Point at the evidence for the headline. When it is floating avatars, abstract gradients or a generic dashboard, replace it with the product's own interface or output doing what the headline claims. A chart there carries the labels needed to read it (`comp-13`).
3. One distinctive detail. Find one thing only this product has (its real data, its vocabulary, its output, a signature interaction) and let it carry the first screen in place of template chrome such as eyebrow pills, numbered feature cards and icon grids.
4. Counterexample test, for every element you call generic or distinctive: swap in a competitor's name, reorder the numbered cards, remove the eyebrow. Keep what changes meaning when altered; cut or replace what does not. A generic element becomes a finding only through a rule; otherwise list it under observations.

Done when the after-captures exist, the first-screen comparison is one line per size, and every flagged element has passed or failed the counterexample test.

## Step 5: Verify

Look at the rendered interface; source inspection and a passing build are not verification.

1. Rerun every confirming test from step 2 on the final build.
2. Check 1440px, 390px and 320 CSS px (`sys-11`), with the longest real labels and densest data.
3. Tab through each changed flow: focus stays visible (`a11y-1`), overlays close on Escape and return focus (`a11y-8`).
4. Trigger loading, empty, error and success states where the page has them.
5. If the page animates, review each changed transition at 10% or 25% speed in the browser's animation tools (the Animations panel in Chrome DevTools), checking its origin, path and easing, then judge it again at full speed, where timing is felt. Repeat with reduced motion on (`motion-17`).
6. Run the repository's checks, if it has any, and read the final diff for accidental scope.

## Report

A markdown table with Before, After, Why and Rule columns, one row per material change. Then:

- the first-screen comparison at both sizes,
- the viewports and interactions verified, and the checks run,
- deliberate exceptions with their reasons,
- observations no rule covers, and remaining risks.

## Axiom UI rule lookup

Every rule id above is one of Axiom UI's 112 rules. Its description and Do/Don't are enough for the sweep; its full reference adds why it works, what breaks, implementation notes and review questions. This is the single-file copy of the skill, so the rules are online rather than beside it:

- Every rule's Do and Don't, in one JSON file: https://axiomui.nischal.fyi/rules.json
- One rule's full reasoning: https://axiomui.nischal.fyi/rules/<id>, for example https://axiomui.nischal.fyi/rules/typo-1

Read a rule's description and Do/Don't from the JSON file, open its page when step 3 calls for the full reference, and cite the rule id when you report the change. The index below lists every rule by domain for symptoms the entry lists miss. To keep the rule files offline, install the full skill with `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade`.

### Typography & text

- `typo-1` Use sentence case for English UI labels
- `typo-2` Letter spacing on caps
- `typo-3` Set body leading for sustained reading
- `typo-4` Fit leading to wrapped headings
- `typo-5` Give each typeface a job
- `typo-6` Keep secondary text at a readable size
- `typo-7` Align comparable numbers
- `typo-8` Align paragraphs to the reading start
- `typo-9` Assign font weights by role
- `typo-10` Preserve meaning when text overflows
- `typo-11` Choose a readable body size
- `typo-12` Balance short headings
- `typo-13` Review wrapping in short descriptions
- `typo-14` Keep names and counts together across scripts
- `typo-15` Tighten display tracking only until letters crowd

### Layout & spacing

- `layout-1` Use a shared spacing scale
- `layout-2` Set a measure for long-form text
- `layout-3` Show which items belong together
- `layout-4` Optically center asymmetric glyphs
- `layout-5` Size button padding around the label
- `layout-6` Anchor a row icon to the text it describes
- `layout-7` Choose a boundary that explains the group
- `layout-9` Adapt outer spacing to available width
- `layout-10` Use spacing to express vertical hierarchy
- `layout-11` Define stacking order within each context
- `layout-12` Keep scroll and focus targets clear of sticky headers
- `layout-13` Reserve space for media before it loads
- `layout-14` Keep the subject in the crop at every ratio

### Color & depth

- `color-1` Use accent color to mark priority
- `color-4` Make status colors dependable
- `color-6` Give essential control edges enough contrast
- `color-7` Keep hover feedback distinct from a result
- `color-8` Design the dark palette by role
- `color-9` Accessible contrast ratios
- `color-10` Give state colors a shared source
- `color-11` Define image edges when they disappear
- `color-12` Use elevation when a surface is raised

### Components & actions

- `comp-1` Prioritize the next action
- `comp-2` Confirm irreversible deletion
- `comp-3` Align nested corner radii
- `comp-4` Distinguish people from content
- `comp-5` Choose a surface for the task
- `comp-6` Place field errors beside the field
- `comp-7` Label ambiguous actions
- `comp-8` Explain unavailable actions
- `comp-9` Acknowledge a pending submission
- `comp-10` Match icon scale within a toolbar
- `comp-11` Size a card’s primary link
- `comp-12` Make overlay dismissal discoverable
- `comp-13` Make the chart’s question answerable in text
- `comp-14` Navigate with links, act with buttons
- `comp-15` Show the product doing what the headline promises

### Forms & inputs

- `form-1` Keep labels close to their fields
- `form-2` Keep field labels visible
- `form-3` Make required and optional choices clear
- `form-4` Match field width to plausible answers
- `form-5` Match selection controls to the choice
- `form-6` Expose alternatives worth comparing
- `form-7` Match the control to when the change takes effect
- `form-8` Validate when a correction is useful
- `form-9` Show format constraints before entry
- `form-10` Give the form one clear reading order
- `form-11` Reuse answers the user has supplied
- `form-12` Confirm the outcome of a submission
- `form-13` Accept a complete sign-in code in one paste
- `form-14` Declare what each field expects
- `form-15` Keep entered answers when validation fails

### System & logic

- `sys-1` Choose a loading state that explains the wait
- `sys-2` Explain why a view is empty
- `sys-3` Size the hit area for the input
- `sys-4` Choose a timestamp for the question
- `sys-5` Reference colors by role, not by value
- `sys-6` Make reversible deletion recoverable
- `sys-7` Orient people in a multi-step flow
- `sys-8` Follow the keyboard model for each control
- `sys-9` Reconcile optimistic changes
- `sys-10` Recover at the point of failure
- `sys-11` Keep the task usable at 320 CSS pixels
- `sys-13` Limit transitions to intended properties
- `sys-15` Return people to the result they opened
- `sys-16` Keep errors and the only recovery action on screen

### Motion & interaction

- `motion-1` Animate by frequency
- `motion-2` Keep keyboard input responsive
- `motion-3` Purpose before motion
- `motion-4` Choose easing for the movement
- `motion-6` Time motion to the task
- `motion-7` Tune entrance and exit separately
- `motion-8` Show when a control is pressed
- `motion-9` Keep surface entrances near full size
- `motion-10` Anchor a popover’s motion to its trigger
- `motion-11` Share tooltip timing across a toolbar
- `motion-12` Retarget interrupted motion from its current position
- `motion-13` Give new elements a starting style
- `motion-14` Choose animation properties with layout in mind
- `motion-15` Size slide exits to the moving element
- `motion-16` Gate decorative hover motion
- `motion-17` Preserve feedback with reduced motion
- `motion-18` Use release direction and speed for swipe dismissal
- `motion-19` Use drag resistance where overshoot is meaningful
- `motion-20` Keep a drag attached to its initiating pointer
- `motion-21` Keep decorative motion independent of busy scripts
- `motion-24` Limit the total stagger
- `motion-28` Make icon state changes recognizable
- `motion-29` Show the initial interface in its ready state

### Accessibility & inclusivity

- `a11y-1` Keep keyboard focus visible
- `a11y-2` Carry meaning beyond color
- `a11y-3` Separate competing touch targets
- `a11y-4` Offer a click or tap path for every drag
- `a11y-5` Choose heading levels by outline, not size
- `a11y-6` Let people pause what moves or updates on its own
- `a11y-7` Underline links in running text
- `a11y-8` Return focus when an overlay closes
