# Skip default load animation

- ID: motion-29
- Category: Motion & interaction
- Tags: Entry, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-29

Default-state UI should not replay entrance motion on the first render. Save enter animations for intentional changes after the page is interactive.

- Do: AnimatePresence initial={false}
- Don't: AnimatePresence initial={true}

## Why it works

Entrance motion exists to mark a change the user caused after the page is already interactive, not to narrate the first render. Setting AnimatePresence initial={false} distinguishes the initial-mount case from later state changes, so default-state UI appears immediately while the same component still animates properly on subsequent opens. Without that distinction, every component that could animate on state change also replays that animation on page load, whether or not the user asked for it.

## What breaks

A modal that defaults to open animates in from scratch on every page load or refresh, making the app feel like it is still loading even after content is ready.

## How to apply it

1. Set initial={false} on AnimatePresence for components that can be open on first render.
2. Verify the same component still animates correctly on later state changes, not just skips motion permanently.
3. Never let a modal or panel play its enter animation on initial page load.
4. Distinguish first-mount state explicitly from subsequent user-triggered state changes.

## Review questions

1. Does content that is open by default appear instantly on first page load, without an enter animation?
2. Does that same component still animate normally when the user closes and reopens it later?
3. Is initial={false} set on AnimatePresence for this component?
