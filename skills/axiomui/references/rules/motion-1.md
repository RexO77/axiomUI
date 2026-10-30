# Animate by frequency

- ID: motion-1
- Category: Motion & interaction
- Tags: Perceived performance, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-1

The more often a user sees an interaction, the less motion it should have. Frequent actions should feel instant.

- Do: Rare modal: 220ms
- Don't: Frequent palette: 220ms

## Why it works

Frequency sets the motion budget: a command palette fires dozens of times an hour, so any delay compounds through habituation, while a modal seen once a session can afford standard motion. Map interaction frequency to duration before choosing an easing curve.

## What breaks

A command palette animated like a rare modal charges 220ms on every invocation, so twenty opens across a working hour is four and a half seconds spent watching a panel whose shape the user already knew, and the app they reach for most reads as the slowest thing they use.

## How to apply it

1. Reserve full standard motion for rare surfaces like a first-run modal, and keep even that under 300ms.
2. Audit every animated surface for weekly-or-more usage and shorten or strip motion above that threshold.
3. Time the command palette open path separately from onboarding modals in your motion tokens.
4. Recheck a surface’s motion once it moves from rare to daily use, like a settings panel becoming a habit.

## Review questions

1. Does the command palette open without any perceptible delay?
2. Does a rarely-seen modal still get its full standard motion rather than feeling clipped?
3. Do frequently repeated actions feel faster than one-off actions?
