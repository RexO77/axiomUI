# Fit the page above browser bars

- ID: mobile-2
- Category: Mobile
- Tags: Viewport, Browser bars
- URL: https://axiomui.nischal.fyi/rules/mobile-2

A bottom action can disappear on first load because the browser reserves more room for its address bar than the page allowed. Choose the viewport height for the state the reader sees.

- Do: 756 px opening panel · Continue visible
- Don’t: 844 px opening panel · Continue below toolbar

## Why it works

The small viewport describes the opening with the browser controls expanded. A dynamic viewport follows the space available as the controls move.

- [web.dev, The large, small, and dynamic viewport units](https://web.dev/blog/viewport-units)
- [CSS Values and Units 4](https://www.w3.org/TR/css-values-4/#viewport-relative-lengths)
- [WWDC21, Design for Safari 15](https://developer.apple.com/videos/play/wwdc2021/10029/)

## What breaks

An 844 px panel places its last 48 px behind an 88 px toolbar. A reader can miss Continue before they have even started scrolling.

## How to apply it

1. iOS — In Safari, check the opening screen with the address bar expanded and after it retracts.
2. Android — Repeat in Chrome with controls expanded and re-expanded. Native layouts use their window bounds and insets.
3. Web — Use svh for a stable opening section and dvh for a shell that follows current space. Let longer content grow or scroll.

## Before you ship

1. Can you reach Continue on first load with the bar open?
2. Does retracting and restoring the bar hide an action?
3. Can a longer opening section scroll?
