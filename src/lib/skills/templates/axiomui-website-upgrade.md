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

{{sweep}}

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

{{ruleLookup}}
