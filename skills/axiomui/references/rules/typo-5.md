# Give each typeface a job

- ID: typo-5
- Category: Typography & text
- Tags: System, Consistency
- URL: https://axiomui.nischal.fyi/rules/typo-5

Start with one family for product headings and body text. Add another family when it serves a recognizable role, such as code, editorial display, or coverage for another script.

- Do: Manrope for headings + body
- Don't: Arial headings + Verdana body

## Why it works

In the landing card, changing from Arial to Verdana announces a change of texture without explaining why. A consistent family already has size, weight, and position available to mark the transition from title to description. A second face earns its place when readers encounter a different kind of content.

- [USWDS · Font families](https://designsystem.digital.gov/design-tokens/typesetting/font-family/)

## What breaks

Two interchangeable body styles can creep into adjacent screens and wrap the same string differently. Conversely, forcing one font across every language can introduce unpredictable fallback within a word.

## How to apply it

1. Name the role a new family will serve before adding it.
2. Check the heading and body together at their final sizes and widths.
3. Inspect fallback coverage in the languages your product supports.

## Review questions

1. Where does the change of family signal a change of role?
2. Could the existing family express the same distinction?
3. Which face actually renders the localized copy?
