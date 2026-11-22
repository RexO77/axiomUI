# Mobile checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Keep controls inside the safe area (`mobile-1`)

The background of a checkout bar can reach the glass. Its Pay button needs room on the usable side of the system bar, including its ordinary padding when the inset is zero.

- Do: Pay ends 12 px above the safe boundary · Don’t: 22 px of Pay overlaps the 34 px inset
- [ ] Does Pay keep its ordinary padding at zero inset?
- [ ] After rotation, does the whole target clear the cutout?
- [ ] Is Scaffold padding consumed exactly once?
- Reasoning: `references/rules/mobile-1.md`

## Fit the page above browser bars (`mobile-2`)

A bottom action can disappear on first load because the browser reserves more room for its address bar than the page allowed. Choose the viewport height for the state the reader sees.

- Do: 756 px opening panel · Continue visible · Don’t: 844 px opening panel · Continue below toolbar
- [ ] Can you reach Continue on first load with the bar open?
- [ ] Does retracting and restoring the bar hide an action?
- [ ] Can a longer opening section scroll?
- Reasoning: `references/rules/mobile-2.md`

## Give corner targets more room (`mobile-3`)

A small Close icon can have a generous touch target. Research found greater touch dispersion in corners. Start with the platform’s ordinary target, then test extra room where the cost of missing is high.

- Do: Tap 26 px from Close · 60 px target closes · Don’t: Same tap · 48 px target misses
- [ ] Replay the tap 26 CSS px to the right of Close. Which box contains that point?
- [ ] Compare the seeded cloud with your own taps. Which result describes your hand?
- [ ] Does extra padding encroach on a neighboring target?
- Reasoning: `references/rules/mobile-3.md`

## Bring repeated actions within reach (`mobile-4`)

In a one-handed task, moving a frequently used action lower can reduce the stretch. The comfortable area changes with grip, hand and device size.

- Do: Save falls inside the selected reach arc · Don’t: Top-corner Save falls outside the same arc
- [ ] Does Save stay reachable with either hand?
- [ ] Move the thumb pivot and switch hands. Does the center of Save still sit inside the arc?
- [ ] Can someone complete the task on the larger screen?
- Reasoning: `references/rules/mobile-4.md`

## Let a scroll cancel a press (`mobile-5`)

An inbox row should acknowledge contact before it knows whether the person wants to open it or scroll. Opening on touch-down spends that choice too soon.

- Do: Scroll from row 4 · inbox stays open · Don’t: Scroll from row 4 · message opens on contact
- [ ] Start a scroll on Tide tables. Does the inbox move, or does the message open under your finger?
- [ ] Does a canceled press clear its highlight?
- [ ] Does a completed tap open exactly once?
- Reasoning: `references/rules/mobile-5.md`

## Give single taps an immediate action (`mobile-6`)

When a card waits to distinguish Open from a double-tap shortcut, every ordinary open pays the waiting time. A separate Like button lets the two actions work independently.

- Do: One tap opens without a programmed wait · Don’t: One tap waits for the 300 ms timer
- [ ] Compare the scheduled 300 ms wait with the elapsed time between the tap handler and Open.
- [ ] Can Like still be reached independently?
- [ ] Can both actions be invoked with the keyboard?
- Reasoning: `references/rules/mobile-6.md`

## Show the main destinations (`mobile-7`)

People can choose Orders directly when it is visible among the app’s peer destinations. Use short labels and give the current destination a recognizable state.

- Do: Orders visible · open it in one tap · Don’t: Orders behind Menu · open it in two
- [ ] How many activations take you from Home to Orders?
- [ ] Can you identify the current destination?
- [ ] Does each peer destination retain its label?
- Reasoning: `references/rules/mobile-7.md`

## Keep each tab’s place (`mobile-8`)

A person who checks their bag halfway through reading a product should return to the same product and passage when they switch back.

- Do: Shop → Bag → Shop restores product 18 · Don’t: Shop → Bag → Shop resets to catalog
- [ ] Does Shop reopen product 18?
- [ ] Is the Returns passage visible again?
- [ ] What happens if the text size changes while you are away?
- Reasoning: `references/rules/mobile-8.md`

## Close the sheet before leaving (`mobile-9`)

When a sheet has its own navigation state, Back should dismiss that layer and reveal the page the person was using. Give the sheet a visible exit as well.

- Do: Back closes café details · map pin stays · Don’t: Back leaves the map with details open
- [ ] Does Back dismiss the top sheet first?
- [ ] Does focus return to the selected pin?
- [ ] After an explicit Close, does Back leave the map and Forward restore the right layer? Try a direct link as well.
- Reasoning: `references/rules/mobile-9.md`

## Commit Back when the gesture finishes (`mobile-10`)

An interactive Back gesture previews a destination. A person can reverse their decision before completion. Keep the draft and navigation stack intact until the system commits.

- Do: Cancel Back · draft and caret return · Don’t: Cancel Back · draft already popped
- [ ] Does canceling Back preserve the caret?
- [ ] Does the draft survive cancellation?
- [ ] How many routes are removed on completion?
- Reasoning: `references/rules/mobile-10.md`

## Fit navigation to the window (`mobile-11`)

An unfolded phone or tablet can give an app a narrow window. Switch navigation surfaces according to the available space while keeping the same places and selection.

- Do: 390 dp split window · bottom bar · Don’t: Same window · rail sized for 700 dp device
- [ ] Which surface appears at 599 and 600 dp?
- [ ] Does compact height change that decision?
- [ ] Does Saved remain selected through the resize?
- Reasoning: `references/rules/mobile-11.md`

## Start drags clear of system gestures (`mobile-12`)

The first movement of a slider can belong to the operating system if its handle sits inside a Back gesture region. Place its required drag start in usable space.

- Do: Trim from x=48 · clip gets shorter · Don’t: Trim from x=4 · Back preview opens
- [ ] Who receives the first inward drag?
- [ ] With the right edge selected, can you shorten the clip using the step buttons?
- [ ] Does the leading edge move with the reading direction?
- Reasoning: `references/rules/mobile-12.md`

## Let vertical swipes scroll the page (`mobile-13`)

A horizontal divider embedded in an article should let a reader start a vertical scroll on the handle itself. Declare the allowed gestures before touch-down.

- Do: Swipe up on divider · article scrolls · Don’t: Swipe up on divider · article stays still
- [ ] Can a vertical swipe start on the handle?
- [ ] Does a horizontal drag still move the divider?
- [ ] What happens to the drag when its pointer is canceled?
- Reasoning: `references/rules/mobile-13.md`

## Expose actions hidden behind gestures (`mobile-14`)

Someone looking at a photo cannot see a long press. Give actions hidden behind a press or swipe a visible, named way in.

- Do: More opens Share, Favorite and Delete · Don’t: Same three actions require a long press
- [ ] Can someone add the photo to favorites through More, then return to the same photo?
- [ ] Does scrolling cancel a pending long press?
- [ ] Can a keyboard reach and dismiss the same actions?
- Reasoning: `references/rules/mobile-14.md`

## Use flick speed to choose a stop (`mobile-15`)

A slow drag and a quick flick can lift a sheet the same distance but express different intent. A custom three-stop sheet can use projected travel to choose its resting height.

- Do: Quick 40 px flick · sheet reaches half · Don’t: Same release point · sheet returns to peek
- [ ] At a 160 px release height, which stop does the quick flick select?
- [ ] Where does the slow release settle?
- [ ] Can each stop also be reached with a button?
- Reasoning: `references/rules/mobile-15.md`

## Keep panel scrolling inside the panel (`mobile-16`)

When an independent activity log reaches the end, a fresh swipe inside it should leave the underlying article at its reading position.

- Do: Swipe at log end · article holds position · Don’t: Same swipe chains into the article
- [ ] Swipe over Gates opened, then over the article text. Which scroll offset changes each time?
- [ ] Does scrolling outside the log move the article?
- [ ] What happens when the log is too short to scroll?
- Reasoning: `references/rules/mobile-16.md`

## Keep list flicks from dismissing sheets (`mobile-17`)

In a long sheet, a fast flick can bring the list back to the top. Let that gesture finish before a fresh drag from the top can dismiss the sheet.

- Do: List flick ends at top · sheet stays · Don’t: Same list flick reaches top and dismisses
- [ ] After a flick from departure 25, can you read the first departure without reopening the sheet?
- [ ] Is the sheet still open when the list reaches the top?
- [ ] Can a fresh pull from the top dismiss it?
- Reasoning: `references/rules/mobile-17.md`

## Make the last sheet option reachable (`mobile-18`)

A sheet has a maximum height. Once it reaches that height, its list still needs a scroll range if options extend below the window.

- Do: Expand, scroll and select option 12 · Don’t: Expand · option 12 remains clipped
- [ ] Can you select Wheelchair access after expanding?
- [ ] Can you reach and select the final row with Tab as well as by scrolling?
- [ ] Where does focus return after Close?
- Reasoning: `references/rules/mobile-18.md`

## Apply multiple filters together (`mobile-19`)

When filters live in a sheet, closing it on each choice makes people reopen it to finish the task. Keep a draft selection and show what applying it will return.

- Do: Choose three filters · apply once · Don’t: Three choices · sheet closes three times
- [ ] How many times must you reopen the filters?
- [ ] Does Cancel discard pending choices?
- [ ] Does the count on Show pairs match the list after applying, even when no pairs match?
- Reasoning: `references/rules/mobile-19.md`

## Keep iPhone field text legible (`mobile-20`)

Small editable text can trigger focus zoom in iPhone Safari. Start the computed text size at 16 CSS px at default settings and keep user zoom available.

- Do: 16 px field · model stays at 100% · Don’t: 14 px field · model crops to 114%
- [ ] What is the field’s computed size before focus?
- [ ] Does pinch zoom still work?
- [ ] On an iPhone, what scale does Safari report before focus, after focus and after blur?
- Reasoning: `references/rules/mobile-20.md`

## Keep the caret above the keyboard (`mobile-21`)

A message composer anchored to the layout viewport can sit behind the keyboard. While the reader types, keep the caret and Send within the visible editing area.

- Do: Keyboard starts at y=508 · Send ends there · Don’t: Send ends at y=844 behind the keyboard
- [ ] Can you see the last line while typing?
- [ ] Can you tap Send while the keyboard is open and see your last line arrive in the conversation?
- [ ] Does the composer return when a hardware keyboard is used?
- Reasoning: `references/rules/mobile-21.md`

## Follow the reader’s text size (`mobile-22`)

A reader who enlarges text in Settings should see it change where the task happens. First check whether the text responds. Then test whether the enlarged layout still works.

- Do: Change Body to AX5 · sample grows · Don’t: Change Body to AX5 · sample stays fixed
- [ ] Does the actual label respond to a larger setting?
- [ ] In the iOS fixture, does Body grow from 17 pt to 53 pt at AX5?
- [ ] Does the platform’s text conversion apply to line height too?
- Reasoning: `references/rules/mobile-22.md`

## Let rows grow with enlarged text (`mobile-23`)

A label can scale correctly and still lose its last words inside a fixed-height row. Let the label wrap and the row grow enough to complete the task.

- Do: At 200% the full payment label fits · Don’t: At 200% a 56 dp row clips it
- [ ] Is the full business-account label readable at 200%?
- [ ] Can you still select the wrapped option?
- [ ] At 200% in the Android 14 fixture, do the 34 dp lines fit inside the payment row?
- Reasoning: `references/rules/mobile-23.md`

## Keep values visible above the finger (`mobile-24`)

A changing slider value can be perfectly legible before the gesture and disappear underneath the finger during it. Put the value where it can be read throughout the drag.

- Do: Value bubble clears the modelled fingertip · Don’t: Value inside the thumb is covered
- [ ] Can you read the price throughout the drag?
- [ ] When the bubble would cross the top inset, does the price move to a clear spot?
- [ ] Can the price also be changed from the keyboard?
- Reasoning: `references/rules/mobile-24.md`

## Show confirmation when haptics are off (`mobile-25`)

A person can disable vibration, miss it, or use a device that cannot produce it. After Add to bag, leave a visible and accessible indication that the action succeeded.

- Do: Haptics off · bag count changes to 1 · Don’t: Haptics off · no confirmation appears
- [ ] Is the new bag count visible with vibration off?
- [ ] After a second Add, does the status announce the new quantity once?
- [ ] Does opening the bag show the added item?
- Reasoning: `references/rules/mobile-25.md`

## Keep Undo clear of floating buttons (`mobile-26`)

A two-line snackbar can place Undo underneath a floating Compose button. Lay them out together so both actions remain usable when the message wraps.

- Do: Undo clears Compose · message returns · Don’t: Undo overlaps Compose · draft opens
- [ ] Does a tap in the center of Undo restore the message?
- [ ] After Undo restores the message, can Compose still open a draft?
- [ ] Does the translated two-line message clear both targets?
- Reasoning: `references/rules/mobile-26.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `form-14` Declare what each field expects (`references/checklists/forms.md`)
- `sys-3` Give small icons a larger hit area (`references/checklists/system.md`)
- `motion-8` Show when a control is pressed (`references/checklists/motion.md`)
- `a11y-3` Leave space between touch targets (`references/checklists/accessibility.md`)
