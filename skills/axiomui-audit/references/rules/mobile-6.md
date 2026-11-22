# Give single taps an immediate action

- ID: mobile-6
- Category: Mobile
- Tags: Tap timing, Feedback
- URL: https://axiomui.nischal.fyi/rules/mobile-6

When a card waits to distinguish Open from a double-tap shortcut, every ordinary open pays the waiting time. A separate Like button lets the two actions work independently.

- Do: One tap opens without a programmed wait
- Don’t: One tap waits for the 300 ms timer

## Why it works

Separate Open and Like controls let each tap have one meaning.

- [WWDC18, Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
- [WebKit, More Responsive Tapping on iOS](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/)
- [Chrome · Removing the mobile tap delay](https://developer.chrome.com/blog/300ms-tap-delay-gone-away)

## What breaks

A timer delays every ordinary open even for someone who never uses double tap.

## How to apply it

1. iOS — A recognizer required to wait for a double tap can delay the single-tap action.
2. Android — Use confirmed-single-tap recognition only when distinguishing a double tap matters to the same control.
3. Web — Responsive pages support fast taps. A CSS touch-action value cannot remove a timer written by the app.

## Before you ship

1. Compare the scheduled 300 ms wait with the elapsed time between the tap handler and Open.
2. Can Like still be reached independently?
3. Can both actions be invoked with the keyboard?
