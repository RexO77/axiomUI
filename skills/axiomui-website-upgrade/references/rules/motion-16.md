# Gate decorative hover motion

- ID: motion-16
- Category: Motion & interaction
- Tags: Hover, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-16

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover)
- Don't: Hover scale on touch

## Why it works

The hover media feature describes the primary pointing mechanism. A laptop with a trackpad and touch screen can satisfy this query while the person is tapping. The query is suitable for a CSS enhancement. An event-driven interaction that depends on the current pointer needs to inspect that event.

- [Media Queries · Hover and pointer capabilities](https://www.w3.org/TR/mediaqueries-4/#mf-interaction)

## What breaks

If the only sign of an action appears on hover, a person using a keyboard or touch screen can miss it. Synthesized hover can also leave decoration active after a tap.

## How to apply it

1. Use (hover: hover) for primary-pointer hover decoration.
2. For scripted hover behavior, check the current pointer type and handle keyboard focus separately.
3. Test with a mouse and touch on the same device.

## Review questions

1. Can the control be identified before hovering?
2. Does the action work with focus and activation from a keyboard?
3. What happens when the user switches from trackpad to touch?
