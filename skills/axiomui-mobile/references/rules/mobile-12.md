# Start drags clear of system gestures

- ID: mobile-12
- Category: Mobile
- Tags: System gestures, Screen edges
- URL: https://axiomui.nischal.fyi/rules/mobile-12

The first movement of a slider can belong to the operating system if its handle sits inside a Back gesture region. Place its required drag start in usable space.

- Do: Trim from x=48 · clip gets shorter
- Don’t: Trim from x=4 · Back preview opens

## Why it works

The system can reserve an edge for starting Back. A trim handle inside that region can lose the first movement before the clip editor receives a drag.

- [Apple HIG, Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Android, Gesture navigation](https://developer.android.com/develop/ui/views/touch-and-input/gestures/gesturenav)
- [Android, System gesture insets](https://developer.android.com/reference/android/view/WindowInsets.Type)
- [W3C, Understanding Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

## What breaks

An inward swipe on the handle can reveal the previous screen before the clip changes.

## How to apply it

1. iOS — Respect the leading-edge navigation gesture, including in mirrored layouts, and the bottom Home gesture.
2. Android — Either side edge may own Back in gesture mode. Read gesture insets and leave mandatory system gestures available.
3. Web — Use an inset handle plus a visible alternative. There is no portable CSS value for an OS Back recognizer’s width.

## Before you ship

1. Who receives the first inward drag?
2. With the right edge selected, can you shorten the clip using the step buttons?
3. Does the leading edge move with the reading direction?
