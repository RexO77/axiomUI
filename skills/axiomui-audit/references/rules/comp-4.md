# Distinguish people from content

- ID: comp-4
- Category: Components & actions
- Tags: Shape, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-4

In a list of people and files, use circles for people and rectangles for files. Readers can tell the rows apart before reading their names.

- Do: Initials in a circle, file icon in a rounded square
- Don’t: Initials and file icon both in rounded squares

## Why it works

A profile picture and a file thumbnail can both be photos. Consistent shapes let readers tell them apart even before they recognize the image.

- [GitLab Pajamas · Avatar shapes and fallbacks](https://design.gitlab.com/components/avatar/)
- [Fluent · Avatar shapes and variations](https://fluent2.microsoft.design/components/web/react/core/avatar/usage)
- [Atlassian · Avatar usage](https://atlassian.design/components/avatar/usage)
- [W3C WAI · Images with adjacent text](https://www.w3.org/WAI/tutorials/images/decorative/)

## What breaks

When both tiles are rounded squares, readers have to inspect the contents or read the names to tell a person from a file.

## How to apply it

1. Give people and files distinct shapes wherever readers need to tell them apart.
2. Show the person’s name or another meaningful identifier alongside the picture when identity matters.
3. If a profile photo is missing, keep the initials in the same circle.

## Before you ship

1. Can a reader distinguish a person from a file without recognizing the photo?
2. How does a team avatar differ from an individual in this system?
3. Does a missing image preserve the same identity cue?
