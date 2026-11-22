# Explain unavailable actions

- ID: comp-8
- Category: Components & actions
- Tags: States, Tooltips, Clarity
- URL: https://axiomui.nischal.fyi/rules/comp-8

When people are likely to try a disabled control, explain beside it what would make it available.

- Do: “Available on the Pro plan” below Export CSV
- Don’t: Disabled + no reason

## Why it works

Export CSV might be disabled because the plan excludes it, nothing is selected or an export is running. Keyboard users skip native disabled buttons when tabbing, so a tooltip on the button can go unseen.

- [GitLab Pajamas · Disabled buttons](https://design.gitlab.com/components/button/#disabled)
- [WAI-ARIA APG · Focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols)
- [GOV.UK · Button emphasis and usage](https://design-system.service.gov.uk/components/button/)
- [MDN · aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)
- [GitHub Primer · Tooltip accessibility](https://primer.style/product/components/tooltip/accessibility/)

## What breaks

Without an explanation, people may look for a missing selection. “Available on the Pro plan” tells them why Export CSV is disabled.

## How to apply it

1. Keep the reason visible beside the disabled control.
2. When a form can explain errors on submission, consider keeping Submit available so people can find out what needs fixing.
3. If you use `aria-disabled` to keep a control focusable, block activation in its handler. Check mouse, keyboard and touch.

## Before you ship

1. Is the cause apparent before trying the control?
2. Does the explanation say what can change the state?
3. Can keyboard and touch users find it?
