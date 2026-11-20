# Preserve feedback with reduced motion

- ID: motion-17
- Category: Motion & interaction
- Tags: Accessibility, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-17

Honor reduced motion by removing unnecessary travel, zoom and spin. Show the resulting state through a stable label, icon or other persistent cue.

- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway

## Why it works

Large movement can cause discomfort for some users. A message can arrive at its final location immediately and still communicate that an action succeeded. WCAG 2.3.3, a Level AAA criterion, addresses the ability to disable interaction-triggered motion animation unless it is essential.

- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## What breaks

Removing an animated checkmark without leaving a result can make a successful action indistinguishable from one that failed. An opacity change alone may also be too subtle to carry the message.

## How to apply it

1. Start with the final content and add movement only when appropriate.
2. Honor the reduced-motion preference in CSS and scripted animations.
3. Preserve status announcements for results that assistive technology should report.

## Review questions

1. With motion reduced, what tells the user the action succeeded?
2. Do both CSS and JavaScript honor a preference change?
3. Which movements are essential to the information or function?
