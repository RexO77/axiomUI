# Labels top aligned

- ID: form-1
- Category: Forms & inputs
- Tags: Labels, Forms
- URL: https://axiomui.nischal.fyi/rules/form-1

Top-aligned labels work best on mobile and allow for variable label length (translation friendly).

- Do: Label above input
- Don't: Label left of input

## Why it works

Reading a top-aligned label takes one downward eye movement instead of the left-to-right jump a side label forces, so scanning stays on a single vertical axis. It also survives translation, since a German or Finnish label can wrap to two lines without colliding with the input box. On narrow viewports it is the only layout that does not force label truncation.

## What breaks

A left-aligned label meets a long translated string and either truncates or wraps under the input, misaligning every field below it, so a German build shows staggered, unreadable rows.

## How to apply it

1. Place every label directly above its input, never to the left, even on desktop.
2. Let labels wrap to a second line instead of truncating with an ellipsis.
3. Keep the label-to-input gap at 8px on every field, matching the 4pt scale.
4. Test the layout with a long locale string like Rechnungsadresse.

## Review questions

1. Is every label positioned above its input rather than beside it?
2. Does a long translated label wrap cleanly without overlapping the input?
3. Is the label-to-input spacing consistent across all fields on the form?
