# Give new elements a starting style

- ID: motion-13
- Category: Motion & interaction
- Tags: Animation API, Entry, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-13

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } }
- Don’t: Row appears immediately on insertion

## Why it works

When a row first appears, the browser may have no previous style to transition from. @starting-style supplies one, so the row can animate into its normal style without a second render to change its class.

- [CSS Transitions · Defining a starting style](https://www.w3.org/TR/css-transitions-2/#defining-before-change-style)
- [MDN · The @starting-style at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style)
- [Chrome Developers · Entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations)
- [React · When effects run](https://react.dev/reference/react/useEffect#caveats)

## What breaks

If a row stays transparent until a script reveals it, someone can tab to its controls before seeing them.

## How to apply it

1. Define final opacity and position in the normal rule.
2. Write the row’s final style first. Then nest @starting-style inside the row’s rule, or put the row selector inside a separate @starting-style block. At equal specificity, the later starting value wins on entry.
3. Insert successive rows and test with animation disabled.

## Before you ship

1. Does the row appear on its first insertion?
2. Can you see the row before a script runs to reveal it?
3. Does removing the animation leave the information accessible?
