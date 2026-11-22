# Explain why a view is empty

- ID: sys-2
- Category: System & logic
- Tags: Guidance, States
- URL: https://axiomui.nischal.fyi/rules/sys-2

Say why the view is empty. If someone can create a first project or clear a search filter, offer that action.

- Do: “No projects yet” + “New project” button
- Don’t: Blank panel · no message or action

## Why it works

A blank project list can mean there are no projects, no search matches or a loading error. Offer New project for the first, a way to change the search for the second and Retry for the third.

- [IBM Carbon · Empty states](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states)
- [Shopify · Empty state](https://shopify.dev/docs/api/app-home-ui-extension/latest/web-components/feedback-and-status-indicators/empty-state)
- [NN/g · Designing empty states in complex applications](https://www.nngroup.com/articles/empty-state-interface-design/)

## What breaks

Showing “New project” after a failed request suggests there are no projects. Someone may recreate a project that already exists.

## How to apply it

1. Represent loading, failure and a successful empty response separately.
2. Match the explanation to the cause and the action to the person’s permissions.
3. If the queue is empty because the work is finished, “All caught up” is enough.

## Before you ship

1. Which state produced the empty view?
2. Can this person actually perform the suggested action?
3. Would a message alone be sufficient?
