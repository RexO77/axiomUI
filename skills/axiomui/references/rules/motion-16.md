# Show hover effects only where hover exists

- ID: motion-16
- Category: Motion & interaction
- Tags: Hover, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-16

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover)
- Don’t: Button scales on tap

## Why it works

The hover media query describes the primary pointing device. A laptop with a trackpad can match it even while someone taps the screen. For scripted hover, check pointerType on the event.

- [Media Queries · Hover and pointer capabilities](https://www.w3.org/TR/mediaqueries-4/#mf-interaction)
- [React Aria · useHover](https://react-aria.adobe.com/useHover)
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

## What breaks

If the only sign of an action appears on hover, a person using a keyboard or touch screen can miss it. A tap can leave a button looking hovered after the finger lifts.

## How to apply it

1. Use (hover: hover) to check whether the primary pointing device can hover.
2. For scripted hover behavior, check the current pointer type and handle keyboard focus separately.
3. Test with a mouse and touch on the same device.

## Before you ship

1. Can the control be identified before hovering?
2. Does the action work with focus and activation from a keyboard?
3. What happens when the user switches from trackpad to touch?
