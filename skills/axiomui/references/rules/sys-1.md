# Skeleton loading

- ID: sys-1
- Category: System & logic
- Tags: Perceived performance, Async, States
- URL: https://axiomui.nischal.fyi/rules/sys-1

Spinners draw attention to the waiting. Skeletons (gray bars) imply progress and structure.

- Do: Gray layout pulse
- Don't: Giant spinning wheel

## Why it works

Perceived-performance research shows a gray layout pulse mimicking the final content structure reads as progress in motion, while a spinning wheel is an abstract token unrelated to what is loading. Skeletons prime the eye for where text and images will land, cutting perceived wait time even when actual load time is identical.

## What breaks

A full-screen spinner spends the whole wait saying only that something is happening, so the content lands in one jump at the end and the reader starts over locating what they came for. A 900ms wait spent that way reads as a stall, and some of them reload before it resolves.

## How to apply it

1. Replace spinners with gray bars matching the shape of each content block, image, title, body.
2. Pulse the bars at a slow, consistent rate (1.5-2s cycle) so it reads as alive, not stuck.
3. Match skeleton block dimensions to real content so nothing shifts when it swaps in.
4. Swap skeleton for content directly, never fade to blank first.

## Review questions

1. Does the loading state show gray bars shaped like the final layout instead of a spinner?
2. Does the skeleton match the real content dimensions with no layout jump on load?
3. Is there any full-screen spinner used for initial content loading?
