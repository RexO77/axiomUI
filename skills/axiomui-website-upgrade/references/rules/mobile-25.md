# Show confirmation when haptics are off

- ID: mobile-25
- Category: Mobile
- Tags: Haptics, Confirmation
- URL: https://axiomui.nischal.fyi/rules/mobile-25

A person can disable vibration, miss it, or use a device that cannot produce it. After Add to bag, leave a visible and accessible indication that the action succeeded.

- Do: Haptics off · bag count changes to 1
- Don’t: Haptics off · no confirmation appears

## Why it works

After Add to bag, show the new quantity where the shopper can check it. Announce that same change while keyboard focus stays on Add.

- [WebKit, Safari 18.0 features](https://webkit.org/blog/15865/webkit-features-in-safari-18-0/)
- [MDN, Navigator.vibrate()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
- [Apple HIG, Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)

## What breaks

Someone adds an item twice because the first addition appeared to do nothing.

## How to apply it

1. iOS — Use optional system feedback when appropriate. WebKit documents haptics on its native switch in Safari 18.
2. Android — Honor the device’s haptic preferences. Confirm the state even when vibration is unavailable.
3. Web — Feature-detect optional vibration. Expose a visible confirmation and announce the update when the result is outside focus.

## Before you ship

1. Is the new bag count visible with vibration off?
2. After a second Add, does the status announce the new quantity once?
3. Does opening the bag show the added item?
