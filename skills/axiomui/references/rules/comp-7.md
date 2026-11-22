# Label ambiguous actions

- ID: comp-7
- Category: Components & actions
- Tags: Icons, Labels, Clarity
- URL: https://axiomui.nischal.fyi/rules/comp-7

Add a visible label when an icon’s meaning is unclear. Give every icon-only button an accessible name that says what it does.

- Do: Archive, Share and Delete with text labels
- Don’t: Archive, Share and Delete as icons alone

## Why it works

The box with a lid could mean storage or Archive. The label “Archive” tells newcomers what it does, while returning users can scan for the icon.

- [NN/g · Icon usability](https://www.nngroup.com/articles/icon-usability/)
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [Fluent · Button labels and icons](https://fluent2.microsoft.design/components/web/react/core/button/usage)
- [NN/g · Evaluating digital icons](https://www.nngroup.com/articles/how-to-test-digital-icons/)

## What breaks

Someone tapping the toolbar can miss a label shown only on hover. A screen reader can announce an icon’s name, but a sighted newcomer still needs a visible clue.

## How to apply it

1. Put a short verb beside any icon whose action is unclear.
2. Name icon-only controls and hide purely decorative icons from assistive technology.
3. Before removing a label, check that new and returning users can find the action without it.

## Before you ship

1. What else could this icon mean here?
2. Can someone identify the action without hover?
3. Does the accessible name match the visible action?
