# Make icon state changes recognizable

- ID: motion-28
- Category: Motion & interaction
- Tags: Icons, States
- URL: https://axiomui.nischal.fyi/rules/motion-28

When an icon changes meaning, keep the incoming glyph recognizable as it appears and at rest. Swap it instantly or use a brief transition that preserves its shape.

- Do: Incoming glyph stays sharp as it appears
- Don't: Blur obscures the incoming glyph

## Why it works

Two glyphs in one stable slot can communicate a state change without shifting the label or pointer target. In the matched crossfades, the sharp check is recognizable sooner than the blurred one. The final state still needs to make sense to someone who looks back after the transition.

- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## What breaks

An icon can animate beautifully and still leave an assistive-technology user unaware of completion. A long blur can also obscure the one cue a sighted user needs.

## How to apply it

1. Keep both glyphs inside one fixed-size slot. Swap instantly if the state is already clear, or use a short crossfade that keeps the incoming glyph legible at its actual size.
2. Give the resulting control or status an appropriate accessible name, state or announcement.
3. Test rapid reversals, the smallest rendered size and an immediate reduced-motion swap.

## Review questions

1. Can someone identify the final state after looking away?
2. Does the control retain its name and focus during the swap?
3. Does the glyph remain understandable without movement?
