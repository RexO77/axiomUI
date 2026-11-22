# Keep errors and the only recovery action on screen

- ID: sys-16
- Category: System & logic
- Tags: Error handling, Feedback, Accessibility, WCAG
- URL: https://axiomui.nischal.fyi/rules/sys-16

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause the timer while the pointer is over the message, focus is inside it, or the tab is hidden.

- Do: Upload failed · stays until Retry or dismissal
- Don’t: Upload failed · message closes at 5s · Retry disappears

## Why it works

Six seconds after the upload failed, one preview still offers Retry. In the other, the message disappeared after five seconds and took the only Retry button with it. A success message can time out when the saved result is visible elsewhere.

- [IBM Carbon · Notification dismissal](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines)
- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
- [Radix Primitives · Toast](https://www.radix-ui.com/primitives/docs/components/toast)
- [Sonner · Toast timer behavior](https://github.com/emilkowalski/sonner/blob/v2.0.7/src/index.tsx)
- [MDN · Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## What breaks

Someone who looked away, is reading with a screen magnifier or takes longer to reach the toast with a keyboard finds an empty corner and no sign the file was not uploaded. WCAG 2.2.1 (Timing Adjustable) asks that people can turn off, adjust or extend time limits, and a timed toast holding the only Retry is such a limit.

## How to apply it

1. Give each message a dismissal policy by type. Success confirmations whose result is visible elsewhere may close after a few seconds. Errors and any message holding the only Undo or Retry stay until the person acts on it or closes it, as Carbon’s inline and actionable notifications do.
2. Pause any timer while the message is hovered or holds focus, and while the tab is hidden (`document.visibilityState === "hidden"`). Restart the full timer once the tab is visible and neither the pointer nor keyboard focus is on the message. Announce the message through a live region, and make its actions reachable from the keyboard.
3. Check error messages and messages offering Undo or Retry for dismissal timers, including library defaults. Flag any error that times out. If Undo or Retry times out, check where the person can still take that action.

## Before you ship

1. Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?
2. Show a timed confirmation. Does it stay visible past its timeout while the pointer rests on it? Repeat with keyboard focus on an action.
3. Show a timed confirmation and switch tabs for a minute. When you return, is the message still there for its full timeout?
