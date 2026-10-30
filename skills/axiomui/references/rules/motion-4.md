# Use strong custom easing

- ID: motion-4
- Category: Motion & interaction
- Tags: Easing, Polish
- URL: https://axiomui.nischal.fyi/rules/motion-4

Default CSS easings are often too weak. Use intentional curves like strong ease-out for entrances and ease-in-out for on-screen movement.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)

## Why it works

The browser default is a shallow curve, not a wrong one. ease — cubic-bezier(0.25, 0.1, 0.25, 1) — leaves the start at well under half the average rate, never exceeds about 2.3x it, and is 58% of the way there a third of the duration in. cubic-bezier(0.23, 1, 0.32, 1) leaves at more than four times the average rate and is 88% of the way there at that same point, then spends the rest of the time settling. Same 360ms, same direction, same distance: the strength of the curve is doing all the work.

## What breaks

On the browser default a panel is still travelling when the eye has already landed on its first line, so the reader spends the back half of the animation trying to read moving text. Nothing about it looks broken, which is exactly why it survives review — it just leaves every surface in the product feeling a beat behind the click.

## How to apply it

1. Use cubic-bezier(0.23, 1, 0.32, 1) for entrances rather than ease, ease-out, or any other keyword default.
2. Reserve ease-in-out only for elements moving between two on-screen positions, where both ends are already visible.
3. Judge a curve by where the distance goes, not by the duration: most of the travel belongs in the first third.
4. Store the custom curve as a shared token so every entrance reuses the same feel.

## Review questions

1. Has most of the travel happened by the first third of the duration?
2. Is the same custom easing curve reused consistently across similar components?
3. Is any entrance still running on a keyword default like ease?
