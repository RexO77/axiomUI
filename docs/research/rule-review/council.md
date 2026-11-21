# Council review, November 2026

This round asked two questions. What does the catalog lack that a designer, or a coding agent asked to "make my site less sloppy", needs? Which rules teach too little to keep their place? Five models proposed independently and three debated a merged ballot. A test page then measured whether the upgrade skill takes a sloppy site past "fixed".

## How the decision was made

| Stage | Participants | Output |
| --- | --- | --- |
| Independent proposals | GPT-6.2 Sol, Claude Fable, Grok 4.7 (rule counsel). Claude Opus 5.5 (craft research with verified sources). GPT-6.2 Astra (survey of 12 popular frontend skills on skills.sh). | Up to 15 additions, cuts and claim defects each. No member saw the others. |
| Apply test | GPT-6.2 Sol | Built a page with 19 known defects and followed the website-upgrade skill literally. Captured it before and after at 1440 × 900 and 390 × 844. |
| Merged ballot | Orchestrator | 40 candidate additions, 17 cuts or merges, 15 claimed defects in existing rules |
| Debate | GPT-6.2 Sol, Claude Fable, GPT-6.2 Astra (stood in for Grok, whose run failed on billing, and argued its first-round positions) | Each voted on every item, attacked three proposals from other members and defended three of its own |
| Ruling | Majority of the three debaters; the chair broke ties | 15 additions, 11 retirements, 14 claim fixes |

Each addition had to meet the existing bar: a scoped claim, a pane that changes one thing, and primary sources. It also had to meet a new bar. An agent must be able to find the violation in real code and confirm it in the rendered page.

## What the apply test found

The upgrade skill fixed every planted defect. The result was clearer and more usable, and it still looked like a conventional SaaS page. Its weaknesses informed both the rules and the skill rewrite.

- **Too much reading for a vague prompt.** A general request led the agent through 910 lines of domain summaries. No ordered sweep or threshold told it when to open a full rule.
- **No standard beyond correctness.** No step asked whether the first screen proves the product's claim.
- **One regression.** Moving a status preview pushed the Features heading from 495px to 1,001px at 390 × 844, below the first screen.
- **One unaddressed tell.** The headline kept −0.05em tracking with glyph pairs nearly touching. No rule covered display tracking, so typo-15 now does.

## Additions

| Id | Rule | Debate votes |
| --- | --- | --- |
| typo-15 | Tighten display tracking only until letters crowd | Sol, Fable, Astra |
| layout-12 | Keep scroll and focus targets clear of sticky headers | Sol, Fable, Astra |
| layout-13 | Reserve space for media before it loads | Sol, Fable, Astra |
| layout-14 | Keep the subject in the crop at every ratio | Sol, Astra |
| comp-14 | Navigate with links, act with buttons | Sol, Fable |
| comp-15 | Show the product doing what the headline promises | Sol, Astra |
| form-14 | Declare what each field expects | Fable, Astra |
| form-15 | Keep entered answers when validation fails | Astra, Grok (Fable: merge) |
| sys-15 | Return people to the result they opened | Sol, Fable, Astra |
| sys-16 | Keep errors and the only recovery action on screen | Sol, Astra |
| a11y-4 | Offer a click or tap path for every drag | Sol, Fable, Astra |
| a11y-5 | Choose heading levels by outline, not size | Sol, Fable |
| a11y-6 | Let people pause what moves or updates on its own | Sol, Fable, Astra |
| a11y-7 | Underline links in running text | Fable, Astra |
| a11y-8 | Return focus when an overlay closes | Sol, Fable, Astra |

sys-11 was re-aimed at reflow at 320 CSS pixels (WCAG 1.4.10). Sol and Fable preferred re-aiming it to a separate rule. Their reason was that its "two breakpoints versus eight" comparison never showed a task failing.

## Retirements

Retired ids are never reused. Each one redirects to the rule that absorbed its lesson.

| Retired | Absorbed by | Reason |
| --- | --- | --- |
| motion-5 | motion-4 | Both taught visible early progress on entrance |
| motion-27 | motion-7 | Both tuned routine exits, with the same exception |
| motion-26 | motion-24 | One stagger decision. The old Don't was the choice its own description recommended. |
| motion-23 | motion-14 | Its own risk text called the benchmark unstable. A pane could not establish the claim. |
| motion-25 | motion-6 | A review method, not a property of the interface. It moved into the skills' verification steps. |
| motion-22 | motion-21 | Both said to hand fixed motion to the browser |
| sys-14 | motion-14 | `will-change` is a profiling follow-up, kept as a measured exception |
| color-2 | sys-5 | Both swatches passed AAA. The lesson was role tokens surviving a theme change, now shown on a dark surface. |
| layout-8 | layout-3 | Generic consistency advice. "A gap implies a group" moved to layout-3. |
| color-5 | color-6 | color-6 already held the decorative divider as its control |
| color-3 | color-12 | Tinted shadows are art direction, so it became a note under elevation |

These proposals were rejected:

- **Cutting sys-5** (Grok). Hard-coded ink is the root cause of dark-theme breakage.
- **Merging motion-2.** It was rebuilt around a real input instead.
- **Merging layout-10 and typo-6.** Both were fixed to vary one property.
- **Cutting motion-19.** It was re-sourced and scoped to custom dragged surfaces.
- **Recategorizing sys-3, sys-8 and sys-13.** Ids carry the category prefix that routes previews, and the accessibility skill already cross-lists them.

## Candidates held back

These candidates had support but did not reach a majority. Most are better taught inside an existing rule:

- Mark the current page in navigation
- Name dialog buttons by their action
- 16px inputs on touch screens, without disabling zoom
- `color-scheme` before first paint
- Typographic characters
- Locale number formatting
- Direct chart labels
- Skip links
- Logical properties for right-to-left layouts
- Delayed loading indicators

The debate records argue each one. The best of them should return in a later round with a pane that isolates them.

## Claims corrected in existing rules

| Rule | Correction |
| --- | --- |
| form-8 | The Do showed an error on blur, which its GOV.UK source advises against |
| a11y-1 | The illustrated ring was a box shadow, which forced colors removes. That was the rule's own stated risk. |
| typo-6 | The pane changed size and ink at once, and the Don't had more contrast |
| layout-10 | The Don't blamed the 8px base when the lesson was grouping |
| layout-11 | Both panes painted the same stack |
| layout-2 | 45ch held about 51–61 characters of the preview copy, not the stated 65 |
| typo-2 | 0.05em matched no USWDS token. WCAG 1.4.12 tests user overrides and sets no default. |
| typo-3, form-10, motion-17 | Sources replaced or added (WCAG 1.4.8, 1.3.2, Media Queries 5) |
| motion-2 | The search field was a span, and the Do contradicted the description |
| motion-28 | The Do was the recipe its description cautioned against |
| motion-20, motion-29 | Do and Don't now state observable behavior and leave API names to the notes |
