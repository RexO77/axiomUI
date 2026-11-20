# Label ambiguous actions

- ID: comp-7
- Category: Components & actions
- Tags: Icons, Labels, Clarity
- URL: https://axiomui.nischal.fyi/rules/comp-7

Add visible text when an icon leaves the action open to interpretation. Give every icon-only button an accessible name that describes what it does.

- Do: Icon + label on every toolbar action
- Don't: Icon only on every toolbar action

## Why it works

A box with a downward arrow can mean Download, Move or Archive. Beside “Archive,” the same shape helps a returning user scan the toolbar without asking a first-time user to guess.

- [Fluent · Button labels and icons](https://fluent2.microsoft.design/components/web/react/core/button/usage)
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

## What breaks

A tooltip that clarifies Archive on hover provides little help to someone choosing an action on a touchscreen. An accessible name helps assistive technology but does not teach the glyph to a sighted newcomer.

## How to apply it

1. Use a short verb for each action whose consequence is ambiguous.
2. Name icon-only controls and hide purely decorative icons from assistive technology.
3. Try representative tasks with new and experienced users before dropping visible labels.

## Review questions

1. What else might this glyph mean in this context?
2. Can someone identify the action without hover?
3. Does the accessible name match the visible action?
