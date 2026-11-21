# Reserve space for media before it loads

- ID: layout-13
- Category: Layout & spacing
- Tags: States, Perceived performance, Images
- URL: https://axiomui.nischal.fyi/rules/layout-13

Give images, videos, and embeds dimensions or an aspect ratio before they load. Reserve that space on the first render so nearby controls stay where people expect them.

- Do: aspect-ratio: 2 / 1 before load
- Don't: 0px reserved before load

## Why it works

Both panes show the cabin photo while it’s still loading and its dimensions are known. Reserving that space on the first render keeps View details in place. The dashed button records where it was before the unreserved image took up space.

- [web.dev · Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)
- [HTML · Dimension attributes](https://html.spec.whatwg.org/multipage/embedded-content-other.html#dimension-attributes)

## What breaks

The button can move away from the pointer just as someone goes to open the details. On a longer page, another control can take its place.

## How to apply it

1. Search for img, video, and iframe elements. With cache disabled and the network throttled, check whether each element’s box has a height before its response arrives.
2. Set image width and height to the intrinsic dimensions, or reserve the displayed aspect ratio on a wrapper when an embed or crop has its own shape. Match the placeholder to the final size at each breakpoint.
3. For shifts caused by swapping fonts, match fallback metrics with size-adjust and font metric overrides.

## Review questions

1. Disable cache, throttle the network, and reload. Keep the pointer over View details while the image starts loading and finishes rendering. Does the button stay under the pointer?
2. Does the placeholder match the final crop at both narrow and wide widths?
3. Does the same space remain reserved when the media request fails?
