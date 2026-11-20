# Motion rule review

The catalog contains 29 authored motion rules. Each entry below compares the rule and deep dive with the values and behavior in the gallery or detailed showcase. Source inspection establishes what the code requests. Actual input latency, frame delivery, comfort and comprehension require observation on the target device or with the intended users.

The shared tracks define the gallery examples. The detailed gesture, tooltip, interruption and main-thread examples have separate implementations. [Showcase tracks](../../../src/components/features/rules/demos/showcase-specs.tsx) · [Playback engine](../../../src/lib/showcase-engine.ts) · [Gesture prototypes](../../../src/components/features/rules/demos/drag-showcases.tsx) · [Tooltip prototype](../../../src/components/features/rules/demos/tooltip-showcase.tsx) · [Interruption prototype](../../../src/components/features/rules/demos/interrupt-showcase.tsx) · [Main-thread experiments](../../../src/components/features/rules/demos/load-showcase.tsx)

## Findings by rule

### motion-1 · Animate by frequency

Both panes run 220ms. Frequency is a scenario assumption. The counter adds nominal entrance duration per replay. A latency claim would require timing actual input. A frequent action may still benefit from continuity. [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) [Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

### motion-2 · Keep keyboard input responsive

The panel tracks differ by 240ms. The keycap takes 90ms in both panes. The K-triggered lesson illustrates timing and has no editable query to measure. Verify real input and focus separately. [WAI-ARIA dialog focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) [Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

### motion-3 · Purpose before motion

The edge drawer and bouncing dialog differ in geometry and component type. Use them to discuss intent. Expressive motion can serve a deliberate purpose. Research on tracking changing charts does not predict comprehension of dialogs. [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) [Heer and Robertson’s graphics-transition experiments](https://idl.uw.edu/papers/animated-transitions)

### motion-4 · Choose easing for the movement

Both rails use the same 360ms track and distance. Inverting the Bézier time coordinate at one third gives 57.6% and 87.7% progress (rounded). Neither a keyword nor a custom curve is inherently preferable. [CSS easing functions](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions) [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/)

### motion-5 · Make the start of an entrance visible

The 220ms tracks implement two custom curves. The accelerating curve has positive displacement before 100ms. Describe the slow start without suggesting a literal pause or an inevitable second click. [CSS easing functions](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions) [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/)

### motion-6 · Time motion to the task

The same menu is rendered at 180ms and 500ms. Carbon scales duration by distance and size and includes durations over 300ms. The demonstration supports a local choice, not a perceptual threshold. [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) [Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

### motion-7 · Tune entrance and exit separately

Toast uses 220/160ms and 360/360ms. This changes overall pace and symmetry together. It cannot isolate a benefit of asymmetry. A passive status toast should leave focus on the task, including when it expires. A separate focus decision arises if the user is operating an action inside the toast. [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) [WCAG status messages and focus](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

### motion-8 · Show when a control is pressed

The held-button tracks use 0.96 and 0.90. Their difference is visible on this size. WCAG addresses cancellation of single-pointer actions with exceptions, and prescribes no scale or frame count. [WCAG pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/)

### motion-9 · Keep surface entrances near full size

Both menu panes fade. One starts at 0.95 and one at zero. The physical-size argument follows transform geometry. The catalog’s former 24px exception and specific acceptable scale interval lacked supporting evidence. [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/) [WCAG animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

### motion-10 · Anchor a popover’s motion to its trigger

An origin marker distinguishes the trigger-facing corner from center on the fixed example. It does not exercise collision detection. Radix exposes an origin derived from alignment and placement. [Radix Popover placement and transform origin](https://www.radix-ui.com/primitives/docs/components/popover) [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/)

### motion-11 · Share tooltip timing across a toolbar

Interactive toolbar uses a 300ms initial delay, a 300ms grace window and a separate 100ms opacity fade. Instant means zero reveal delay. Check focus, Escape and hover travel on the real toolbar. React Aria supplies a concrete modality-specific example. [React Aria tooltip interactions](https://react-aria.adobe.com/Tooltip) [WCAG content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

### motion-12 · Retarget interrupted motion from its current position

The bespoke toggle cancels/restarts a WAAPI run at fixed values on one side and changes a CSS transform target on the other. A restart policy causes the discontinuity. CSS keyframes and WAAPI can also support interruption. [CSS transition reversal](https://www.w3.org/TR/css-transitions-1/#reversing) [Web Animations model](https://www.w3.org/TR/web-animations-1/)

### motion-13 · Give new elements a starting style

The list showcase uses WAAPI tracks on existing scene elements to illustrate an authored start versus an instant reveal. It does not run an insertion experiment or demonstrate React effect timing. Label it as an illustration. A bare declaration inside @starting-style requires a nesting selector supplied by the surrounding style rule, and normal cascade order still applies. [CSS starting styles](https://www.w3.org/TR/css-transitions-2/#defining-before-change-style) [React effect timing](https://react.dev/reference/react/useEffect#caveats)

### motion-14 · Choose animation properties with layout in mind

The 220ms panes compare independent travel with changing height. No trace or layer state is collected. The compositor is an implementation choice. This scene does not establish smoothness or prove a specific paint cost. [Browser animation pipeline and profiling](https://web.dev/articles/animations-guide) [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/)

### motion-15 · Size slide exits to the moving element

Example uses 150% and a fixed 40px on unequal-height toasts. CSS defines a reference box, not a guaranteed offscreen distance. A fixed displacement remains suitable for a small decorative exit. [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/)

### motion-16 · Gate decorative hover motion

The comparison simulates a touch-triggered scale on one side. Media Queries distinguishes primary hover, any-hover and precision. A resized desktop window cannot test a hybrid’s changing input source. [Media Queries interaction features](https://www.w3.org/TR/mediaqueries-4/#mf-interaction) [Pointer Events and pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture)

### motion-17 · Preserve feedback with reduced motion

At normal preference the paired tracks compare a 220ms fade and slide. Under the real preference the engine suppresses movement on both sides. This simulates the design decision without deliberately subjecting a user to the discouraged effect. [WCAG animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

### motion-18 · Use release direction and speed for swipe dismissal

The release calculation uses pointer-up position and samples from the preceding 100ms, so a stationary hold expires the last flick. The prototype checks positive velocity above 0.5px/ms or travel above 60% of its rail. These are demo choices. Flutter’s Dismissible demonstrates an analogous fling alternative with different thresholds. Physical-device testing is needed to tune sensitivity. [Flutter dismiss thresholds and flings](https://api.flutter.dev/flutter/widgets/Dismissible/dismissThresholds.html) [WCAG dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) [WCAG pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)

### motion-19 · Use drag resistance where overshoot is meaningful

One rail applies increasing resistance beyond its wall, one clamps. Both return to the original resting position in this demo. Flutter implements both bouncing and clamping scroll physics. Neither behavior is mandatory across platforms. [Flutter bouncing scroll physics](https://api.flutter.dev/flutter/widgets/BouncingScrollPhysics-class.html) [Flutter clamping scroll physics](https://api.flutter.dev/flutter/widgets/ClampingScrollPhysics-class.html)

### motion-20 · Keep a drag attached to its initiating pointer

The shared surface captures the real pointer. The second pane simulates missed element-local events after the pointer leaves. Pointer Events specifies implicit release after up/cancel and implicit capture on direct manipulation devices. Capture supports the drag itself. WCAG 2.5.7 independently requires a single-pointer way to achieve the same function without dragging unless dragging is essential or the behavior is unmodified user-agent behavior. [Pointer Events and pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture) [WCAG dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

### motion-21 · Keep decorative motion independent of busy scripts

The detailed experiment uses a 2600ms trip and three deliberate 240ms main-thread stalls. Both panes write transform. Its meter records callback gaps from rAF, not compositor frame delivery. CSS and WAAPI can both use browser-driven sampling. [Browser animation pipeline and profiling](https://web.dev/articles/animations-guide) [Web Animations model](https://www.w3.org/TR/web-animations-1/) [Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

### motion-22 · Use a playback controller for programmatic animation

Both panes transform the same chip over 1400ms. The timer ticks every 80ms and does not animate layout. The example demonstrates cadence and playback ownership. It cannot establish that an optimized rAF implementation would be slow. [Web Animations model](https://www.w3.org/TR/web-animations-1/) [Browser animation pipeline and profiling](https://web.dev/articles/animations-guide)

### motion-23 · Scope rapidly changing drag styles

The detailed drag compares the same two forced computed-style probes after each write on a constructed subtree. The readout represents this sampled cost. It does not measure full-frame latency, FPS or universal CSS-variable overhead. [CSS custom-property inheritance](https://www.w3.org/TR/css-variables-1/) [Registered custom properties](https://www.w3.org/TR/css-properties-values-api-1/) [Browser animation pipeline and profiling](https://web.dev/articles/animations-guide)

### motion-24 · Limit the total stagger

Three 220ms tracks give 340ms or 660ms total at 60ms or 220ms intervals. Rows illustrate visibility, not working hit targets. A study of staged transitions in charts does not establish a cognitive optimum for list delays. [Motion stagger scheduling](https://motion.dev/docs/stagger) [Heer and Robertson’s graphics-transition experiments](https://idl.uw.edu/papers/animated-transitions)

### motion-25 · Review motion slowly, then at normal speed

The paired toast reaches 0.55 opacity at its 0.02 keyframe offset. One timeline is 880ms and one 220ms. Slow playback helps locate this abrupt rise. The example supplies no evidence for a 200ms limit on perceiving differences. [Chrome animation inspection](https://developer.chrome.com/docs/devtools/css/animations)

### motion-26 · Sequence panel content when order explains something

The card staggers three groups by 90ms versus fading them together. This demonstrates the treatments. No reading-order or comprehension experiment was performed on this panel. A single fade is defensible for routine dialogs. [WAI-ARIA dialog focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) [Motion stagger scheduling](https://motion.dev/docs/stagger) [Heer and Robertson’s graphics-transition experiments](https://idl.uw.edu/papers/animated-transitions)

### motion-27 · Keep routine exits quiet

The stage shows a Dismiss button fading and traveling −12px in 150ms versus −100% plus scale in 400ms. Several variables change. Treat these as recipes for this exit, not an optimization of one parameter. [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) [CSS transform geometry](https://www.w3.org/TR/css-transforms-1/)

### motion-28 · Make icon state changes recognizable

The 300ms track crossfades two glyphs, scales from 0.25 and uses up to 4px blur. The other swaps immediately. This is a treatment choice. WCAG addresses the programmatic result for qualifying status messages. [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) [WCAG animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) [Browser animation pipeline and profiling](https://web.dev/articles/animations-guide)

### motion-29 · Show the initial interface in its ready state

Reload UI replays a 0ms ready state and a 220ms entrance in the showcase engine. It simulates initial page behavior. The Motion API example refers specifically to children present on first render. [Motion initial animations](https://motion.dev/docs/react-animate-presence#initial) [WAI-ARIA dialog focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
