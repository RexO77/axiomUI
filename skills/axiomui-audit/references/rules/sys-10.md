# Graceful degradation

- ID: sys-10
- Category: System & logic
- Tags: Error handling, Images, Async
- URL: https://axiomui.nischal.fyi/rules/sys-10

Always show a fallback when assets fail to load (broken images, failed API calls). Never show a broken state.

- Do: Placeholder image + retry option
- Don't: Broken image icon / blank screen

## Why it works

A failed request is a normal event, not an exception, and the browser’s default handling of one is hostile: an img that 404s collapses to its alt box, so everything below it jumps up the page. Rendering a placeholder at the same dimensions, with a retry, holds the layout still and keeps the failure legible as a failure rather than as a page that looks half-built.

## What breaks

One CDN hiccup and a grid of product cards shows broken-image glyphs at assorted sizes while the rows reflow around each failure, so the page reads as broken rather than as temporarily missing a few pictures.

## How to apply it

1. Reserve the space before the request resolves, with aspect-ratio or a fixed box, so a failure cannot shift the layout.
2. Handle the image onError by swapping in a placeholder; never let it fall through to the browser glyph.
3. Give failed fetches a fallback state with a labelled retry that re-requests only the resource that failed.
4. Test degraded states deliberately: block the image host and the API in devtools and walk the page.

## Review questions

1. Does a failed image show a placeholder at the same size, with nothing below it moving?
2. Is there any raw broken-image glyph or blank gap left on the page?
3. Can the user retry the failed request without reloading the whole page?
