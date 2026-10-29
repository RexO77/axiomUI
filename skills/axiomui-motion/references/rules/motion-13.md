# Use starting styles for entry

- ID: motion-13
- Category: Motion & interaction
- Tags: Animation API, Entry, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-13

Animate new elements from their starting visual state instead of mounting them and then forcing a JavaScript state flip.

- Do: @starting-style { opacity: 0 }
- Don't: useEffect(() => setShown(true))

## Why it works

@starting-style lets the browser animate from a defined starting visual state the moment an element mounts, instead of mounting at its final state and forcing a useEffect to flip a class on the next tick. That extra JS round-trip is fragile and can flash the unanimated final state first.

## What breaks

Relying on useEffect to trigger entry means a slow re-render or effect timing hiccup makes the element flash into place fully formed before the animation class applies, producing an inconsistent, sometimes-broken entrance.

## How to apply it

1. Define @starting-style with opacity and transform values.
2. Remove any useEffect solely dedicated to toggling an entry-animation class.
3. Check browser support and provide a JS fallback only where @starting-style is unavailable.
4. Confirm the starting-style values match the same properties animated in the base transition.

## Review questions

1. Does the element animate in immediately on mount without a visible flash?
2. Is entry animation declared in CSS rather than triggered by a JS effect?
3. Does the entrance ever appear to snap into its final state before animating?
