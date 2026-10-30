# System & logic checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Skeleton loading (`sys-1`)

- Do: Gray layout pulse · Don't: Giant spinning wheel
- [ ] Does the loading state show gray bars shaped like the final layout instead of a spinner?
- [ ] Does the skeleton match the real content dimensions with no layout jump on load?
- [ ] Is there any full-screen spinner used for initial content loading?
- Reasoning: `references/rules/sys-1.md`

## Empty states (`sys-2`)

- Do: “No projects yet” + “New project” button · Don't: Empty panel, no next step
- [ ] Does the empty screen name what is missing instead of showing a blank box?
- [ ] Is there a visible button or link telling the user how to fix it?
- [ ] Would a first-time user know this state is intentional, not a bug?
- Reasoning: `references/rules/sys-2.md`

## Click targets (Fitts's law) (`sys-3`)

- Do: 44x44px hit area · Don't: 16x16px hit area
- [ ] Does every tappable control measure at least 44x44 including its padding?
- [ ] Are the extra pixels padding rather than margin, so they are actually clickable?
- [ ] On a touch screen, can you hit each control in a row without brushing its neighbour?
- Reasoning: `references/rules/sys-3.md`

## Date formats (`sys-4`)

- Do: Activity: 2m ago · Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- [ ] Do recent activity items show relative time like 2m ago rather than a full date?
- [ ] Do historical or archival records show a fixed absolute date?
- [ ] Does hovering a relative timestamp reveal the exact date and time?
- Reasoning: `references/rules/sys-4.md`

## Design tokens naming (`sys-5`)

- Do: blue-500 (palette) → accent (alias) → component · Don't: $button-blue → component
- [ ] Are base color tokens named by hue and value rather than by function?
- [ ] Is there a semantic alias layer between raw colors and component styles?
- [ ] Would rebranding the primary color require touching more than the alias layer?
- Reasoning: `references/rules/sys-5.md`

## Undo destructive actions (`sys-6`)

- Do: Deleted → Undo (5s) · Don't: Deleted → gone, no undo
- [ ] After deleting, does an Undo option appear for a few seconds before it is final?
- [ ] Is the destructive action delayed on the server until the undo window passes?
- [ ] Is the undo control easy to tap within the toast?
- Reasoning: `references/rules/sys-6.md`

## Show progress for multi-step (`sys-7`)

- Do: Step 2 of 4 · Don't: No progress indicator
- [ ] Does a flow with three or more steps show a current step and total count?
- [ ] Does the total number of steps stay fixed as the user progresses?
- [ ] Can the user tell how much is left at every point in the flow?
- Reasoning: `references/rules/sys-7.md`

## Keyboard navigation (`sys-8`)

- Do: Tab → Enter → Esc flow works · Don't: Click-only interactions, no keyboard support
- [ ] Can every interactive element be reached by pressing Tab alone?
- [ ] Does pressing Enter or Space activate the focused element?
- [ ] Does pressing Escape dismiss the current modal or menu?
- Reasoning: `references/rules/sys-8.md`

## Optimistic UI updates (`sys-9`)

- Do: Heart fills instantly, syncs async · Don't: Spinner on every like button click
- [ ] Does the like or favorite icon change state instantly on tap?
- [ ] Is there no spinner shown while a toggle action syncs in the background?
- [ ] Does a failed sync roll back the state without a jarring error dialog?
- Reasoning: `references/rules/sys-9.md`

## Graceful degradation (`sys-10`)

- Do: Placeholder image + retry option · Don't: Broken image icon / blank screen
- [ ] Does a failed image show a placeholder at the same size, with nothing below it moving?
- [ ] Is there any raw broken-image glyph or blank gap left on the page?
- [ ] Can the user retry the failed request without reloading the whole page?
- Reasoning: `references/rules/sys-10.md`

## Responsive breakpoint strategy (`sys-11`)

- Do: 2 breakpoints: 640px / 1024px (3 tiers) · Don't: 8 breakpoints, one per device
- [ ] Does this layout reflow only at the declared steps, plus the base state below the first one?
- [ ] Does dragging the window through a step produce one clean change rather than a sequence of small shifts?
- [ ] Is there any media query targeting a specific device or screen model?
- Reasoning: `references/rules/sys-11.md`

## Transition only what changes (`sys-13`)

- Do: transition-property: scale, background-color · Don't: transition: all 150ms ease-out
- [ ] Does the CSS specify exact transition properties instead of transition: all?
- [ ] Do unrelated style changes on the element happen instantly, without animating?
- [ ] Does only the intended property, like scale or color, visibly animate on interaction?
- Reasoning: `references/rules/sys-13.md`

## Use will-change sparingly (`sys-14`)

- Do: will-change: transform, opacity · Don't: will-change: all
- [ ] Is will-change scoped to transform and opacity rather than set to all?
- [ ] Is will-change removed from elements once their animation completes?
- [ ] Was will-change added only after an observed stutter, not applied by default?
- Reasoning: `references/rules/sys-14.md`
