---
name: axiom-website-upgrade
description: Use Axiom UI’s rules to improve an existing website, dashboard or design system in code. Choose this skill to improve a generic page, fix a cramped layout, clarify forms and states, or improve hierarchy, typography, spacing, components, accessibility, responsive behavior or motion. Use it when a review should end in code changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Website upgrade playbook

Use these five steps to improve an existing interface in code. When a step calls for a full rule, find its ID in the lookup at the end (for example, `a11y-1`).

## Step 1: Frame

1. Identify the page’s main task and use its entry list below. If different regions serve different tasks, use the list for each. When the request names a symptom instead ("feels cramped", "looks off on my phone"), start from the symptom list.
2. Capture the first screen at 1440 × 900px and 390 × 844px before any edit. For each, write what a visitor sees, understands and can do first, and the vertical position of the main heading, the primary action and the first section heading. Step 4 compares against this baseline.
3. For a marketing or product page, identify the evidence for the headline before editing. A monitoring tool could show the alert that caught an outage. A scheduler could show the conflict it resolved. Use data the page already has. Step 3 makes room for it and step 4 checks it.
4. Write what must stay unchanged: content, brand, accepted flows. Fix supported paths within the requested flow, such as a code field that rejects paste. Report what failed. When the request names one component or symptom, keep edits within that region, including any content you move to support the headline. Check the brand guidelines or existing product screens before removing a gradient, glow or label above a heading.

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
- Breaks on mobile: `mobile-1` `mobile-2` `sys-11` `layout-9` `layout-14` `typo-10` `sys-3`

Done when you have named the task or symptom, captured and annotated both screen sizes, and listed what to preserve. For marketing and product pages, identify the evidence for the headline.

## Step 2: Sweep

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

Then check each rule on the entry list against the page, using its Do and Don’t examples.

Done when you have run the searches and visual checks, confirmed or dismissed each match, and recorded a result for each applicable rule on the entry list. Identify any check you could not run.

## Step 3: Fix

Fix in this order: structure (hierarchy, reading order, where the evidence for the headline appears on the first screen, links and buttons, headings, reflow), then states (loading, empty, error, recovery, focus), then type and spacing, then motion. When one token or component causes several failures, fix it once at the source.

Open the rule's full reference before you change code when any of these hold:

- the fix needs a value neither the Do nor the Don’t example gives (a duration, a ratio, a size, a breakpoint);
- the rule's description names a condition or exception ("when", "unless", "only", "beside other content");
- you are about to keep a violation as a deliberate exception;
- the finding is an accessibility conformance claim.

Otherwise the Do and Don’t examples are enough. Reuse the project's tokens and components, and add no dependency for an effect the stack can already express; when a token contradicts a rule, flag the conflict instead of quietly rewriting the system.

Done when each fix passes its step 2 check and each deliberate exception has a recorded reason.

## Step 4: Check the first screen

Run the first-screen check on every page. On marketing and product pages, run all four checks.

1. First screen. Capture both sizes again and compare with the baseline. The visitor must see, understand and be able to do at least as much as before. If an edit pushed the main heading, primary action or evidence for the headline off the first screen at 390 × 844px, adjust the layout or revert the edit.
2. Evidence over decoration (`comp-15`). Find the evidence you named in step 1. If the headline relies on floating avatars, abstract gradients or a generic dashboard, show the product delivering its claim. For a chart, state the comparison in text and offer accessible values when readers need them (`comp-13`).
3. One distinctive detail. Find one thing only this product has (its real data, its vocabulary, its output, a signature interaction) and let it carry the first screen in place of template chrome such as eyebrow pills, numbered feature cards and icon grids.
4. Counterexample test, for every element you call generic or distinctive: swap in a competitor's name, reorder the numbered cards, remove the eyebrow. Record what the change reveals about the element. Remove or replace it when a rule explains the problem. List other concerns under observations.

Done when the after-captures exist, the first-screen comparison is one line per size, and every flagged element has passed or failed the counterexample test.

## Step 5: Verify

Look at the rendered interface; source inspection and a passing build are not verification.

1. Rerun every confirming test from step 2 on the final build.
2. Check 1440px, 390px and 320 CSS pixels (`sys-11`), with the longest real labels and densest data.
3. Tab through each changed flow: focus stays visible (`a11y-1`), dismissible dialogs close on Escape (`comp-12`) and return focus to the opener or the next logical control (`a11y-8`).
4. Trigger loading, empty, error and success states where the page has them.
5. If the page animates, review each changed transition at 10% or 25% speed in the browser's animation tools (the Animations panel in Chrome DevTools), checking its origin, path and easing, then try the interaction at full speed to check whether it delays the next action. Repeat with reduced motion on (`motion-17`).
6. Run the repository’s checks, if it has any. Review the final diff for changes outside the request and record any failed or untested checks in the report.

## Report

A Markdown table with Before, After, Why and Rule columns, one row per material change. Then:

- the first-screen comparison at both sizes,
- the viewports and interactions verified, and the checks run,
- deliberate exceptions with their reasons,
- observations no rule covers, and remaining risks.

## Axiom UI rule lookup

Every rule ID above is one of Axiom UI's 138 rules. Its description and Do and Don’t examples are enough for the sweep; its full reference adds why it works, what breaks, implementation notes and a Before you ship checklist. This is the single-file copy of the skill, so the rules are online rather than beside it:

- Every rule’s Do and Don’t examples in one JSON file: https://axiomui.nischal.fyi/rules.json
- One rule's full reasoning: https://axiomui.nischal.fyi/rules/<id>, for example https://axiomui.nischal.fyi/rules/typo-1

Read a rule's description and Do and Don’t examples from the JSON file, open its page when step 3 calls for the full reference, and cite the rule ID when you report the change. The index below lists every rule by domain for symptoms the entry lists miss. To keep the rule files offline, install the full skill with `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade`.

### Typography & text

- `typo-1` Use sentence case for English UI labels
- `typo-2` Check letter spacing on uppercase labels
- `typo-3` Set line height for paragraphs
- `typo-4` Set line height for wrapped headings
- `typo-5` Give each typeface a job
- `typo-6` Keep secondary text at a readable size
- `typo-7` Line up amounts in a column
- `typo-8` Align paragraphs to their starting edge
- `typo-9` Assign font weights by role
- `typo-10` Keep long filenames readable in tight rows
- `typo-11` Choose a readable body size
- `typo-12` Balance short headings
- `typo-13` Avoid a lone last word in short descriptions
- `typo-14` Isolate names in mixed-direction text
- `typo-15` Stop tightening headline letters before they touch

### Layout & spacing

- `layout-1` Use a shared spacing scale
- `layout-2` Limit the width of long paragraphs
- `layout-3` Show which items belong together
- `layout-4` Center the icon by eye
- `layout-5` Size button padding around the label
- `layout-6` Align a row icon with the first line of text
- `layout-7` Group related details before adding borders
- `layout-9` Reduce outer padding when space is tight
- `layout-10` Use larger gaps between sections
- `layout-11` Check the stacking context before raising z-index
- `layout-12` Keep scroll and focus targets clear of sticky headers
- `layout-13` Reserve space for media before it loads
- `layout-14` Keep the subject in the crop at every ratio

### Color & depth

- `color-1` Use accent color to mark priority
- `color-4` Use status colors consistently
- `color-6` Give essential control edges at least 3:1 contrast
- `color-7` Keep hover distinct from success
- `color-8` Design the dark palette by role
- `color-9` Check text contrast
- `color-10` Derive state fills from one color
- `color-11` Outline images that blend into the page
- `color-12` Use shadows to show depth

### Components & actions

- `comp-1` Prioritize the next action
- `comp-2` Confirm irreversible deletion
- `comp-3` Align nested corner radii
- `comp-4` Distinguish people from content
- `comp-5` Choose a dialog, side panel or full page
- `comp-6` Show each error under its field
- `comp-7` Label ambiguous actions
- `comp-8` Explain unavailable actions
- `comp-9` Show when a submission is in progress
- `comp-10` Match the size of related toolbar icons
- `comp-11` Make a one-link card clickable throughout
- `comp-12` Show how to close a dialog
- `comp-13` State the chart’s main finding in words
- `comp-14` Navigate with links, act with buttons
- `comp-15` Show the product doing what the headline promises

### Forms & inputs

- `form-1` Stack labels when space is tight
- `form-2` Keep field labels visible
- `form-3` Mark optional fields
- `form-4` Size fields for the expected answer
- `form-5` Match selection controls to the choice
- `form-6` Show options people need to compare
- `form-7` Use switches for changes that apply immediately
- `form-8` Show format errors on submission
- `form-9` Show the expected format before typing
- `form-10` Give the form one clear reading order
- `form-11` Reuse answers from earlier steps
- `form-12` Confirm what was saved
- `form-13` Accept a one-time code in one paste
- `form-14` Declare what each field expects
- `form-15` Keep entered answers when validation fails

### System & logic

- `sys-1` Choose a loading state that explains the wait
- `sys-2` Explain why a view is empty
- `sys-3` Give small icons a larger hit area
- `sys-4` Use relative time for activity, dates for records
- `sys-5` Reference colors by role, not by value
- `sys-6` Let people restore deleted items
- `sys-7` Show the current step in a multi-step flow
- `sys-8` Use the keys people expect for each control
- `sys-9` Show changes before the server confirms them
- `sys-10` Contain a failure to the part that failed
- `sys-11` Keep the task usable at 320 CSS pixels
- `sys-13` Limit transitions to intended properties
- `sys-15` Return people to the result they opened
- `sys-16` Keep errors and the only recovery action on screen

### Motion & interaction

- `motion-1` Shorten entrances for frequent actions
- `motion-2` Focus the palette field on open
- `motion-3` Use motion to show what changed
- `motion-4` Ease out when a panel needs to settle early
- `motion-6` Match duration to travel distance
- `motion-7` Tune entrance and exit separately
- `motion-8` Show when a control is pressed
- `motion-9` Start panels near full size
- `motion-10` Anchor a popover’s motion to its trigger
- `motion-11` Delay only the first hover tooltip in a toolbar
- `motion-12` Reverse motion from its current position
- `motion-13` Give new elements a starting style
- `motion-14` Use a transform when neighbors can stay in place
- `motion-15` Base slide exits on the element’s height
- `motion-16` Show hover effects only where hover exists
- `motion-17` Preserve feedback with reduced motion
- `motion-18` Let a quick flick dismiss a card
- `motion-19` Add resistance past a drag limit
- `motion-20` Keep tracking the pointer that started the drag
- `motion-21` Keep decorative motion independent of busy scripts
- `motion-24` Cap the total stagger time
- `motion-28` Make icon state changes recognizable
- `motion-29` Show ready controls on first paint

### Accessibility & inclusivity

- `a11y-1` Keep keyboard focus visible
- `a11y-2` Pair color with another cue
- `a11y-3` Leave space between touch targets
- `a11y-4` Offer a click or tap alternative to dragging
- `a11y-5` Choose heading levels by outline, not size
- `a11y-6` Let people pause what moves or updates on its own
- `a11y-7` Underline links in paragraphs
- `a11y-8` Return focus when a dialog closes

### Mobile

- `mobile-1` Keep controls inside the safe area
- `mobile-2` Fit the page above browser bars
- `mobile-3` Give corner targets more room
- `mobile-4` Bring repeated actions within reach
- `mobile-5` Let a scroll cancel a press
- `mobile-6` Give single taps an immediate action
- `mobile-7` Show the main destinations
- `mobile-8` Keep each tab’s place
- `mobile-9` Close the sheet before leaving
- `mobile-10` Commit Back when the gesture finishes
- `mobile-11` Fit navigation to the window
- `mobile-12` Start drags clear of system gestures
- `mobile-13` Let vertical swipes scroll the page
- `mobile-14` Expose actions hidden behind gestures
- `mobile-15` Use flick speed to choose a stop
- `mobile-16` Keep panel scrolling inside the panel
- `mobile-17` Keep list flicks from dismissing sheets
- `mobile-18` Make the last sheet option reachable
- `mobile-19` Apply multiple filters together
- `mobile-20` Keep iPhone field text legible
- `mobile-21` Keep the caret above the keyboard
- `mobile-22` Follow the reader’s text size
- `mobile-23` Let rows grow with enlarged text
- `mobile-24` Keep values visible above the finger
- `mobile-25` Show confirmation when haptics are off
- `mobile-26` Keep Undo clear of floating buttons
