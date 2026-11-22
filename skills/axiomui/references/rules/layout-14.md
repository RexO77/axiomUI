# Keep the subject in the crop at every ratio

- ID: layout-14
- Category: Layout & spacing
- Tags: Images, Responsive
- URL: https://axiomui.nischal.fyi/rules/layout-14

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops
- Don’t: object-position: center · latch cropped out of the narrow frame

## Why it works

The wide cabin image shows the brass latch on the right. A centered crop cuts it out of the narrow frame. Right alignment keeps it visible in both frames.

- [HTML · Art direction with the picture element](https://html.spec.whatwg.org/multipage/images.html#art-direction)
- [CSS Images 3 · object-position](https://www.w3.org/TR/css-images-3/#the-object-position)
- [Shopify · Image focal points](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings#image-focal-points)
- [Google Web Designer · Focal points for responsive images](https://support.google.com/webdesigner/answer/9493710)

## What breaks

A narrow detail card can show only cabin siding when the image is meant to help someone identify the latch.

## How to apply it

1. Search for object-cover, object-fit: cover, and background-size: cover. Open each use at its narrowest frame and inspect which part of the source gets cut off.
2. Set object-position for the subject in that asset. Check replacement images and artwork mirrored for other locales.
3. Use a dedicated crop with picture and source when one focal point can’t keep the whole subject visible across ratios.

## Before you ship

1. Load the same image in the 2:1 and 3:4 frames. Is the full brass latch visible in both?
2. Resize between the supported widths. Does any intermediate crop cut through the subject?
3. If the subject needs its surroundings for context, is there enough room for both at the narrowest ratio?
