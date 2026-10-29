# Reduced motion still has intent

- ID: motion-17
- Category: Motion & interaction
- Tags: Accessibility, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-17

Reduced motion should remove movement while preserving helpful feedback through opacity, color, or immediate state changes.

- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway

## Why it works

prefers-reduced-motion exists for vestibular disorders under WCAG 2.3.3, where large or spinning movement can trigger real physical symptoms, not just annoyance. The fix is not silence: users still need to know a state changed, so opacity, color, or instant swaps carry that signal instead of translation or scaling. Fading in place preserves the feedback loop while removing the motion that causes harm.

## What breaks

A user with the OS setting enabled toggles a control and sees nothing happen because the animation was stripped with no fallback, leaving them unsure if the action registered.

## How to apply it

1. Wrap movement-based transitions in a prefers-reduced-motion: reduce check and swap in opacity-only fades.
2. Never let @media (prefers-reduced-motion: reduce) strip the feedback down to nothing.
3. Replace slides and scales with instant or near-instant state changes plus a color or opacity cue.
4. Test every animated component with the OS reduced-motion setting toggled on.

## Review questions

1. With reduced motion enabled, does the interface still confirm the action happened?
2. Is movement removed while opacity or color feedback remains?
3. Does no component silently do nothing when reduced motion is on?
