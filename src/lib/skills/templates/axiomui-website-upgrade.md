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

{{sweep}}

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

{{ruleLookup}}
