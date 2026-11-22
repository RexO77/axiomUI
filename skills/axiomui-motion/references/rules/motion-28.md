# Make icon state changes recognizable

- ID: motion-28
- Category: Motion & interaction
- Tags: Icons, States
- URL: https://axiomui.nischal.fyi/rules/motion-28

When an icon changes, keep the new icon recognizable as it appears and at rest. Swap it instantly or crossfade without blur.

- Do: New icon stays sharp as it appears
- Don’t: Blur hides the new icon’s shape

## Why it works

Two glyphs in one stable slot can communicate a state change without shifting the label or pointer target. In the matched crossfades, the sharp check is recognizable sooner than the blurred one. The final state still needs to make sense to someone who looks back after the transition.

- [Apple HIG · Icons](https://developer.apple.com/design/human-interface-guidelines/icons)
- [Material Design 2 · Animated icons](https://m2.material.io/design/iconography/animated-icons.html)
- [WCAG 2.2 · Name, role, value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Apple Developer · What’s new in SF Symbols 6](https://developer.apple.com/videos/play/wwdc2024/10188/)

## What breaks

A checkmark alone can leave a screen reader user unaware that the action succeeded. Blurring it also makes the confirmation harder to recognize as it appears.

## How to apply it

1. Keep both glyphs inside one fixed-size slot. Swap instantly if the state is already clear, or use a short crossfade that keeps the incoming glyph legible at its actual size.
2. Give the resulting control or status an appropriate accessible name, state or announcement.
3. Test rapid reversals, the smallest rendered size and an immediate reduced-motion swap.

## Before you ship

1. Can someone identify the final state after looking away?
2. Does focus stay on the control, and does its accessible name still describe its action?
3. Does the glyph remain understandable without movement?
