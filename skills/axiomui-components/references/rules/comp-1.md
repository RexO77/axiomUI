# Prioritize the next action

- ID: comp-1
- Category: Components & actions
- Tags: Buttons, Hierarchy
- URL: https://axiomui.nischal.fyi/rules/comp-1

Give the next step the only filled button in its group. Give equally important choices the same style.

- Do: 1 filled + 1 outline + 1 ghost button
- Don’t: 3 filled buttons side by side

## Why it works

Publish, Preview and Discard sit together. Filling only Publish makes the next step easy to find. A separate task on the same screen can have its own primary button.

- [GitLab Pajamas · Button hierarchy](https://design.gitlab.com/components/button/)
- [GOV.UK · Button emphasis and usage](https://design-system.service.gov.uk/components/button/)
- [Apple HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [USENIX Security · The effect of consent banner design](https://www.usenix.org/conference/usenixsecurity24/presentation/bielova)
- [IBM Carbon · Button emphasis](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines#a-single-high-emphasis-button)

## What breaks

Three filled buttons give Discard as much weight as Publish. In a consent prompt, equal weight is deliberate. Accept and Decline should be equally easy to find.

## How to apply it

1. Group controls by the task they affect.
2. Use one prominent button within a group that has a clear next step.
3. Check that secondary actions remain legible, reachable and honestly labeled.

## Before you ship

1. What is someone trying to finish here?
2. Can readers find Discard when they want to abandon their edits?
3. Is there a reason to recommend one of these choices?
