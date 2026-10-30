# Semantic colors

- ID: color-4
- Category: Color & depth
- Tags: Semantics, States
- URL: https://axiomui.nischal.fyi/rules/color-4

Don't spend red, green, or amber on decoration; reserve them for error, success, and warning. Once red also means 'liked', it can no longer mean 'something went wrong'.

- Do: Like icon: blue-500
- Don't: Like icon: rose-500

## Why it works

Red, green, and yellow carry pre-attentive semantic association — users decode them as error, success, and warning before reading any label, a learned pattern from traffic lights and status systems everywhere. Using red decoratively on a Like button hijacks that association and forces the brain to momentarily interpret the icon as an alert.

## What breaks

A red heart icon on a Like button makes new users hesitate or read it as a delete/error affordance, measurably increasing misclicks and support questions about broken states.

## How to apply it

1. Recolor decorative icons like Like buttons in blue, purple, or brand color.
2. Reserve red exclusively for error states and destructive actions.
3. Reserve green exclusively for success confirmations, not generic accents.
4. Audit every red/green/yellow instance and ask if it is truly status.

## Review questions

1. Is red used anywhere besides errors or destructive actions?
2. Is green used anywhere besides success confirmation?
3. Would a user mistake a decorative icon for a system status signal?
