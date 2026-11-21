# Keep errors and the only recovery action on screen

- ID: sys-16
- Category: System & logic
- Tags: Error handling, Feedback, Accessibility, WCAG
- URL: https://axiomui.nischal.fyi/rules/sys-16

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause any timer while the message is hovered, focused or in a hidden tab.

- Do: Upload failed · Retry stays until dismissed
- Don't: Upload failed · Retry closes after 5s

## Why it works

Six seconds after an upload fails, the toast reporting it is the only place that offers Retry. If it is still on screen, the person can retry when they notice. If a five-second timer has already removed it, the failure and the way to fix it are both gone. A success message such as Saved can time out safely, because the saved result is visible elsewhere.

- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
- [IBM Carbon · Notification dismissal](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines)

## What breaks

Someone who looked away, is reading with a screen magnifier or takes longer to reach the toast with a keyboard finds an empty corner and no sign the file was not uploaded. WCAG 2.2.1 (Timing Adjustable) asks that people can turn off, adjust or extend time limits, and a timed toast holding the only Retry is such a limit.

## How to apply it

1. Give each message a dismissal policy by type. Success confirmations whose result is visible elsewhere may close after a few seconds. Errors and any message holding the only Undo or Retry stay until the person acts on it or closes it, as Carbon’s inline and actionable notifications do.
2. Pause any timer while the message is hovered or holds focus, and while the tab is hidden (`document.visibilityState === "hidden"`). Restart it, not resume a nearly expired one, when the person leaves. Announce the message through a live region, and make its actions reachable from the keyboard.
3. To find violations, search for toast calls with a duration on an error or an action: `grep -rnE "toast\.(error|warning)|duration:|setTimeout\(.*(dismiss|close)" src`. Flag any error toast with a finite duration and any toast whose Undo or Retry has no other route, such as a Trash folder or a retry control on the item.

## Review questions

1. Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?
2. Trigger it again, rest the pointer on the toast, then tab to it. Does it stay put while hovered or focused?
3. Trigger it, switch to another tab for a minute and come back. Is the message still there?
