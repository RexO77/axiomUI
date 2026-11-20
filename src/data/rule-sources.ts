import type { RuleSource } from "@/lib/rule-prose-types";

/** Primary references selected for each rule in docs/research/rule-review. Read through the server prose builder. */
export const ruleSources: Readonly<Record<string, readonly RuleSource[]>> = {
  "typo-1": [
    { title: "Microsoft Writing Style Guide · Capitalization", href: "https://learn.microsoft.com/en-us/style-guide/capitalization" },
  ],
  "typo-2": [
    { title: "USWDS · Typesetting guidance", href: "https://designsystem.digital.gov/components/typography/" },
    { title: "WCAG 2.2 · Text spacing", href: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html" },
  ],
  "typo-3": [
    { title: "WCAG 2.2 · Text spacing", href: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html" },
    { title: "USWDS · Line height", href: "https://designsystem.digital.gov/design-tokens/typesetting/line-height/" },
  ],
  "typo-4": [
    { title: "IBM Carbon · Type sets", href: "https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets" },
  ],
  "typo-5": [
    { title: "USWDS · Font families", href: "https://designsystem.digital.gov/design-tokens/typesetting/font-family/" },
  ],
  "typo-6": [
    { title: "WCAG 2.2 · Contrast (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" },
  ],
  "typo-7": [
    { title: "GOV.UK · Tables with numeric columns", href: "https://design-system.service.gov.uk/components/table/" },
    { title: "CSS Fonts · Numeric glyph variants", href: "https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop" },
  ],
  "typo-8": [
    { title: "GOV.UK · Text alignment", href: "https://design-system.service.gov.uk/styles/font-override-classes/#text-alignment" },
  ],
  "typo-9": [
    { title: "IBM Carbon · Type sets", href: "https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets" },
  ],
  "typo-10": [
    { title: "CSS Overflow · Text overflow and ellipsis", href: "https://www.w3.org/TR/css-overflow-3/#text-overflow" },
    { title: "WCAG 2.2 · Reflow", href: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html" },
  ],
  "typo-11": [
    { title: "USWDS · Typesetting and optical size", href: "https://designsystem.digital.gov/design-tokens/typesetting/overview/" },
    { title: "WCAG 2.2 · Resize text", href: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html" },
  ],
  "typo-12": [
    { title: "CSS Text · Wrapping styles", href: "https://www.w3.org/TR/css-text-4/#text-wrap-style" },
  ],
  "typo-13": [
    { title: "WebKit · Better typography with text-wrap: pretty", href: "https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/" },
    { title: "CSS Text · Wrapping styles", href: "https://www.w3.org/TR/css-text-4/#text-wrap-style" },
  ],
  "typo-14": [
    { title: "W3C Internationalization · Inline bidirectional text", href: "https://www.w3.org/International/articles/inline-bidi-markup/" },
    { title: "W3C Internationalization · Document direction", href: "https://www.w3.org/International/questions/qa-html-dir" },
  ],

  "layout-1": [
    { title: "USWDS · Spacing units", href: "https://designsystem.digital.gov/design-tokens/spacing-units/" },
  ],
  "layout-2": [
    { title: "USWDS · Typesetting guidance", href: "https://designsystem.digital.gov/components/typography/" },
    { title: "CSS Values · Font-relative lengths", href: "https://www.w3.org/TR/css-values-4/#ch" },
  ],
  "layout-3": [
    { title: "W3C WAI · Grouping form controls", href: "https://www.w3.org/WAI/tutorials/forms/grouping/" },
    { title: "IBM Carbon · Spacing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview" },
  ],
  "layout-4": [
    { title: "Apple · Create custom symbols", href: "https://developer.apple.com/videos/play/wwdc2021/10250/" },
  ],
  "layout-5": [
    { title: "USWDS · Buttons", href: "https://designsystem.digital.gov/components/button/" },
    { title: "WCAG 2.2 · Target size (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" },
  ],
  "layout-6": [
    { title: "CSS Box Alignment · Aligning items", href: "https://www.w3.org/TR/css-align-3/#align-items-property" },
    { title: "Apple · Create custom symbols", href: "https://developer.apple.com/videos/play/wwdc2021/10250/" },
  ],
  "layout-7": [
    { title: "USWDS · Cards", href: "https://designsystem.digital.gov/components/card/" },
  ],
  "layout-8": [
    { title: "CSS Box Alignment · Gaps between boxes", href: "https://www.w3.org/TR/css-align-3/#gaps" },
    { title: "IBM Carbon · Spacing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview" },
  ],
  "layout-9": [
    { title: "GOV.UK · Spacing", href: "https://design-system.service.gov.uk/styles/spacing/" },
  ],
  "layout-10": [
    { title: "IBM Carbon · Spacing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview" },
  ],
  "layout-11": [
    { title: "CSS · Stacking contexts", href: "https://www.w3.org/TR/CSS2/visuren.html#z-index" },
    { title: "CSS Positioned Layout · The top layer", href: "https://www.w3.org/TR/css-position-4/#top-layer" },
  ],

  "color-1": [
    { title: "Atlassian · Color roles", href: "https://atlassian.design/foundations/color" },
  ],
  "color-2": [
    { title: "WCAG 2.2 · Contrast (enhanced)", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html" },
  ],
  "color-3": [
    { title: "CSS Backgrounds and Borders · Shadow layers", href: "https://www.w3.org/TR/css-backgrounds-3/#shadow-layers" },
    { title: "Atlassian · Elevation", href: "https://atlassian.design/foundations/elevation" },
  ],
  "color-4": [
    { title: "WCAG 2.2 · Use of color", href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
    { title: "Atlassian · Color roles", href: "https://atlassian.design/foundations/color" },
  ],
  "color-5": [
    { title: "WCAG 2.2 · Non-text contrast", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" },
  ],
  "color-6": [
    { title: "WCAG 2.2 · Contrast at control boundaries", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries" },
  ],
  "color-7": [
    { title: "Atlassian · Color roles", href: "https://atlassian.design/foundations/color" },
    { title: "WCAG 2.2 · Non-text contrast", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" },
  ],
  "color-8": [
    { title: "Atlassian · Elevation", href: "https://atlassian.design/foundations/elevation" },
  ],
  "color-9": [
    { title: "WCAG 2.2 · Contrast (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" },
  ],
  "color-10": [
    { title: "W3C · Simple alpha compositing", href: "https://www.w3.org/TR/compositing-1/#simplealphacompositing" },
    { title: "Atlassian · Elevation", href: "https://atlassian.design/foundations/elevation" },
  ],
  "color-11": [
    { title: "W3C · Simple alpha compositing", href: "https://www.w3.org/TR/compositing-1/#simplealphacompositing" },
    { title: "WCAG 2.2 · Non-text contrast", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" },
  ],
  "color-12": [
    { title: "CSS Backgrounds and Borders · Shadow layers", href: "https://www.w3.org/TR/css-backgrounds-3/#shadow-layers" },
    { title: "CSS Color Adjustment · Forced colors", href: "https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties" },
  ],

  "comp-1": [
    { title: "GOV.UK · Button emphasis and usage", href: "https://design-system.service.gov.uk/components/button/" },
  ],
  "comp-2": [
    { title: "WCAG 2.2 · Error prevention (legal, financial, data)", href: "https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html" },
    { title: "WAI-ARIA APG · Modal dialog pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
  ],
  "comp-3": [
    { title: "CSS Backgrounds and Borders · Corner shaping", href: "https://www.w3.org/TR/css-backgrounds-3/#corner-shaping" },
  ],
  "comp-4": [
    { title: "Fluent · Avatar shapes and variations", href: "https://fluent2.microsoft.design/components/web/react/core/avatar/usage" },
  ],
  "comp-5": [
    { title: "Fluent · Inline and overlay drawers", href: "https://fluent2.microsoft.design/components/web/react/core/drawer/usage" },
    { title: "WAI-ARIA APG · Modal dialog pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
  ],
  "comp-6": [
    { title: "GOV.UK · Error messages", href: "https://design-system.service.gov.uk/components/error-message/" },
    { title: "GOV.UK · Error summaries", href: "https://design-system.service.gov.uk/components/error-summary/" },
  ],
  "comp-7": [
    { title: "Fluent · Button labels and icons", href: "https://fluent2.microsoft.design/components/web/react/core/button/usage" },
    { title: "WAI-ARIA APG · Button pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/button/" },
  ],
  "comp-8": [
    { title: "GOV.UK · Button emphasis and usage", href: "https://design-system.service.gov.uk/components/button/" },
    { title: "WAI-ARIA APG · Focusability of disabled controls", href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols" },
  ],
  "comp-9": [
    { title: "Stripe · Idempotent requests", href: "https://docs.stripe.com/api/idempotent_requests" },
    { title: "WCAG 2.2 · Status messages", href: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html" },
  ],
  "comp-10": [
    { title: "IBM Carbon · Icon sizing and alignment", href: "https://www.carbondesignsystem.com/building-blocks/foundations/icons/guidelines" },
  ],
  "comp-11": [
    { title: "HTML · Links and nested interactive content", href: "https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element" },
    { title: "WCAG 2.2 · Target size (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" },
  ],
  "comp-12": [
    { title: "WAI-ARIA APG · Modal dialog pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
  ],
  "comp-13": [
    { title: "W3C WAI · Complex images", href: "https://www.w3.org/WAI/tutorials/images/complex/" },
    { title: "USWDS · Data visualizations", href: "https://designsystem.digital.gov/components/data-visualizations/" },
  ],

  "form-1": [
    { title: "W3C WAI · Labeling form controls", href: "https://www.w3.org/WAI/tutorials/forms/labels/" },
    { title: "GOV.UK · Text inputs", href: "https://design-system.service.gov.uk/components/text-input/" },
  ],
  "form-2": [
    { title: "HTML · The placeholder attribute", href: "https://html.spec.whatwg.org/multipage/input.html#the-placeholder-attribute" },
  ],
  "form-3": [
    { title: "W3C WAI · Form instructions", href: "https://www.w3.org/WAI/tutorials/forms/instructions/" },
    { title: "GOV.UK · Question pages", href: "https://design-system.service.gov.uk/patterns/question-pages/" },
  ],
  "form-4": [
    { title: "GOV.UK · Address forms", href: "https://design-system.service.gov.uk/patterns/addresses/" },
  ],
  "form-5": [
    { title: "GOV.UK · Radio buttons", href: "https://design-system.service.gov.uk/components/radios/" },
    { title: "GOV.UK · Checkboxes", href: "https://design-system.service.gov.uk/components/checkboxes/" },
  ],
  "form-6": [
    { title: "GOV.UK · Select menus", href: "https://design-system.service.gov.uk/components/select/" },
    { title: "GOV.UK · Radio buttons", href: "https://design-system.service.gov.uk/components/radios/" },
  ],
  "form-7": [
    { title: "WAI-ARIA APG · Switch pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/" },
    { title: "Fluent · Switch behavior", href: "https://fluent2.microsoft.design/components/web/react/core/switch/usage" },
  ],
  "form-8": [
    { title: "GOV.UK · Form validation", href: "https://design-system.service.gov.uk/patterns/validation/" },
  ],
  "form-9": [
    { title: "W3C WAI · Form instructions", href: "https://www.w3.org/WAI/tutorials/forms/instructions/" },
    { title: "GOV.UK · Date inputs", href: "https://design-system.service.gov.uk/components/date-input/" },
  ],
  "form-10": [
    { title: "WCAG 2.2 · Focus order", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html" },
    { title: "W3C Internationalization · Personal names around the world", href: "https://www.w3.org/International/questions/qa-personal-names" },
  ],
  "form-11": [
    { title: "WCAG 2.2 · Redundant entry", href: "https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html" },
    { title: "HTML · Autofill field names", href: "https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill" },
  ],
  "form-12": [
    { title: "WCAG 2.2 · Status messages", href: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html" },
    { title: "GOV.UK · Confirmation pages", href: "https://design-system.service.gov.uk/patterns/confirmation-pages/" },
  ],
  "form-13": [
    { title: "WCAG 2.2 · Accessible authentication (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html" },
    { title: "W3C WAI · Failure to accept a complete code", href: "https://www.w3.org/WAI/WCAG22/Techniques/failures/F109" },
  ],

  "sys-1": [
    { title: "IBM Carbon · Loading patterns", href: "https://www.carbondesignsystem.com/building-blocks/core/patterns/loading" },
  ],
  "sys-2": [
    { title: "IBM Carbon · Empty states", href: "https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states" },
  ],
  "sys-3": [
    { title: "WCAG 2.2 · Target size (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" },
    { title: "WCAG 2.2 · Target size (enhanced)", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html" },
  ],
  "sys-4": [
    { title: "ECMA-402 · Relative time formatting", href: "https://tc39.es/ecma402/#relativetimeformat-objects" },
    { title: "ECMA-402 · Date and time formatting", href: "https://tc39.es/ecma402/#datetimeformat-objects" },
  ],
  "sys-5": [
    { title: "Design Tokens Community Group · Aliases and references", href: "https://www.designtokens.org/tr/2025.10/format/#aliases-references" },
  ],
  "sys-6": [
    { title: "WCAG 2.2 · Error prevention (legal, financial, data)", href: "https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html" },
    { title: "WCAG 2.2 · Timing adjustable", href: "https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html" },
  ],
  "sys-7": [
    { title: "USWDS · Step indicators", href: "https://designsystem.digital.gov/components/step-indicator/" },
  ],
  "sys-8": [
    { title: "WCAG 2.2 · Keyboard access", href: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html" },
    { title: "WAI-ARIA APG · Keyboard interface practices", href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/" },
  ],
  "sys-9": [
    { title: "React · Optimistic updates and error recovery", href: "https://react.dev/reference/react/useOptimistic" },
  ],
  "sys-10": [
    { title: "W3C WAI · Choosing image alternatives", href: "https://www.w3.org/WAI/tutorials/images/decision-tree/" },
    { title: "Stripe · Idempotent requests", href: "https://docs.stripe.com/api/idempotent_requests" },
  ],
  "sys-11": [
    { title: "web.dev · Media queries", href: "https://web.dev/learn/design/media-queries" },
    { title: "WCAG 2.2 · Reflow", href: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html" },
  ],
  "sys-13": [
    { title: "CSS Transitions · Starting a transition", href: "https://www.w3.org/TR/css-transitions-1/#starting" },
    { title: "CSS Transitions · Selecting properties to transition", href: "https://www.w3.org/TR/css-transitions-1/#transition-property-property" },
  ],
  "sys-14": [
    { title: "CSS Will Change · The will-change property", href: "https://www.w3.org/TR/css-will-change-1/#will-change" },
  ],

  "a11y-1": [
    { title: "WCAG 2.2 · Focus visible", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" },
    { title: "WCAG 2.2 · Focus not obscured (minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html" },
    { title: "WCAG 2.2 · Focus appearance", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html" },
  ],
  "a11y-2": [
    { title: "WCAG 2.2 · Use of color", href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
    { title: "WCAG 2.2 · Error identification", href: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html" },
  ],
  "a11y-3": [
    { title: "WCAG 2.2 · Target spacing", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html#spacing" },
  ],

  "motion-1": [
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
    { title: "web.dev · Interaction latency and presentation delay", href: "https://web.dev/articles/optimize-inp" },
  ],
  "motion-2": [
    { title: "WAI-ARIA APG · Modal dialog pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
    { title: "web.dev · Interaction latency and presentation delay", href: "https://web.dev/articles/optimize-inp" },
  ],
  "motion-3": [
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
  ],
  "motion-4": [
    { title: "CSS Easing · Cubic Bézier curves", href: "https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions" },
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
  ],
  "motion-5": [
    { title: "CSS Easing · Cubic Bézier curves", href: "https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions" },
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
  ],
  "motion-6": [
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
  ],
  "motion-7": [
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
    { title: "WCAG 2.2 · Status messages", href: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html" },
  ],
  "motion-8": [
    { title: "WCAG 2.2 · Pointer cancellation", href: "https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html" },
    { title: "CSS Transforms · Transform geometry", href: "https://www.w3.org/TR/css-transforms-1/" },
  ],
  "motion-9": [
    { title: "CSS Transforms · Transform geometry", href: "https://www.w3.org/TR/css-transforms-1/" },
    { title: "WCAG 2.2 · Animation from interactions", href: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html" },
  ],
  "motion-10": [
    { title: "Radix · Popover placement and transform origin", href: "https://www.radix-ui.com/primitives/docs/components/popover" },
    { title: "CSS Transforms · Transform geometry", href: "https://www.w3.org/TR/css-transforms-1/" },
  ],
  "motion-11": [
    { title: "React Aria · Tooltip interactions and delays", href: "https://react-aria.adobe.com/Tooltip" },
    { title: "WCAG 2.2 · Content on hover or focus", href: "https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html" },
  ],
  "motion-12": [
    { title: "CSS Transitions · Reversing an interrupted transition", href: "https://www.w3.org/TR/css-transitions-1/#reversing" },
    { title: "W3C · Web Animations timing and playback", href: "https://www.w3.org/TR/web-animations-1/" },
  ],
  "motion-13": [
    { title: "CSS Transitions · Defining a starting style", href: "https://www.w3.org/TR/css-transitions-2/#defining-before-change-style" },
    { title: "React · When effects run", href: "https://react.dev/reference/react/useEffect#caveats" },
  ],
  "motion-14": [
    { title: "web.dev · Animation performance and profiling", href: "https://web.dev/articles/animations-guide" },
    { title: "CSS Transforms · Transform geometry", href: "https://www.w3.org/TR/css-transforms-1/" },
  ],
  "motion-15": [
    { title: "CSS Transforms · Transform geometry", href: "https://www.w3.org/TR/css-transforms-1/" },
  ],
  "motion-16": [
    { title: "Media Queries · Hover and pointer capabilities", href: "https://www.w3.org/TR/mediaqueries-4/#mf-interaction" },
  ],
  "motion-17": [
    { title: "WCAG 2.2 · Animation from interactions", href: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html" },
    { title: "WCAG 2.2 · Status messages", href: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html" },
  ],
  "motion-18": [
    { title: "Flutter · Swipe dismissal thresholds", href: "https://api.flutter.dev/flutter/widgets/Dismissible/dismissThresholds.html" },
    { title: "WCAG 2.2 · Dragging movements", href: "https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html" },
    { title: "WCAG 2.2 · Pointer cancellation", href: "https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html" },
  ],
  "motion-19": [
    { title: "Flutter · Bouncing scroll physics", href: "https://api.flutter.dev/flutter/widgets/BouncingScrollPhysics-class.html" },
    { title: "Flutter · Clamping scroll physics", href: "https://api.flutter.dev/flutter/widgets/ClampingScrollPhysics-class.html" },
  ],
  "motion-20": [
    { title: "Pointer Events · Pointer capture", href: "https://www.w3.org/TR/pointerevents3/#pointer-capture" },
    { title: "WCAG 2.2 · Dragging movements", href: "https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html" },
  ],
  "motion-21": [
    { title: "web.dev · Animation performance and profiling", href: "https://web.dev/articles/animations-guide" },
    { title: "W3C · Web Animations timing and playback", href: "https://www.w3.org/TR/web-animations-1/" },
    { title: "web.dev · Interaction latency and presentation delay", href: "https://web.dev/articles/optimize-inp" },
  ],
  "motion-22": [
    { title: "W3C · Web Animations timing and playback", href: "https://www.w3.org/TR/web-animations-1/" },
    { title: "web.dev · Animation performance and profiling", href: "https://web.dev/articles/animations-guide" },
  ],
  "motion-23": [
    { title: "CSS Custom Properties · Inheritance and substitution", href: "https://www.w3.org/TR/css-variables-1/" },
    { title: "CSS Properties and Values API · Registered properties", href: "https://www.w3.org/TR/css-properties-values-api-1/" },
  ],
  "motion-24": [
    { title: "Motion · Staggering animations", href: "https://motion.dev/docs/stagger" },
  ],
  "motion-25": [
    { title: "Chrome DevTools · Inspecting animations", href: "https://developer.chrome.com/docs/devtools/css/animations" },
  ],
  "motion-26": [
    { title: "WAI-ARIA APG · Modal dialog pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
    { title: "Motion · Staggering animations", href: "https://motion.dev/docs/stagger" },
  ],
  "motion-27": [
    { title: "IBM Carbon · Motion principles and timing", href: "https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview" },
  ],
  "motion-28": [
    { title: "WCAG 2.2 · Status messages", href: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html" },
    { title: "WCAG 2.2 · Animation from interactions", href: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html" },
  ],
  "motion-29": [
    { title: "Motion · Initial animations in AnimatePresence", href: "https://motion.dev/docs/react-animate-presence#initial" },
  ],
};
