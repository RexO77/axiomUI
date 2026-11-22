# Preserve feedback with reduced motion

- ID: motion-17
- Category: Motion & interaction
- Tags: Accessibility, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-17

When reduced motion is on, remove unnecessary travel, zoom and spin. Keep the result visible with a label or icon.

- Do: With reduced motion, the toast fades in place
- Don’t: With reduced motion, the toast still slides up

## Why it works

Large movements can cause discomfort. A confirmation toast can fade in place and still show that the action succeeded. WCAG 2.3.3 (Level AAA) requires a way to disable nonessential motion triggered by interaction.

- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Media Queries Level 5 · Reduced motion preference](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)
- [Apple · Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

## What breaks

If success appears only as an animated checkmark, removing the animation can erase the confirmation. Keep a message or icon visible after the fade.

## How to apply it

1. Build the final state first. Add movement inside @media (prefers-reduced-motion: no-preference).
2. Use @media (prefers-reduced-motion: reduce) in CSS and matchMedia("(prefers-reduced-motion: reduce)") for scripted animations.
3. Preserve status announcements for results that assistive technology should report.

## Before you ship

1. With motion reduced, what tells the user the action succeeded?
2. Do both CSS and JavaScript honor a preference change?
3. Which movements are essential to the information or function?
