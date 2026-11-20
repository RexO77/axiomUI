# Explain why a view is empty

- ID: sys-2
- Category: System & logic
- Tags: Guidance, States
- URL: https://axiomui.nischal.fyi/rules/sys-2

Tell people what an empty view means. Offer a relevant next step when one exists, such as creating a first project or clearing a search filter.

- Do: “No projects yet” + “New project” button
- Don't: Empty panel, no next step

## Why it works

An empty project list, an empty search result and a failed request can all paint the same blank rectangle. The first may invite creation, the second may invite a different query, and the third needs recovery.

- [IBM Carbon · Empty states](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states)

## What breaks

A “Create project” button shown after a failed fetch implies there are no projects. Someone may duplicate work while their existing records remain temporarily unavailable.

## How to apply it

1. Represent loading, failure and a successful empty response separately.
2. Match the explanation to the cause and the action to the person’s permissions.
3. Allow a quiet confirmation when an empty inbox or completed queue is a desirable outcome.

## Review questions

1. Which state produced the empty view?
2. Can this person actually perform the suggested action?
3. Would a message alone be sufficient?
