# Distinguish people from content

- ID: comp-4
- Category: Components & actions
- Tags: Shape, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-4

Use a consistent shape for person avatars in mixed lists. A circular portrait beside a rectangular document thumbnail gives readers an extra cue about what each row represents.

- Do: Avatar = circle, file = rectangle
- Don't: Avatar = square, file = rectangle

## Why it works

A person, a workspace and a file can all have an uploaded image. A consistent crop helps readers distinguish the kinds of items before examining each image. Shape gets its meaning from repeated use within the product.

- [Fluent · Avatar shapes and variations](https://fluent2.microsoft.design/components/web/react/core/avatar/usage)

## What breaks

If a document cover and a profile picture have identical crops and the same generic label, the destination may be unclear even after the image loads.

## How to apply it

1. Choose separate treatments for the entity types people actually need to distinguish.
2. Show the person’s name or another meaningful identifier alongside the picture when identity matters.
3. Keep the fallback for a missing photo recognizable as the same kind of item.

## Review questions

1. Can a reader distinguish a person from a file without recognizing the photo?
2. How does a team avatar differ from an individual in this system?
3. Does a missing image preserve the same identity cue?
