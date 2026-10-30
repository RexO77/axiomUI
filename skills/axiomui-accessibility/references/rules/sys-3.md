# Click targets (Fitts's law)

- ID: sys-3
- Category: System & logic
- Tags: Click targets, Touch, WCAG
- URL: https://axiomui.nischal.fyi/rules/sys-3

Interactive elements need at least a 44x44px hit area. Acquisition time rises as a target shrinks (Fitts's law), and a fingertip covers roughly 8mm of glass however small the icon is.

- Do: 44x44px hit area
- Don't: 16x16px hit area

## Why it works

Fitts’s law makes time-to-target a function of size and distance, and a fingertip contacts roughly 8-10mm of glass, far more than most visual hit areas cover. The familiar numbers come from different places: Apple’s HIG asks for 44x44pt, Material for 48x48dp, and WCAG 2.5.5 sets 44x44 CSS px as an AAA target, while WCAG 2.2’s AA floor, 2.5.8, is only 24x24 px and can be satisfied by spacing instead of size. A 16x16 glyph gives you a 16x16 target unless something grows it, and only padding does: padding joins the hit area, margin merely holds the neighbours off.

## What breaks

A 16x16 delete button at the end of a file row is smaller than the contact patch of the thumb reaching for it, so the tap lands on the row instead and opens the file — and the user only learns which control they hit after the wrong screen arrives.

## How to apply it

1. Grow small controls to 44x44 with padding, not margin: only padding belongs to the hit area.
2. Keep the visual size as designed and extend the target underneath it, so a 16px icon still looks like a 16px icon.
3. Add spacing between adjacent targets too, so a near-miss lands on nothing rather than on the neighbour.
4. Test at pointer-coarse breakpoints on a real device, not in a resized desktop window.

## Review questions

1. Does every tappable control measure at least 44x44 including its padding?
2. Are the extra pixels padding rather than margin, so they are actually clickable?
3. On a touch screen, can you hit each control in a row without brushing its neighbour?
