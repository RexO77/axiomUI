# Never pure black

- ID: color-2
- Category: Color & depth
- Tags: Contrast, Readability
- URL: https://axiomui.nischal.fyi/rules/color-2

Pure black (#000000) creates eye strain against white. Use a very dark gray or blue-gray.

- Do: #0f172a on #ffffff (17.9:1)
- Don't: #000000 on #ffffff (21:1)

## Why it works

#000000 on #ffffff is the largest luminance step a screen can produce, about 21:1, and at that extreme the white ground appears to encroach on the thin parts of every stroke, so edges look over-sharp and long reads get tiring. A near-black blue-gray such as #0f172a still measures 17.9:1, far above the 4.5:1 AA floor, while pulling the step back from the maximum. The slight blue cast also matches the cool white most displays emit, so the text reads as ink instead of a hole punched through the screen.

## What breaks

A long article set in #000000 on #ffffff has stroke edges that appear to shimmer as the eye moves, and readers describe the page as harsh or fatiguing after a few paragraphs without being able to point at what is wrong.

## How to apply it

1. Replace every #000000 text and background value with the palette near-black, #0f172a.
2. Pair it with an off-white ground rather than pure #ffffff, so neither end of the range sits at the extreme.
3. Grep for #000, #000000, and rgb(0 0 0) literals before shipping, dark-mode surfaces included.
4. Treat dark mode separately: a pure-black surface makes white text bloom the same way, so raise it off zero too.

## Review questions

1. Is any text or background using literal #000000?
2. Do stroke edges look settled rather than shimmering against the background?
3. Are the darkest tokens a near-black with a slight hue rather than true black?
