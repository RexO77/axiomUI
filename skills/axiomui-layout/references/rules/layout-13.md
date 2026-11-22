# Reserve space for media before it loads

- ID: layout-13
- Category: Layout & spacing
- Tags: States, Perceived performance, Images
- URL: https://axiomui.nischal.fyi/rules/layout-13

Give images, videos and embeds a width and height or an aspect ratio before they load. That keeps nearby controls in place.

- Do: aspect-ratio: 2 / 1 before load
- Don’t: 0px reserved before load

## Why it works

The dashed “View details” outline marks the button’s starting position. The solid button shows where it lands once the image takes up space. Reserve the 2:1 image area and the two positions coincide.

- [web.dev · Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)
- [web.dev · The CSS aspect-ratio property](https://web.dev/articles/aspect-ratio)
- [HTML · Dimension attributes](https://html.spec.whatwg.org/multipage/embedded-content-other.html#dimension-attributes)
- [MDN · aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio)
- [Chrome for Developers · Improved font fallbacks](https://developer.chrome.com/blog/font-fallbacks)

## What breaks

The button can move away from the pointer just as someone goes to open the details. On a longer page, another control can take its place.

## How to apply it

1. Search for img, video, and iframe elements. With cache disabled and the network throttled, check whether each element’s box has a height before its response arrives.
2. Set image width and height to the intrinsic dimensions, or reserve the displayed aspect ratio on a wrapper when an embed or crop has its own shape. Match the placeholder to the final size at each breakpoint.
3. Keep the space reserved if the media request fails so nearby controls stay in place.

## Before you ship

1. On a page with a loading image, disable the cache, throttle the network and reload. Place the pointer over the button below the image. Does it stay under the pointer as the image loads?
2. Does the placeholder match the final crop at both narrow and wide widths?
3. Does the same space remain reserved when the media request fails?
