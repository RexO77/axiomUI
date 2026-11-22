# Use flick speed to choose a stop

- ID: mobile-15
- Category: Mobile
- Tags: Detents, Release velocity
- URL: https://axiomui.nischal.fyi/rules/mobile-15

A slow drag and a quick flick can lift a sheet the same distance but express different intent. A custom three-stop sheet can use projected travel to choose its resting height.

- Do: Quick 40 px flick · sheet reaches half
- Don’t: Same release point · sheet returns to peek

## Why it works

Both paths lift the sheet 40 px. Projecting another 0.2 seconds of travel puts the fast release near the half stop and the slow release near peek.

- [Apple, Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
- [Apple HIG, Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Rauno Freiberg, Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design)

## What breaks

A fast flick settles back at the starting stop because its release point was still near peek.

## How to apply it

1. iOS — UIKit offers detents. Apple’s fluid-interface example projects a thrown object’s endpoint. A custom sheet can borrow that idea.
2. Android — Prefer the platform’s sheet behavior. Tune custom settling against Android motion on a device.
3. Web — Estimate recent release velocity, clamp the projected stop, and expose each rest position through a button.

## Before you ship

1. At a 160 px release height, which stop does the quick flick select?
2. Where does the slow release settle?
3. Can each stop also be reached with a button?
