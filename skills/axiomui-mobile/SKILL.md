---
name: axiomui-mobile
description: Use Axiom UI’s mobile guidance to fit actions above system and browser bars, handle taps, swipes and Back, preserve tab state, coordinate sheets and scrolling, keep editing controls in view, respect text size or confirm actions on iOS, Android and mobile web.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Mobile

Start at checkout with the system bars visible. Try Pay, rotate the phone and try again. Then follow the same task with a keyboard open or text enlarged. Record the platform, available window and control that received the input.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test for the failure the Don’t example shows. For a standard, check the applicable requirement and its exceptions. For a design convention, test with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule ID and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Keep controls inside the safe area (`mobile-1`)

The background of a checkout bar can reach the glass. Its Pay button needs room on the usable side of the system bar, including its ordinary padding when the inset is zero.

- Do: Pay ends 12 px above the safe boundary
- Don’t: 22 px of Pay overlaps the 34 px inset
- Reasoning: `references/rules/mobile-1.md` · https://axiomui.nischal.fyi/rules/mobile-1

### Fit the page above browser bars (`mobile-2`)

A bottom action can disappear on first load because the browser reserves more room for its address bar than the page allowed. Choose the viewport height for the state the reader sees.

- Do: 756 px opening panel · Continue visible
- Don’t: 844 px opening panel · Continue below toolbar
- Reasoning: `references/rules/mobile-2.md` · https://axiomui.nischal.fyi/rules/mobile-2

### Give corner targets more room (`mobile-3`)

A small Close icon can have a generous touch target. Research found greater touch dispersion in corners. Start with the platform’s ordinary target, then test extra room where the cost of missing is high.

- Do: Tap 26 px from Close · 60 px target closes
- Don’t: Same tap · 48 px target misses
- Reasoning: `references/rules/mobile-3.md` · https://axiomui.nischal.fyi/rules/mobile-3

### Bring repeated actions within reach (`mobile-4`)

In a one-handed task, moving a frequently used action lower can reduce the stretch. The comfortable area changes with grip, hand and device size.

- Do: Save falls inside the selected reach arc
- Don’t: Top-corner Save falls outside the same arc
- Reasoning: `references/rules/mobile-4.md` · https://axiomui.nischal.fyi/rules/mobile-4

### Let a scroll cancel a press (`mobile-5`)

An inbox row should acknowledge contact before it knows whether the person wants to open it or scroll. Opening on touch-down spends that choice too soon.

- Do: Scroll from row 4 · inbox stays open
- Don’t: Scroll from row 4 · message opens on contact
- Reasoning: `references/rules/mobile-5.md` · https://axiomui.nischal.fyi/rules/mobile-5

### Give single taps an immediate action (`mobile-6`)

When a card waits to distinguish Open from a double-tap shortcut, every ordinary open pays the waiting time. A separate Like button lets the two actions work independently.

- Do: One tap opens without a programmed wait
- Don’t: One tap waits for the 300 ms timer
- Reasoning: `references/rules/mobile-6.md` · https://axiomui.nischal.fyi/rules/mobile-6

### Show the main destinations (`mobile-7`)

People can choose Orders directly when it is visible among the app’s peer destinations. Use short labels and give the current destination a recognizable state.

- Do: Orders visible · open it in one tap
- Don’t: Orders behind Menu · open it in two
- Reasoning: `references/rules/mobile-7.md` · https://axiomui.nischal.fyi/rules/mobile-7

### Keep each tab’s place (`mobile-8`)

A person who checks their bag halfway through reading a product should return to the same product and passage when they switch back.

- Do: Shop → Bag → Shop restores product 18
- Don’t: Shop → Bag → Shop resets to catalog
- Reasoning: `references/rules/mobile-8.md` · https://axiomui.nischal.fyi/rules/mobile-8

### Close the sheet before leaving (`mobile-9`)

When a sheet has its own navigation state, Back should dismiss that layer and reveal the page the person was using. Give the sheet a visible exit as well.

- Do: Back closes café details · map pin stays
- Don’t: Back leaves the map with details open
- Reasoning: `references/rules/mobile-9.md` · https://axiomui.nischal.fyi/rules/mobile-9

### Commit Back when the gesture finishes (`mobile-10`)

An interactive Back gesture previews a destination. A person can reverse their decision before completion. Keep the draft and navigation stack intact until the system commits.

- Do: Cancel Back · draft and caret return
- Don’t: Cancel Back · draft already popped
- Reasoning: `references/rules/mobile-10.md` · https://axiomui.nischal.fyi/rules/mobile-10

### Fit navigation to the window (`mobile-11`)

An unfolded phone or tablet can give an app a narrow window. Switch navigation surfaces according to the available space while keeping the same places and selection.

- Do: 390 dp split window · bottom bar
- Don’t: Same window · rail sized for 700 dp device
- Reasoning: `references/rules/mobile-11.md` · https://axiomui.nischal.fyi/rules/mobile-11

### Start drags clear of system gestures (`mobile-12`)

The first movement of a slider can belong to the operating system if its handle sits inside a Back gesture region. Place its required drag start in usable space.

- Do: Trim from x=48 · clip gets shorter
- Don’t: Trim from x=4 · Back preview opens
- Reasoning: `references/rules/mobile-12.md` · https://axiomui.nischal.fyi/rules/mobile-12

### Let vertical swipes scroll the page (`mobile-13`)

A horizontal divider embedded in an article should let a reader start a vertical scroll on the handle itself. Declare the allowed gestures before touch-down.

- Do: Swipe up on divider · article scrolls
- Don’t: Swipe up on divider · article stays still
- Reasoning: `references/rules/mobile-13.md` · https://axiomui.nischal.fyi/rules/mobile-13

### Expose actions hidden behind gestures (`mobile-14`)

Someone looking at a photo cannot see a long press. Give actions hidden behind a press or swipe a visible, named way in.

- Do: More opens Share, Favorite and Delete
- Don’t: Same three actions require a long press
- Reasoning: `references/rules/mobile-14.md` · https://axiomui.nischal.fyi/rules/mobile-14

### Use flick speed to choose a stop (`mobile-15`)

A slow drag and a quick flick can lift a sheet the same distance but express different intent. A custom three-stop sheet can use projected travel to choose its resting height.

- Do: Quick 40 px flick · sheet reaches half
- Don’t: Same release point · sheet returns to peek
- Reasoning: `references/rules/mobile-15.md` · https://axiomui.nischal.fyi/rules/mobile-15

### Keep panel scrolling inside the panel (`mobile-16`)

When an independent activity log reaches the end, a fresh swipe inside it should leave the underlying article at its reading position.

- Do: Swipe at log end · article holds position
- Don’t: Same swipe chains into the article
- Reasoning: `references/rules/mobile-16.md` · https://axiomui.nischal.fyi/rules/mobile-16

### Keep list flicks from dismissing sheets (`mobile-17`)

In a long sheet, a fast flick can bring the list back to the top. Let that gesture finish before a fresh drag from the top can dismiss the sheet.

- Do: List flick ends at top · sheet stays
- Don’t: Same list flick reaches top and dismisses
- Reasoning: `references/rules/mobile-17.md` · https://axiomui.nischal.fyi/rules/mobile-17

### Make the last sheet option reachable (`mobile-18`)

A sheet has a maximum height. Once it reaches that height, its list still needs a scroll range if options extend below the window.

- Do: Expand, scroll and select option 12
- Don’t: Expand · option 12 remains clipped
- Reasoning: `references/rules/mobile-18.md` · https://axiomui.nischal.fyi/rules/mobile-18

### Apply multiple filters together (`mobile-19`)

When filters live in a sheet, closing it on each choice makes people reopen it to finish the task. Keep a draft selection and show what applying it will return.

- Do: Choose three filters · apply once
- Don’t: Three choices · sheet closes three times
- Reasoning: `references/rules/mobile-19.md` · https://axiomui.nischal.fyi/rules/mobile-19

### Keep iPhone field text legible (`mobile-20`)

Small editable text can trigger focus zoom in iPhone Safari. Start the computed text size at 16 CSS px at default settings and keep user zoom available.

- Do: 16 px field · model stays at 100%
- Don’t: 14 px field · model crops to 114%
- Reasoning: `references/rules/mobile-20.md` · https://axiomui.nischal.fyi/rules/mobile-20

### Keep the caret above the keyboard (`mobile-21`)

A message composer anchored to the layout viewport can sit behind the keyboard. While the reader types, keep the caret and Send within the visible editing area.

- Do: Keyboard starts at y=508 · Send ends there
- Don’t: Send ends at y=844 behind the keyboard
- Reasoning: `references/rules/mobile-21.md` · https://axiomui.nischal.fyi/rules/mobile-21

### Follow the reader’s text size (`mobile-22`)

A reader who enlarges text in Settings should see it change where the task happens. First check whether the text responds. Then test whether the enlarged layout still works.

- Do: Change Body to AX5 · sample grows
- Don’t: Change Body to AX5 · sample stays fixed
- Reasoning: `references/rules/mobile-22.md` · https://axiomui.nischal.fyi/rules/mobile-22

### Let rows grow with enlarged text (`mobile-23`)

A label can scale correctly and still lose its last words inside a fixed-height row. Let the label wrap and the row grow enough to complete the task.

- Do: At 200% the full payment label fits
- Don’t: At 200% a 56 dp row clips it
- Reasoning: `references/rules/mobile-23.md` · https://axiomui.nischal.fyi/rules/mobile-23

### Keep values visible above the finger (`mobile-24`)

A changing slider value can be perfectly legible before the gesture and disappear underneath the finger during it. Put the value where it can be read throughout the drag.

- Do: Value bubble clears the modelled fingertip
- Don’t: Value inside the thumb is covered
- Reasoning: `references/rules/mobile-24.md` · https://axiomui.nischal.fyi/rules/mobile-24

### Show confirmation when haptics are off (`mobile-25`)

A person can disable vibration, miss it, or use a device that cannot produce it. After Add to bag, leave a visible and accessible indication that the action succeeded.

- Do: Haptics off · bag count changes to 1
- Don’t: Haptics off · no confirmation appears
- Reasoning: `references/rules/mobile-25.md` · https://axiomui.nischal.fyi/rules/mobile-25

### Keep Undo clear of floating buttons (`mobile-26`)

A two-line snackbar can place Undo underneath a floating Compose button. Lay them out together so both actions remain usable when the message wraps.

- Do: Undo clears Compose · message returns
- Don’t: Undo overlaps Compose · draft opens
- Reasoning: `references/rules/mobile-26.md` · https://axiomui.nischal.fyi/rules/mobile-26

## Cross-listed from other domains

These lessons cover target size, spacing, pressed feedback and field hints used throughout the phone tasks.

### Declare what each field expects (`form-14`)

Set type, inputmode and autocomplete so browsers can offer the right keyboard and saved answers. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes.

- From: Forms & inputs
- Do: Email keyboard · saved email address suggested
- Don’t: Plain keyboard · capitalizes Maya@
- Reasoning: `references/rules/form-14.md` · https://axiomui.nischal.fyi/rules/form-14

### Give small icons a larger hit area (`sys-3`)

Size the hit area separately from the icon. Aim for 44 × 44 CSS pixels on touch. WCAG 2.2 AA requires at least 24 × 24 CSS pixels unless an exception applies.

- From: System & logic
- Do: 44 × 44px hit area
- Don’t: 16 × 16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Show when a control is pressed (`motion-8`)

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- From: Motion & interaction
- Do: Pressed button face · scale(0.96)
- Don’t: Pressed button face · scale(0.90)
- Reasoning: `references/rules/motion-8.md` · https://axiomui.nischal.fyi/rules/motion-8

### Leave space between touch targets (`a11y-3`)

Leave room between actions such as Cancel and Delete. Here, an 8px gap catches a tap 3px past Cancel. WCAG tests target size and spacing together.

- From: Accessibility & inclusivity
- Do: 8px gap between buttons
- Don’t: 0px gap between buttons
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Related

If installed, `axiomui` covers every domain and `axiomui-audit` provides a read-only review. You can use this domain skill on its own.
