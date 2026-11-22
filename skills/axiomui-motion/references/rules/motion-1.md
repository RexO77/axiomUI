# Shorten entrances for frequent actions

- ID: motion-1
- Category: Motion & interaction
- Tags: Perceived performance, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-1

Open the command palette several times in a row. If you keep waiting for its entrance, shorten it or remove it.

- Do: Rare modal: 220ms
- Don’t: Frequent palette: 220ms per open

## Why it works

Open the dialog once and its entrance takes 220ms. Open the command palette ten times and the same entrance adds up to 2.2 seconds. The tally shows how often people see a motion they already know.

- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)
- [NN/g · Animation for attention and comprehension](https://www.nngroup.com/articles/animation-usability/)
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [IJHCS · User perception of animation fluency](https://ir.psych.ac.cn/bitstream/311026/47151/1/User%20perception%20of%20animation%20fluency_%20The%20effect%20of%20time%20duration%20in%20different%20phases%20of%20animated%20transitions%20during%20application%20usage.pdf)
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

## What breaks

A palette that hides its results during entry makes people wait on every search, even when they know which command they want.

## How to apply it

1. Identify a repeated task and the next input it invites.
2. Shorten or skip the entrance on panels people open repeatedly.
3. Compare an immediate entrance with the current one over a sequence of realistic tasks.

## Before you ship

1. How soon can someone use the first result after opening the palette?
2. Does anything move under the pointer as the user reaches for the next action?
3. What does the entrance explain on the tenth open?
