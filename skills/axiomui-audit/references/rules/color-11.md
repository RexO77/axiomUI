# Neutral image outlines

- ID: color-11
- Category: Color & depth
- Tags: Images, Depth, Dark mode
- URL: https://axiomui.nischal.fyi/rules/color-11

Images need a subtle inset outline for edge definition. Use pure black at low opacity in light mode and pure white at low opacity in dark mode.

- Do: outline-black/10 dark:outline-white/10
- Don't: outline-slate-900/10 in both themes

## Why it works

Photographs often end in soft or near-white edges that dissolve into a light UI surface, so the outline exists for edge definition, not decoration. Pure black at 10% works in light mode because it darkens whatever edge color sits under it by a uniform amount; pure white at 10% does the same job in reverse on a dark surface. A tinted near-black like slate-900/10 carries a visible blue cast over a warm photo and, on a dark surface, is already so close to the background value that it stops defining anything.

## What breaks

A pale product shot on a white card with no outline has no visible edge at all, so it reads as uncropped or accidentally transparent, and the slate-900/10 version of the same outline vanishes outright the moment the page switches to dark mode.

## How to apply it

1. Apply outline-black/10 in light mode and dark:outline-white/10 to the same image.
2. Pair the outline with -outline-offset-1 so it sits inside the image edge rather than ringing it.
3. Never substitute a tinted near-black like slate-900/10; it does not invert across themes.
4. Test with a near-white photo and a near-black one, in both themes.

## Review questions

1. Does every image have a subtle outline separating it from the background?
2. Does the outline switch from black-based to white-based in dark mode?
3. Is any image using a tinted gray outline instead of pure black or pure white?
