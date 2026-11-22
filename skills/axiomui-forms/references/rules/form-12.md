# Confirm what was saved

- ID: form-12
- Category: Forms & inputs
- Tags: Feedback, States
- URL: https://axiomui.nischal.fyi/rules/form-12

When the server confirms a save, show a message beside the Save button. After a purchase or booking, include the reference number or the next step.

- Do: Checkmark and confirmation beside Save changes
- Don’t: No confirmation beside Save changes

## Why it works

After Save changes, Display name still reads Maya Chen. The message beside the button confirms the save. For a booking, include the reference travelers need to make changes later.

- [W3C WAI · Success feedback after submission](https://www.w3.org/WAI/WCAG22/Techniques/general/G199)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [GOV.UK · Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)
- [W3C WAI · Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [IBM Carbon · Notifications](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines)

## What breaks

A success message shown when saving starts can be wrong if the request fails. Clearing the fields then also erases what the person needs to try again.

## How to apply it

1. Distinguish pending, saved and failed states.
2. Announce the inline save message through a live region so focus can stay on the current control.
3. After a transaction, explain what happens next and give people a confirmation they can save or find again.

## Before you ship

1. Was success confirmed by the service?
2. Can someone perceive the outcome without seeing the icon?
3. Can they recover the reference or next step later?
