# Define image edges when they disappear

- ID: color-11
- Category: Color & depth
- Tags: Images, Depth, Dark mode
- URL: https://axiomui.nischal.fyi/rules/color-11

When a thumbnail blends into its surrounding surface, try a subtle inset edge. Choose its tone for the theme. Full-bleed imagery and images with clear edges may need no outline.

- Do: outline-black/10 dark:outline-white/10
- Don't: outline-slate-900/10 in both themes

## Why it works

The preview places pale and dark thumbnails on matching surfaces. A translucent dark line separates the pale edge, while a light line can separate the dark edge. The line serves as a framing detail unless it also identifies a control or a selected state.

- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing)
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

## What breaks

A dark outline can disappear against a dark crop. A stronger border around every photo can introduce an unintended selection cue or obscure detail along the crop edge.

## How to apply it

1. Test actual images with pale, dark, and transparent edges.
2. Keep the line inside the thumbnail if preserving its external dimensions matters.
3. Use a separate, accessible indication for focus and selection.

## Review questions

1. Is the edge difficult to locate in this crop?
2. Does the line remain subordinate to the image?
3. Can people distinguish the frame from focus or selection?
