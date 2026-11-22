# Commit Back when the gesture finishes

- ID: mobile-10
- Category: Mobile
- Tags: Back, Cancellation
- URL: https://axiomui.nischal.fyi/rules/mobile-10

An interactive Back gesture previews a destination. A person can reverse their decision before completion. Keep the draft and navigation stack intact until the system commits.

- Do: Cancel Back · draft and caret return
- Don’t: Cancel Back · draft already popped

## Why it works

Someone can start Back to see what lies underneath a reply, then change their mind. Keeping the draft route alive lets them resume typing at the same character.

- [Android, Predictive back design](https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back)
- [Android Developers · Add support for the predictive back gesture](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)
- [Compose, predictive back progress](https://developer.android.com/develop/ui/compose/system/predictive-back-progress)
- [Apple, interactivePopGestureRecognizer](https://developer.apple.com/documentation/uikit/uinavigationcontroller/interactivepopgesturerecognizer)

## What breaks

Popping at gesture start discards the draft even when the reader cancels.

## How to apply it

1. iOS — Use the navigation controller’s interactive pop when available and respect its cancellation.
2. Android — Drive the preview from predictive Back progress. Restore on cancel and pop once on completion.
3. Web — Leave browser Back available. Replay in-app navigation in a local stack within the teaching frame.

## Before you ship

1. Does canceling Back preserve the caret?
2. Does the draft survive cancellation?
3. How many routes are removed on completion?
