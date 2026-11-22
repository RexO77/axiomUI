# Add resistance past a drag limit

- ID: motion-19
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-19

When a card reaches its drag limit, let it move less with each extra pixel of pull. On release, return it to rest. Leave native scroll bounce alone and keep sliders within their valid range.

- Do: Past the limit, the card moves less with each extra pixel of pull
- Don’t: Card stops abruptly at the limit

## Why it works

Past a card’s drag limit, each extra pixel of pull moves the card a little less. A slider thumb that moves past its maximum suggests a value it cannot save, so keep it within range.

- [Apple Developer · Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
- [Motion · Elastic drag constraints](https://motion.dev/docs/react-drag#elastic-constraints)
- [HTML · Range input](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range))
- [CSS Overscroll Behavior · Scroll boundary default actions](https://www.w3.org/TR/css-overscroll-1/#scroll-chaining)
- [Flutter · Overscroll friction factor](https://api.flutter.dev/flutter/widgets/BouncingScrollPhysics/frictionFactor.html)

## What breaks

Dragging past a slider’s limit can suggest a value it cannot save. On release, the control should show the saved value.

## How to apply it

1. Define the visual limit from a meaningful boundary such as a drawer’s last snap point.
2. Cap visual travel beyond the edge and preserve the valid underlying value.
3. Return the card to its resting position on release. With reduced motion enabled, return it immediately.

## Before you ship

1. What does movement beyond the edge mean here?
2. Can someone mistake overshoot for a valid value?
3. Does releasing or canceling show the correct resting state?
