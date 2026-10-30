# Switch vs checkbox

- ID: form-7
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-7

A switch promises the change already happened, like a light switch. A checkbox promises 'choose now, submit later'. Pick the one that matches when the change actually lands.

- Do: Dark mode = switch, email updates = checkbox
- Don't: Dark mode = switch, email updates = switch

## Why it works

A switch’s visual language comes from a physical light switch: flipping it fires an immediate, standalone effect, which is why Dark mode as a switch feels correct. A checkbox instead signals select now, submit later, matching a pending choice like Email me product updates that only lands when the form is saved. Putting a switch on that row creates a signifier mismatch, promising an action that has not happened yet — and the Save changes button sitting below it is the tell.

## What breaks

A switch on Email me product updates reads as already applied, so a user flips it, sees it settle in the on position, and closes the page without pressing Save changes — the setting never reaches the server and nothing on screen said it wouldn’t.

## How to apply it

1. Use a switch for Dark mode, since it applies the moment it is flipped.
2. Use a checkbox for Email me product updates, since it only takes effect when the form is saved.
3. Never use a switch for any setting that waits on a separate submit action.
4. Confirm each switch produces an immediate, visible effect the instant it is toggled.

## Review questions

1. Does every switch on the screen take effect immediately when toggled?
2. Is a submit-dependent row like Email me product updates presented as a checkbox rather than a switch?
3. Are there any switches whose effect only applies after a later submit?
