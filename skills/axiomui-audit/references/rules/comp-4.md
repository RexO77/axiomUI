# Avatars are circles

- ID: comp-4
- Category: Components & actions
- Tags: Shape, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-4

Put people in circles and content in rectangles. The shape becomes a type signal, so a mixed list of avatars and files can be scanned without reading a single label.

- Do: Avatar = circle, file = rectangle
- Don't: Avatar = square, file = rectangle

## Why it works

Shape carries meaning before users read a single label: circles read as organic and human, rectangles read as structured content. Putting a person in a circle and a document in a rect lets users sort avatars from files at a glance, relying on shape recognition instead of parsing text.

## What breaks

A user avatar rendered as a square gets mentally grouped with file thumbnails and folder icons, so users skim past a real person’s profile picture thinking it is just another content tile.

## How to apply it

1. Render every user avatar as a circle, with no exceptions for team or group avatars.
2. Keep content types like documents and projects as squares or rects.
3. Never crop a user photo into a square shape, even for compact list rows.
4. Apply the same circle treatment consistently across profile, comment, and mention UI.

## Review questions

1. Is every user avatar displayed as a circle?
2. Are document or project thumbnails shown as squares or rects, not circles?
3. Is the circle-for-people rule applied consistently across the whole screen?
