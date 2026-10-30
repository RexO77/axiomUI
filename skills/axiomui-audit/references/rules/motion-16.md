# Gate hover motion

- ID: motion-16
- Category: Motion & interaction
- Tags: Hover, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-16

Hover motion should only run on devices that actually hover. Touch devices can trigger hover states accidentally.

- Do: @media (hover: hover)
- Don't: Hover scale on touch

## Why it works

Hover is a mouse-era signal: only pointers with (hover: hover) can rest on a target without committing to it, so gating motion behind that media query keeps intent honest. Touch devices fire hover on tap-and-hold or right after a tap, which is a tap pretending to be a hover. Scoping scale, glow, or lift transitions inside @media (hover: hover) prevents that false signal from ever reaching motion code.

## What breaks

A tap on a touch screen triggers the hover scale, then the tap-through triggers the active state a frame later, producing a visible double-animation stutter on first touch.

## How to apply it

1. Wrap hover transitions in @media (hover: hover) and, ideally, (pointer: fine).
2. Never rely on :hover alone to gate transform or box-shadow motion.
3. Test on an actual touch device, not just a resized desktop browser.
4. Keep tap feedback (active/focus states) fully separate from hover feedback.

## Review questions

1. Does tapping a card on a touch device skip the hover animation entirely?
2. Does the hover effect still play correctly with a mouse on desktop?
3. Is there a separate, immediate feedback state for touch taps?
