# Explain unavailable actions

- ID: comp-8
- Category: Components & actions
- Tags: States, Tooltips, Clarity
- URL: https://axiomui.nischal.fyi/rules/comp-8

When someone might reasonably try an unavailable action, explain the prerequisite beside it. A disabled button alone gives no indication of what to do next.

- Do: Disabled + reason under the button
- Don't: Disabled + no reason

## Why it works

A disabled Export button may mean the selection is empty, the user lacks permission, or a request is still running. Each state calls for a different response. Native disabled buttons normally leave the tab sequence, so a tooltip attached only to the button is easy to miss.

- [GOV.UK · Button emphasis and usage](https://design-system.service.gov.uk/components/button/)
- [WAI-ARIA APG · Focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols)

## What breaks

“Not available” leaves someone hunting through a form. “Select at least one row to export” points to an action they can take.

## How to apply it

1. Prefer a persistent explanation at the point of need.
2. When the user can submit and then correct errors, consider leaving the action available and explaining the errors on submission.
3. If using aria-disabled to retain focusability, suppress activation in the handler and check every input method.

## Review questions

1. Is the cause apparent before trying the control?
2. Does the explanation say what can change the state?
3. Can keyboard and touch users find it?
