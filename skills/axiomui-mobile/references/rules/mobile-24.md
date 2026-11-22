# Keep values visible above the finger

- ID: mobile-24
- Category: Mobile
- Tags: Sliders, Occlusion
- URL: https://axiomui.nischal.fyi/rules/mobile-24

A changing slider value can be perfectly legible before the gesture and disappear underneath the finger during it. Put the value where it can be read throughout the drag.

- Do: Value bubble clears the modelled fingertip
- Don’t: Value inside the thumb is covered

## Why it works

The track tells you which way to drag. The price tells you when to stop. If the thumb holds the only number, you have to lift your finger to check it.

- [Hoober, Design for Fingers, Touch, and People, Part 2](https://www.uxmatters.com/mt/archives/2017/05/design-for-fingers-touch-and-people-part-2.php)
- [Hoober, Common misconceptions about touch](https://www.uxmatters.com/mt/archives/2013/03/common-misconceptions-about-touch.php)
- [Freiberg, Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design)

## What breaks

The price can change while the shopper’s finger covers the only readout.

## How to apply it

1. iOS — A floating preview can keep precision feedback visible while the finger is down.
2. Android — Use a slider value indicator or a nearby visible readout for the current value.
3. Web — Keep the value available to keyboard and assistive input, including meaningful units on a range control.

## Before you ship

1. Can you read the price throughout the drag?
2. When the bubble would cross the top inset, does the price move to a clear spot?
3. Can the price also be changed from the keyboard?
