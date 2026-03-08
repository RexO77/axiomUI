---
name: website-upgrade-playbook
description: Use when improving a website, landing page, dashboard, SaaS app, or design system that needs clearer hierarchy, stronger spacing, better typography, cleaner components, lower form friction, stronger feedback, responsive behavior, and better accessibility. Trigger on requests to make an interface cleaner, sharper, more consistent, or easier to use.
---

# Website Upgrade Playbook

Turn vague requests like "make the site better" into a concrete improvement pass.

Use this to improve real interfaces in code, not just discuss design theory.

## Core Objective

Make the interface easier to scan, safer to use, more consistent across screens, and more trustworthy in real conditions like loading, errors, mobile, and keyboard use.

Prioritize in this order:

1. Clarity
2. Hierarchy
3. Consistency
4. Feedback
5. Accessibility
6. Polish

## Working Method

1. Identify the page goal.
   What is the main task, the main action, and the most important information above the fold?
2. Audit the screen in this order.
   Typography -> layout -> color -> actions/components -> forms -> system states -> accessibility.
3. Fix structural problems before stylistic polish.
   Bad hierarchy, weak spacing, unclear actions, and broken form logic matter more than decorative polish.
4. Apply the heuristics below directly in code.
   Prefer component, token, and layout updates over isolated one-off patches.
5. Verify across contexts.
   Check desktop, mobile, keyboard navigation, loading, empty, success, and error states.
6. Summarize what changed.
   Explain the highest-impact fixes, why they matter, and any deliberate exceptions.

## Non-Negotiables

- One primary action per screen.
- Use sentence case for most UI copy.
- Keep spacing on a consistent scale.
- Preserve visible focus states.
- Labels must stay visible while typing.
- Use semantic status colors for status only.
- Interactive targets must be easy to hit.
- Every async action needs feedback.
- Every overlay needs an obvious exit.
- Never rely on color alone to convey meaning.

## Heuristic Library

### Typography and Text

- Sentence case is the default for buttons, labels, and most headers. Avoid title case because it slows scanning.
- If text is uppercase, add tracking so the letters do not collapse into a dense block.
- Body copy should usually sit around 1.5x line-height.
- Headings should tighten as they grow, usually around 1.1x to 1.2x line-height.
- Use one typeface whenever possible. If pairing is necessary, use one serif for headings and one sans for body.
- De-emphasize secondary copy with softer color before shrinking the text.
- Align numbers with tabular figures or right alignment so values compare cleanly.
- Left-align multi-line body copy. Reserve centered alignment for short headlines or special moments.
- Limit type weights so hierarchy stays strong. Regular and semibold are enough for most interfaces.
- Define a truncation strategy. Wrap, fade, or ellipsize intentionally; never let text break layout at random.
- Body text should not drop below readable minimums. Treat tiny text as a bug, not a style.

### Layout and Spacing

- Use a 4pt spacing grid. Random values make the system feel accidental.
- Keep text width in a readable range. Very long lines increase fatigue.
- Group related items by proximity before adding separators or borders.
- Favor optical centering over mathematical centering when shapes feel off-balance.
- Buttons usually need more horizontal than vertical padding.
- Align icons to the cap height of the adjacent text, not blindly to the full line box.
- Do not overuse bordered containers. Whitespace and surface contrast often separate sections better.
- Keep gutters consistent inside the same layout region.
- Scale spacing by breakpoint. Desktop spacing rarely works unchanged on mobile.
- Maintain vertical rhythm between sections using a clear spacing progression.
- Define a z-index scale. Avoid arbitrary giant values.

### Color and Depth

- Use color with discipline. Most of the screen should stay neutral, with accent color reserved for important actions.
- Avoid pure black on white. Slightly softened dark neutrals are easier on the eye.
- Let shadows or depth cues inherit some color from the interface instead of defaulting to muddy gray.
- Reserve red, green, and yellow for semantic states like error, success, and warning.
- Borders should be quieter than body text.
- Outline buttons and inputs need slightly stronger borders than decorative dividers.
- Hover and active states should stay in the same hue family; change lightness or saturation, not category.
- Dark mode is not color inversion. Rebuild contrast, saturation, and elevation intentionally.
- Check contrast ratios instead of guessing.
- Use opacity variations for tints and states before inventing new colors.

### Components and Actions

- Each screen gets one primary action. Everything else should step down in emphasis.
- Destructive actions should feel safe, not tempting. Use confirmation and avoid loud red buttons in the main flow.
- Nested radii should feel proportional. Inner and outer corners should relate mathematically.
- Human avatars should usually be circular; documents and system objects can stay rectilinear.
- Use modals for short decisions and drawers for context-heavy tasks.
- Use toasts for system-level feedback and inline messaging for local field or component problems.
- Add text labels to ambiguous icon actions.
- Disabled controls need a reason nearby.
- Async buttons need loading states and must prevent double submission.
- Icon sizes should stay consistent within the same toolbar or action cluster.
- If a card is clickable, the whole card should be clickable.
- Every overlay needs a close button, Escape handling, and backdrop dismissal when appropriate.

### Forms and Inputs

- Top-aligned labels are more flexible, more mobile-friendly, and better for translation.
- Never use placeholders as the only label.
- Mark optional fields instead of marking every required field.
- Let input width hint at expected content length.
- Use radios for one choice and checkboxes for many. Do not blur the mental model.
- If there are only a few options, show them instead of hiding them in a dropdown.
- Switches imply immediate change. Checkboxes imply selection before submission.
- Validate after the user finishes a field, not on the first keystroke.
- Show format hints whenever strict formatting is required.
- Default to single-column forms unless fields are tightly related.
- Use smart defaults whenever a best guess can reduce effort.
- Always show a clear success state after submission.

### System Behavior and Product Logic

- Prefer skeletons over spinners when loading structured content.
- Empty states must explain what is missing, why it is missing, and what the user can do next.
- Click and tap targets must be comfortably large.
- Use relative time for live activity and absolute time for records and history.
- Name raw design tokens by what they are, then alias them semantically elsewhere.
- Offer undo windows for destructive actions when possible.
- Show progress for flows with three or more steps.
- Keyboard users must be able to reach, trigger, and dismiss every interactive control.
- Use optimistic UI for low-risk actions when latency would otherwise make the product feel sluggish.
- Build graceful fallbacks for failed assets and requests.
- Keep the responsive system simple. A few meaningful breakpoints beat device-by-device design.
- Animation must serve orientation, feedback, or continuity.

### Accessibility and Inclusive Use

- Never remove focus outlines without replacing them with an equally visible alternative.
- Meaning must survive without color. Pair status color with text, icons, or other signals.
- Adjacent touch targets need breathing room to prevent accidental taps.
- Treat keyboard navigation as a release requirement, not an enhancement.
- Treat readable contrast as a system-level standard.
- Design for people under imperfect conditions: glare, fatigue, injury, poor network, small screens, and interruptions.

## Page Improvement Pass

Run this pass when improving any page:

1. Above the fold
   Is the page purpose obvious in under two seconds?
   Is there one dominant action?
   Is the headline readable and the supporting copy scannable?
2. Structure
   Do spacing and grouping explain the layout without extra chrome?
   Are sections rhythmically spaced?
   Are widths readable on large screens?
3. Action hierarchy
   Can a user immediately distinguish the primary, secondary, and destructive actions?
   Are click targets generous?
4. Forms
   Are labels persistent?
   Are control types correct?
   Do validation, defaults, hints, and success states reduce friction?
5. States
   Do loading, empty, success, and error states feel intentional?
   Does the UI explain what is happening during async work?
6. Accessibility
   Can the full flow be completed with keyboard only?
   Is meaning preserved without color?
   Are contrast and target sizes safe on mobile?
7. Polish
   Are icon sizes consistent?
   Do alignment and radius choices feel intentional?
   Are motion and depth subtle and purposeful?

## Implementation Priorities

When you cannot fix everything, prioritize in this order:

1. Unclear page purpose or weak CTA hierarchy
2. Broken or confusing form logic
3. Missing loading, error, empty, and success feedback
4. Accessibility blockers
5. Inconsistent spacing and typography
6. Color misuse and weak contrast
7. Optical and motion polish

## Apply by Surface Type

### Marketing Pages

- Make the headline and value proposition instantly legible.
- Keep section rhythm strong so the page does not become a wall of cards.
- Use accent color sparingly around calls to action.
- Reduce competing buttons.
- Keep forms short and reassuring.

### SaaS Dashboards and Product Screens

- Strengthen information hierarchy before adding decoration.
- Use alignment and spacing to organize dense interfaces.
- Keep destructive actions quiet but recoverable.
- Make loading and empty states feel like part of the product, not missing pieces.
- Ensure tables, filters, and side panels remain keyboard-usable.

### Checkout, Onboarding, and Multi-Step Flows

- Show progress once the flow becomes multi-step.
- Use smart defaults and format hints to reduce effort.
- Validate at the right time.
- Confirm success clearly.
- Offer undo or backtracking where risk is high.

## Exceptions

Do not apply heuristics mechanically.

Break a rule only when:

- the product context clearly demands it,
- the exception improves comprehension or completion,
- and you can explain the tradeoff in plain language.

Examples:

- A promotional campaign may justify centered headline copy.
- A data-heavy admin surface may intentionally exceed standard text density in exchange for throughput.
- A destructive admin tool may use stronger warning treatment because the risk is materially higher.

## Output Expectations

When using this skill, do not stop at design commentary. If you have access to the codebase, implement the improvements.

When reporting work back, structure the response around:

1. Highest-impact problems found
2. Changes made in code
3. Heuristics applied
4. What still needs follow-up or tradeoff review

## Short Review Questions

Use these questions before shipping:

- Is the page goal obvious immediately?
- Is the primary action unmistakable?
- Can the interface be scanned without rereading?
- Does spacing explain grouping?
- Do forms reduce effort instead of adding it?
- Do all major states feel intentional?
- Can a keyboard-only user finish the main task?
- Does the page still feel clear on mobile?
- Did polish improve clarity, or only add surface noise?

## Final Reminder

Do not optimize for looking designed.
Optimize for being understood, trusted, and used without friction.
