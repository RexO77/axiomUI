# Let vertical swipes scroll the page

- ID: mobile-13
- Category: Mobile
- Tags: Scrolling, Pointer events
- URL: https://axiomui.nischal.fyi/rules/mobile-13

A horizontal divider embedded in an article should let a reader start a vertical scroll on the handle itself. Declare the allowed gestures before touch-down.

- Do: Swipe up on divider · article scrolls
- Don’t: Swipe up on divider · article stays still

## Why it works

A horizontal adjustment and a vertical pan can share a starting point if the browser knows which movement it may take.

- [W3C Pointer Events, Declaring direct manipulation behavior](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property)
- [MDN, touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)
- [WebKit, More Responsive Tapping](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/)

## What breaks

With touch-action set to none, a vertical swipe that begins on the photo divider leaves the reader on the same paragraph.

## How to apply it

1. iOS — Use native directional recognition or test Safari’s real pan takeover on a touch device.
2. Android — Keep the parent’s vertical scroll available across the horizontal control. Test Chrome with a finger.
3. Web — Apply touch-action: pan-y pinch-zoom to the custom drag surface. Release drag state on pointercancel or lost capture.

## Before you ship

1. Can a vertical swipe start on the handle?
2. Does a horizontal drag still move the divider?
3. What happens to the drag when its pointer is canceled?
