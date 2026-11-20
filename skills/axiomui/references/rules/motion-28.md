# Make icon state changes recognizable

- ID: motion-28
- Category: Motion & interaction
- Tags: Icons, States
- URL: https://axiomui.nischal.fyi/rules/motion-28

When an icon changes meaning, keep the result recognizable at rest. A short crossfade can help connect the two shapes. Use scale or blur only when the small glyph remains legible.

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0
- Don't: display: none to display: block

## Why it works

Two glyphs in one stable slot can communicate a state change without shifting the label or the pointer target. A transition can show that one replaces the other, but the durable evidence is the resulting state. Someone who looks back after the animation finishes should still know what happened.

- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## What breaks

An icon can animate beautifully and still leave an assistive-technology user unaware of completion. A long blur can also obscure the one cue a sighted user needs.

## How to apply it

1. Keep both glyphs inside one fixed-size slot.
2. Give the resulting control or status an appropriate accessible name, state or announcement.
3. Test rapid reversals, the smallest rendered size and an immediate reduced-motion swap.

## Review questions

1. Can someone identify the final state after looking away?
2. Does the control retain its name and focus during the swap?
3. Does the glyph remain understandable without movement?
