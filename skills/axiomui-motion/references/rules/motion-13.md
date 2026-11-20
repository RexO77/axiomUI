# Give new elements a starting style

- ID: motion-13
- Category: Motion & interaction
- Tags: Animation API, Entry, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-13

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } }
- Don't: useEffect(() => setShown(true))

## Why it works

A transition normally needs a previous computed style. A newly rendered row may have none. A starting style supplies that missing state in the cascade and lets the row settle into its normal style. A second render solely to toggle an animation class adds timing to coordinate.

- [CSS Transitions · Defining a starting style](https://www.w3.org/TR/css-transitions-2/#defining-before-change-style)
- [React · When effects run](https://react.dev/reference/react/useEffect#caveats)

## What breaks

A base style that keeps the row transparent until an effect runs can leave real content invisible when the script is delayed.

## How to apply it

1. Define final opacity and position in the normal rule.
2. Place the starting declaration inside the row’s style rule, or target the row with a selector inside a standalone @starting-style block. At equal specificity, put the starting rule after the final declaration so its starting value wins.
3. Insert successive rows and test with animation disabled.

## Review questions

1. Does the row appear on its first insertion?
2. Is its ordinary computed style visible?
3. Does removing the animation leave the information accessible?
