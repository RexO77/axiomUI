# 015 — Craft round 5: make the site obey its own catalog

- **Status**: TODO (planned 2026-10-02 from six lens audits, every P0/P1 re-checked on screen or in code)
- **Branch**: `feat/craft-round-5` · base commit `2089439` (catalog is **105** rules; sys-12 is merged into motion-3)
- **Supersedes**: 008 (token foundation), 009 (primitives), and the guardrail half of 010. See "Relation to older plans".
- **Coordination**: `plans/016-skill-distribution.md` is in flight on the same branch and rewrites
  `skill-bonus.tsx`, moves the `SKILL.md` body, and edits `llms.txt/route.ts` and `rule-corpus.ts`.
  **No batch here touches those four files.** Findings against them are handed to 016 (see the end).
- **Evidence**: local screenshots were used for the audit and re-checks.
  Screenshot references below use `<lens>/…` for lens audits and `lead/…` for
  the plan's re-checks. These local artifacts are not included in this document.

## Diagnosis

The rule catalog and the authored prose are strong, but the shell around them breaks the rules it
teaches, often a few pixels from the rule it breaks:

1. **The token layer fights Tailwind.** `globals.css:66-69` redefines `--radius-sm/md/lg/xl` as
   8/12/16/24px in an unlayered `:root`, which rewrites Tailwind's own `rounded-*` scale. So
   comp-4's "square" avatar renders as a circle (`lead/r-comp-4.png`). No `@theme` block registers
   the fonts, so `font-mono` resolves to `ui-monospace, SFMono-Regular, Menlo…`. IBM Plex Mono is
   loaded and never used (`document.fonts`: "IBM Plex Mono: unloaded"). Unlayered `.pressable` and
   `.reveal` beat the utilities next to them. The expand button computes
   `transform, background-color, border-color, color / 0.14s` instead of its authored opacity and
   filter fade, and the card hover lift is dead (`transform` stays `matrix(1,0,0,1,0,0)` on hover).
2. **The chrome breaks the motion rules.** Each card's entrance delay grows with its position in the
   whole catalog (last card `--delay: 4520ms`). `/#accessibility` is still `opacity: 0` at 1s
   (`lead/deeplink-a11y-1s.png`). The content lane animates `padding` with a permanent `will-change`
   (motion-14), vaul runs `transform 0.5s` both ways (motion-6/7), and none of it honours reduced motion.
3. **Overlays aren't accessible.** The closed mobile sheet sits in the tab order at x=638/682
   (`lead` tab trace: Skip → theme → Open menu → *Switch theme@638 → Close menu@682 → Search@407 →
   8 Index links*). Below xl the drawer is full-screen but non-modal and never takes focus.
4. **Pixels contradict captions.** motion-28's Don't pane shows a blurred speck (`lead/r-motion-28.png`).
   layout-2's "too wide" pane is 57.0ch, inside the 45–75ch band it prints (re-measured). color-1's
   two notes run together ("≈ 10%one element", `lead/r-color-1.png`). layout-11's labels are sliced
   (`lead/r-layout-11.png`). sys-13's button wraps (`lead/r-sys-13.png`). After one run, motion-22's
   Do card parks at the far end (`lead/m22-after.png`), and motion-11's toolbar spills out of its
   panes on mobile (`lead/m11-390.png`).
5. **The homepage ships no content.** `page.tsx` is `"use client"` and calls `useSearchParams()` under
   one page-level `<Suspense fallback={<HomeLoading/>}>`. The prerendered
   `.next/server/app/index.html` contains the skeleton and zero rule titles.

A sixth issue none of the lenses caught: **`/rules/typo-10` scrolls sideways on every phone.**
`scrollWidth` is 515 at both 320 and 390 wide (`lead/typo10-390.png`). The do/don't `<article>`
grid items have no `min-w-0`, so the preview's deliberate `whitespace-nowrap` row widens the whole
page. On the rule about truncation, even the Do pane overflows.

The fix order follows from this. First, make the token layer honest and add the primitives and a
guardrail (wave 1). Second, fix every surface in parallel using that layer (wave 2). Last, take
back Tailwind's radius scale once nothing in the chrome depends on the hijacked values (wave 3).

## Verified findings

Lens findings that were checked and kept. "New" means this plan found it. Duplicates across lenses are merged.

| # | Sev | Finding | Surface | Files | Batch |
|---|---|---|---|---|---|
| F01 | P0 | Entrance stagger grows over all 105+8 nodes; deep links and Index jumps show a blank page for ~4.5s; contradicts motion-29/24/6 | Home, `/#<category>` | page.tsx, rule-card.tsx, globals.css | W1-B, W1-A |
| F02 | P0 | Homepage prerender is a skeleton; no rule text for crawlers, unfurlers, no-JS | `/` | page.tsx, search-provider.tsx | W1-B |
| F03 | P0 | Radius tokens rewrite Tailwind's scale (rounded-md=12px, xl 24 > 2xl 16); comp-4 Don't avatar is a circle | All previews, chrome | globals.css, previews/components.tsx | W1-A, W2-F, W3-A |
| F04 | P0 | motion-28 Don't pane shows a 25%-scale blurred speck instead of the check | /rules/motion-28 | showcase-specs.tsx | W2-H |
| F05 | P0 | **New.** /rules/typo-10 scrolls horizontally on phones (scrollWidth 515 at 390) | /rules/[id] mobile | rules/[id]/page.tsx (rule-drawer.tsx to check) | W2-E, W2-D |
| F06 | P0 | layout-2 "too wide" pane is 57ch, inside its own "45–75ch reads easily" band; body set at 8px | layout-2 | previews/layout.tsx | W2-F |
| F07 | P0 | color-1 notes collide ("10%one element") and both coverage numbers are wrong (measured 2.9% / 42.3%) | color-1 | previews/color.tsx | W2-G |
| F08 | P0 | motion-21/22: Do card never returns to rest (`fill: "forwards"` beats the reset) | /rules/motion-21, -22 | load-showcase.tsx | W2-I |
| F09 | P0 | motion-11 toolbar buttons overflow their panes at 390 | /rules/motion-11 mobile | tooltip-showcase.tsx | W2-I |
| F10 | P0 | Closed mobile sheet is in the tab order, no Esc, no dialog semantics, no aria-expanded | Mobile menu | sidebar.tsx | W2-A |
| F11 | P0 | Drawer below xl is full-screen, `modal={false}`, focus stays on the grid | Drawer < 1280 | rule-drawer.tsx | W2-D |
| F12 | P1 | `font-mono`/`font-sans` never registered; captions render in the OS mono; Plex unused | Every caption | globals.css | W1-A |
| F13 | P1 | Unlayered `.pressable`/`.reveal` override utilities; expand button snaps; card hover lift dead | Sidebar, cards | globals.css, sidebar.tsx | W1-A, W2-A |
| F14 | P1 | Lane animates `padding` with permanent `will-change`; drawer opening reflows every card per frame (motion-14) | Sidebar toggle, drawer at xl | globals.css | W1-A |
| F15 | P1 | vaul drawer runs 500ms both ways (motion-6/7); lane 360, panel 300, drawer 500 all desync | Drawer | globals.css | W1-A |
| F16 | P1 | Reduced motion not honoured by drawer, lane, sidebar | prefers-reduced-motion | globals.css, sidebar.tsx | W1-A, W2-A |
| F17 | P1 | Chrome muted text is neutral-400 on white (2.5:1) and neutral-500 on #171717 (3.8:1), the color-9 Don't | Sidebar, search, 404, drawer numerals | sidebar.tsx, search-input.tsx, not-found.tsx, rule-drawer.tsx, rules/[id]/page.tsx | W1-A (token), W2-* |
| F18 | P1 | Three focus systems (browser blue auto, ring-neutral-400 at 2.5:1, white ring-offset halo in dark); nav clips rings | All chrome | globals.css, sidebar.tsx, search-input.tsx, not-found.tsx, rule-drawer.tsx | W1-A, W2-* |
| F19 | P1 | Drawer header icon buttons: `dark:hover:bg-neutral-900` on a `dark:bg-neutral-900` panel (computed equal) | Drawer, dark | rule-drawer.tsx, copy-rule-button.tsx | W2-D, W2-C |
| F20 | P1 | Drawer has no width below xl: ~170-char prose lines at 1279, previews stretch to 950px | Drawer 640–1279 | rule-drawer.tsx | W2-D |
| F21 | P1 | Tablet 768: cards squeeze to 424px, sentence-case preview wraps "Skip / for / now" (`lead/t-768.png`) | Home 768–1023 | rule-card.tsx, sidebar.tsx | W2-C, W2-A |
| F22 | P1 | Off-canvas sheet's `shadow-2xl` bleeds a grey band down every mobile page (`lead/m-home-rightedge.png`) | Mobile home | sidebar.tsx | W2-A |
| F23 | P1 | Search ignores the Index (empty categories stay listed, link to missing anchors); mobile search runs invisibly behind the sheet | Sidebar | sidebar.tsx, search-input.tsx | W2-A, W2-B |
| F24 | P1 | Static page prose runs ~95 chars/line | /rules/[id] desktop | rules/[id]/page.tsx | W2-E |
| F25 | P1 | Showcase rules repeat Do/Don't + shorthand as two more cards under the showcase (`lead/m22-after.png`) | Drawer, /rules/[id] | rule-drawer.tsx, rules/[id]/page.tsx | W2-D, W2-E |
| F26 | P1 | Rule-page skip link targets `#main-content`, which only exists on `/` | All 105 rule pages | rules/[id]/page.tsx | W2-E |
| F27 | P1 | Exit readouts never update: motion-7 shows "220ms" while its 160ms exit plays | Toggle showcases | motion-showcase.tsx | W2-H |
| F28 | P1 | Easing-graph dot travels the unpadded box, clipped at start and end | motion-4/5 | easing-graph.tsx | W2-H |
| F29 | P1 | sys-9/sys-1 readouts show the whole timeline (do 840 > don't 700 on the optimistic rule) | /rules/sys-9, sys-1 | showcase-specs.tsx, motion-showcase.tsx | W2-H |
| F30 | P1 | motion-19 damped overshoot clipped by the stage edge; motion-18 card already past the 60% line at 390 | Drag showcases | drag-showcases.tsx | W2-I |
| F31 | P1 | motion-23 shows no visible change; child collides with parent border; overflows at 390 | /rules/motion-23 | scenes.tsx, showcase-specs.tsx | W2-H |
| F32 | P1 | motion-14 hint says the panes "look alike"; they are different objects | /rules/motion-14 | showcase-specs.tsx | W2-H |
| F33 | P1 | Radius doubling turns 24–28px preview fields/buttons into pills; comp-2, typo-10, comp-7, comp-12 break comp-3 | Previews | globals.css, previews/* | W3-A, W2-F/G |
| F34 | P1 | layout-11 labels sliced by the layer above | layout-11 | previews/layout.tsx | W2-F |
| F35 | P1 | comp-12 / comp-5 dark: scrim invisible, dialog lines and X chip same colour as dialog | Dark previews | previews/components.tsx | W2-F |
| F36 | P1 | a11y-3 Do thumb overlaps Delete by 17px while note says "hits nothing" | a11y-3 | previews/accessibility.tsx | W2-F |
| F37 | P1 | sys-13 Don't button wraps "Save / changes"; ghost boxes read as empty slots | sys-13 | previews/system.tsx | W2-G |
| F38 | P1 | color-6 "Send invite" overflows its box by 5–11px | color-6 | previews/color.tsx | W2-G |
| F39 | P1 | sys-11 Don't tick labels overprint ("320375414480"); Do caption says "3 tiers: 640/1024/1280" (three breakpoints) while preview draws two | sys-11 | previews/system.tsx, ui-logic.ts | W2-G, W2-J |
| F40 | P1 | comp-3 Don't caption states a false equation ("Outer 4px = Inner 4px + Padding 8px"); unexplained blue dot | comp-3 | ui-logic.ts, previews/components.tsx | W2-J, W2-F |
| F41 | P1 | Dark surfaces disagree (#111 html vs #0a0a0a page; #1a1a1a / #171717 / #111216 raised); card pills darker than the card | Dark, overscroll | globals.css, rule-card.tsx, copy-rule-button.tsx | W1-A, W2-C |
| F42 | P1 | Card corners break comp-3: 28px outer around p-5 + 20px panel | All cards | rule-card.tsx | W2-C |
| F43 | P1 | 404 buttons wrap to two lines inside their pills at ≥640 | /404 | not-found.tsx | W2-B |
| F44 | P1 | Mobile header controls 36/32px (theme, menu, close, rule-page back) below sys-3's 44px | Mobile chrome | theme-toggle.tsx, sidebar.tsx, rules/[id]/page.tsx | W2-B, W2-A, W2-E |
| F45 | P1 | Homepage OG image is 1024×1024 declared as 1200×630; off-system art | Social card for `/` | layout.tsx, public/og-image.png | W2-K |
| F46 | P1 | typo-1 rationale rests on the discredited word-shape (Bouma) model; first rule on the site | typo-1, typo-2 | ui-logic.ts, deep-dives.ts | W2-J |
| F47 | P1 | Chrome motion off-token: duration-150/200/300, Tailwind `ease-out`/`ease-in-out`, EASE.inOut ≠ CSS token | Sidebar, copy glyph, engine | globals.css, showcase-engine.ts, sidebar.tsx, copy-rule-button.tsx | W1-A, W2-A, W2-C |
| F48 | P2 | cn() is concatenation; three overrides dead (comp-2 confirm buttons, forms Value 10px, CategoryIcon h-5) | Previews, category headers | previews/components.tsx, previews/forms.tsx, category-icon.tsx | W2-F, W2-C |
| F49 | P2 | Heading outline: card titles h4 under h2; drawer's h2 is the category, title is h3 and also an sr-only h2 | Home, drawer | rule-card.tsx, rule-drawer.tsx | W2-C, W2-D |
| F50 | P2 | Drawer category label renders in 14px serif (base heading rule) | Drawer header | rule-drawer.tsx | W2-D |
| F51 | P2 | Lead paragraphs looser than body: drawer 16/32, page 18/32 | Drawer, page | rule-drawer.tsx, rules/[id]/page.tsx | W2-D, W2-E |
| F52 | P2 | Prev/next titles truncate at `max-w-[45%]` even with room | Drawer, page | rule-drawer.tsx, rules/[id]/page.tsx | W2-D, W2-E |
| F53 | P2 | Related repeats prev/next on ~half the pages | /rules/[id] | rules/[id]/page.tsx | W2-E |
| F54 | P2 | Static page: category printed twice (`lead/m-dark-rule-typo1.png`), three ways home, inert logo, no theme toggle | /rules/[id] | rules/[id]/page.tsx | W2-E |
| F55 | P2 | Static do/don't cards nest three frames at equal radius | /rules/[id] | rules/[id]/page.tsx | W2-E |
| F56 | P2 | Grid does not mark the open rule; deep link doesn't scroll to it | Home + drawer at xl | rule-card.tsx, page.tsx | W2-C |
| F57 | P2 | Index active vs hover nearly identical (`/80` vs `/70`); ragged left edges 45/49/53/57px; llms link 16px tall | Sidebar | sidebar.tsx | W2-A |
| F58 | P2 | Unstyled WebKit blue cancel × in the neutral search field; no announced result count | Search | search-input.tsx, globals.css, page.tsx | W2-B, W1-A, W2-C |
| F59 | P2 | Category count pill styled like the action pills below it | Category headers | page.tsx | W2-C |
| F60 | P2 | Heading→cards gap equals card→card gap; categories don't read as chapters | Home rhythm | page.tsx | W2-C |
| F61 | P2 | Footer is a full bordered card for one tertiary line | Home footer | page.tsx | W2-C |
| F62 | P2 | Nine icon-button recipes, three sizes, mismatched glyph sizes/strokes (theme toggle 20px/2 vs collapse 18px/1.8) | All chrome | ui/icon-button.tsx (new) + consumers | W1-A, W2-* |
| F63 | P2 | Two Do/Don't verdict palettes (card/showcase vs drawer/page) | Verdict labels | ui/verdict-label.tsx (new) + consumers | W1-A, W2-* |
| F64 | P2 | Shadow tokens `--shadow-sm/md/lg: none` "for flat design" are false; five floating-surface recipes | Panels | globals.css | W1-A |
| F65 | P2 | Dark: layout-7 Do and color-8 cover the frame hairline; token labels name light values (typo-6, color-5/6/12) | Dark previews | previews/layout.tsx, previews/color.tsx, previews/typography.tsx | W2-F, W2-G |
| F66 | P2 | Mono evidence lines orphan and wrap (color-2/8/9/10) | Previews | previews/color.tsx | W2-G |
| F67 | P2 | typo-7 Don't changes two variables; typo-9 Don't indistinguishable; sys-5 Do missing the second consumer; form-9 hint far from field; sys-10 broken image looks designed | Previews | previews/typography.tsx, previews/system.tsx, previews/forms.tsx | W2-G, W2-F |
| F68 | P2 | motion-25 "as shipped" pane plays at the ½× default | /rules/motion-25 | motion-showcase.tsx, showcase-specs.tsx | W2-H |
| F69 | P2 | Control row reflows rule to rule; under reduced motion the speed group stays and the tally claims waiting that never happened | All showcases | motion-showcase.tsx | W2-H |
| F70 | P2 | Load races grow 48px after first run (ThreadMeter returns null) | motion-21/22 | thread-meter.tsx | W2-I |
| F71 | P2 | motion-8 protagonist too small to show 0.96 vs 0.90; motion-10 pip covers "Duplicate"; motion-4 caption shows literal backticks | Showcases | scenes.tsx, showcase-specs.tsx | W2-H |
| F72 | P2 | Rule copy contradicts across rules: comp-2 vs sys-6 (confirm vs undo), motion-9 vs motion-28 (0.95 vs 0.25), layout-3 vs layout-8 (mixed gaps) | Copy | ui-logic.ts | W2-J |
| F73 | P2 | Meta/OG/JSON-LD descriptions omit motion (the largest category); hero omits it too | Head, hero | layout.tsx, header.tsx | W2-K, W2-C |
| F74 | P2 | Rule-page OG drops `og:site_name`/`og:locale`; JSON-LD `HowTo` names "Don't" as step 2 | /rules/[id] head | rules/[id]/page.tsx | W2-E |
| F75 | P3 | Verdict label is a straight `Don't`; prose has 66 straight apostrophes; "grey" 19× vs "gray" 4× | Labels, prose | verdict.ts, deep-dives.ts | W1-A, W2-J |
| F76 | P3 | Learn more uses an external-link arrow for an in-page drawer | Card | rule-card.tsx | W2-C |
| F77 | P3 | Drawer header X is 20px next to 16px glyphs; list numerals sit above baseline; tag pills 26px beside 32px Copy | Drawer, page | rule-drawer.tsx, rules/[id]/page.tsx | W2-D, W2-E |
| F78 | P3 | Custom showcases float the rail in 40px of dead air; PaneChrome captions sans while grid captions mono | Showcases | interrupt/load/tooltip-showcase.tsx, showcase-chrome.tsx | W2-I, W2-H |
| F79 | P3 | `size="sm"` preview branch is dead at every call site; 10 primitives never imported | Code | rule-preview.tsx, preview-primitives.tsx, scenes.tsx, showcase-specs.tsx, easing-graph.tsx | W3-A, W3-B |
| F80 | P3 | Small caption/pane mismatches: comp-2 "Delete project…" vs "Delete…"; typo-1 caption vs dialog; typo-12/13 Spec "auto"; typo-11 title wraps; comp-5 "Loca…" | Previews | ui-logic.ts, previews/* | W2-J, W2-F, W2-G |
| F81 | P3 | Sitemap `lastModified` 2026-09-07 predates the last content change (2026-10-02) | /sitemap.xml | sitemap.ts | W2-K |

**Keep as they are** (strengths several lenses confirmed): the theme bootstrap and `theme-change-lock`;
`inert` on the collapsed desktop sidebar; the search empty state; the copy pill's live region; the
per-rule OG images; drawer arrow paging, scroll reset and the stale-import guard; the sticky drawer
header; the forms previews (form-1..12) and the controlled-experiment previews (typo-10/12/13,
layout-5/6/9, comp-6/8, sys-3, a11y-1/2); `showcase-engine.ts` and the drag prototypes; the
deep-dive lazy chunk; `llms-full.txt`; `@import "tailwindcss" source(none)`.

## Token decisions (fixed here so wave-2 batches can run in parallel)

Wave 1 creates these names. Every wave-2 batch uses them and must not invent new ones.

| Utility | Light | Dark | Replaces |
|---|---|---|---|
| `bg-canvas` | #fafafa | #0a0a0a | page wrapper `bg-neutral-50 / dark:bg-neutral-950`, html/body |
| `bg-surface` | #ffffff | #171717 | cards, sidebar, drawer, footer (`#1a1a1a` → `#171717`) |
| `bg-sunken` | #fafafa | #111111 | card panel `bg-neutral-50/80 dark:bg-neutral-950/45` |
| `bg-fill` / `bg-fill-strong` | #f5f5f5 / #e5e5e5 | #262626 / #404040 | hover fills |
| `bg-inverse` / `text-on-inverse` | #171717 / #fff | #fafafa / #0a0a0a | primary pills |
| `text-ink` | #171717 | #f5f5f5 | primary text |
| `text-ink-secondary` | #525252 | #d4d4d4 | body copy |
| `text-ink-muted` | #737373 | #a3a3a3 | **all real secondary text** (≥4.5:1 on canvas and surface) |
| `text-ink-faint` | #a3a3a3 | #737373 | icon glyphs and placeholders only |
| `border-line` / `border-line-strong` | rgb(0 0 0/.1) / .16 | rgb(255 255 255/.1) / .16 | hairlines |
| `outline-ring` (`--ax-ring`) | #2563eb | #60a5fa | the one focus ring (a11y-1's own Do) |
| `text-do` / `text-do-ink` | #059669 / #047857 | #34d399 / #6ee7b7 | verdict icon / label |
| `text-dont` / `text-dont-ink` | #e11d48 / #be123c | #fda4af / #fecdd3 | verdict icon / label |
| `rounded-frame/field/well/card` | 10 / 16 / 20 / 28px | — | `rounded-[10px]`, `rounded-lg`(16), `rounded-[20px]`, `rounded-[28px]` |
| `shadow-panel/card/card-hover/overlay` | existing values | existing values | `.panel-shadow`, `shadow-2xl`, ad-hoc shadows |
| `duration-fast/medium/slow` | 140 / 220 / 360ms | — | `duration-150/200/300` |
| `ease-out-strong`, `ease-in-out-strong`, `ease-drawer` | existing curves | — | Tailwind `ease-out`/`ease-in-out` |

Rule for every wave-2 batch: **migrate the lines you touch** to these utilities and adopt
`IconButton`/`Button`/`VerdictLabel` where the batch lists them. Don't bulk-replace untouched
lines (that is how plan 010's first attempt corrupted class strings). A file that ends up with no
raw `neutral-*`, `duration-<n>`, `ease-in/out` or `focus-visible:ring` utilities gets the marker
comment `// design-system: strict` on its first line, and the guardrail then keeps it clean.

Previews (`previews/*.tsx`), `demos/scenes.tsx`, `demos/drag-showcases.tsx` scene bodies,
`showcase-specs.tsx`, the OG routes and `showcase-engine.ts` stay **exempt**. They depict another
product, and their captions quote literal palette steps.

## Batches

### Wave 1 — foundation (two disjoint batches)

**W1-A · Honest token layer, primitives, guardrail.** Owns `src/app/globals.css`,
`src/lib/showcase-engine.ts`, `src/lib/verdict.ts`, `src/components/ui/icon-button.tsx` (new),
`src/components/ui/button.tsx` (new), `src/components/ui/verdict-label.tsx` (new),
`src/lib/__tests__/design-system.test.ts` (new).

1. Rename every raw token in `:root`/`.dark` to `--ax-*` (e.g. `--color-bg` → `--ax-canvas`,
   `--shadow-panel` → `--ax-shadow-panel`) with the values in the token table, and update
   the references inside globals.css (`html`, `body`, `.glass`, `.rule-card`, `.panel-shadow`,
   `.preview-frame`, skip link). Set `--ax-canvas` to #fafafa / #0a0a0a so html/body match the page
   wrapper and overscroll matches the page. **Keep** the four `--radius-sm/md/lg/xl` lines for now
   (W3-A removes them). Delete `--shadow-sm/md/lg: none`, `--color-success*`, `--color-error*`,
   `--color-accent-2` and any other token with zero references (check with grep first).
2. Add `@theme inline { … }` that registers every colour and shadow in the token table
   (`--color-canvas: var(--ax-canvas)`, …, `--shadow-panel: var(--ax-shadow-panel)`, …) plus
   `--font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;`
   `--font-serif: var(--font-source-serif), ui-serif, Georgia, serif;`
   `--font-mono: var(--font-plex-mono), ui-monospace, SFMono-Regular, Menlo, monospace;`.
   Add a static `@theme { --radius-frame:10px; --radius-field:16px; --radius-well:20px;
   --radius-card:28px; --ease-out-strong:…; --ease-in-out-strong:cubic-bezier(0.65,0,0.35,1);
   --ease-drawer:…; --ease-emphasized:cubic-bezier(0.2,0,0,1); --default-transition-duration:140ms;
   --default-transition-timing-function:cubic-bezier(0.23,1,0.32,1); }`. Then point `body` and the
   base heading/code rules at `var(--font-sans/serif/mono)`. Leave `.drawer-label` in place (W3-A deletes it).
3. Add `@utility duration-fast { transition-duration: var(--motion-fast) }` (and medium and slow), keeping
   `--motion-*` as the source values.
4. Wrap every component class (`.glass`, `.panel-shadow`, `.rule-card`, `.rule-card-panel`,
   `.preview-frame`, `.pressable`, `.reveal`, `.drawer-*`, `.skill-modal-*`, `.main-lane-shell`)
   in `@layer components`. Known side effect: elements with both `pressable` and `transition-colors`
   lose the press-scale transition until their wave-2 batch removes the extra utility. Each wave-2
   batch lists those elements.
5. `.reveal`: `@keyframes fadeUp { from { opacity: 0; translate: 0 8px } }`,
   `.reveal { animation: fadeUp 240ms var(--ease-out-strong) var(--delay,0ms) backwards }`. Remove the
   static `opacity:0; transform` from `.reveal`, so hover `transform` composes and nothing waits at 0.
6. `.main-lane-shell`: delete `transition: padding-left …` and `will-change: padding-left,
   padding-right` (globals.css:242-244). The lane padding snaps and only the panels animate.
7. vaul timing: `[data-vaul-drawer] { transition-duration: var(--motion-slow) !important;
   transition-timing-function: var(--ease-drawer) !important }` and
   `[data-vaul-drawer][data-state="closed"] { transition-duration: var(--motion-medium) !important }`.
8. Reduced-motion block: add `.main-lane-shell, [data-vaul-overlay] { transition: none !important }`,
   `[data-vaul-drawer] { transition-duration: 0s !important; animation-duration: 0s !important }`,
   and `.sidebar-motion { transition: none !important }` (W2-A applies the class).
9. Focus: `@layer base { :where(a[href],button,[role=button],input,select,textarea,summary,
   [tabindex]:not([tabindex="-1"])):focus-visible { outline: 2px solid var(--ax-ring);
   outline-offset: 2px } }`.
10. `input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none }` (W2-B draws its own).
11. `showcase-engine.ts`: keep `EASE.inOut = cubic-bezier(0.65, 0, 0.35, 1)` (what users see). It now
    equals `--ease-in-out-strong` per task 2.
12. `verdict.ts`: `dont: "Don’t"` (U+2019). Grep tests for the old literal and update them.
13. `ui/icon-button.tsx`: `IconButton({ size: "sm"|"md", variant: "ghost"|"outline", label, href? })`.
    Base `pressable inline-flex shrink-0 items-center justify-center rounded-full text-ink-muted
    hover:bg-fill hover:text-ink [&_svg]:size-[18px] [&_svg]:stroke-[1.8]`. sm = `size-9 relative
    after:absolute after:-inset-1` (44px hit area), md = `size-11`. outline = `border border-line
    bg-surface`. Renders `<a>` when `href` is set. No `transition-*` utilities (pressable owns transitions).
14. `ui/button.tsx`: `Button({ variant: "primary"|"secondary"|"ghost", size: "sm"|"md" })`. Base
    `pressable relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap
    rounded-full font-medium`. primary `bg-inverse text-on-inverse hover:opacity-90`; secondary
    `border border-line-strong text-ink-secondary hover:bg-fill hover:text-ink`; ghost
    `text-ink-muted hover:text-ink`. sm `h-8 px-3 text-xs after:absolute after:inset-x-0
    after:-inset-y-1.5`; md `min-h-11 px-4 text-xs sm:min-h-10`. Recipes carry no props a caller is
    expected to override. `className` is for layout only (margins, `ml-auto`), and that is documented in the file.
15. `ui/verdict-label.tsx`: `VerdictLabel({ verdict, size: "sm"|"md" })`. CircleCheck/CircleX icon in
    `text-do`/`text-dont`, label in `text-do-ink`/`text-dont-ink` from `VERDICT_LABEL`. sm = `text-xs`
    (no `text-[11px]`, which is below typo-11's floor).
16. `design-system.test.ts` (node env):
    - globals.css declares `--font-sans/serif/mono` inside `@theme`.
    - `.pressable`, `.reveal`, `.rule-card` and `.glass` appear only inside `@layer components`.
    - No `--shadow-(sm|md|lg|xl)` and no `--color-*` declared outside `@theme`.
    - `EASE.out`, `EASE.inOut` and `DUR.fast/medium/slow` equal the parsed CSS values.
    - Token contrast: `ink-muted` and `ink` against `canvas` and `surface` are ≥4.5:1 in both themes
      (reuse the contrast helper from consistency.test.ts), and `ring` against canvas/surface is ≥3:1.
    - Every file whose first line is `// design-system: strict` has zero matches for
      `/\b(?:[a-z-]+:)*(?:bg|text|border|ring|divide|outline|placeholder)-(?:neutral|zinc|gray|slate)-\d{2,3}\b/`,
      `/\bduration-\d+\b/`, `/\bease-(?:in|out|in-out)\b(?!-)/`, `/focus-visible:ring/` and `/bg-\[#/`,
      and no class string combining `pressable` with `transition-` or `duration-`.
    - The three new ui files carry the marker.

Verify: `npm run lint && npm run typecheck && npm test && npm run check` (must print 105/105).
Screenshots of `/` and `/rules/typo-10` at 1440×900 in both themes:
- Do/Don't captions render in IBM Plex Mono (`document.fonts` shows Plex "loaded"; the hyphens look different).
- Dark html, body and page are all #0a0a0a, and home cards are #171717.
- Hovering a card lifts it 2px.
- Tabbing shows a blue 2px outline on every control, sidebar links included.
- Collapsing the sidebar fades the expand button over about 300ms instead of popping it in.
- Opening `?rule=typo-1` at xl does not re-wrap the hero mid-slide, and the drawer settles in about 360ms.
- With reduced motion emulated, the drawer and lane jump with no tween.

**W1-B · Prerender the catalog and kill the cascade.** Owns `src/app/page.tsx`,
`src/components/providers/search-provider.tsx`, `src/lib/rule-search.ts` (new),
`src/lib/__tests__/rule-search.test.ts` (new), `src/components/features/rules/rule-card.tsx`
(only the `reveal` class and the `delay` prop).

1. Move the filter predicate from page.tsx:104-117 verbatim into `rule-search.ts` as
   `filterRules(query: string): Rule[]` and `countByCategory(query: string): Map<string, number>`.
   Test both against a few queries (`""`, `"button"`, `"zzqx"`, an exact id).
2. Remove the page-level `useSearchParams()` bailout. `HomeContent` must not call it. Add
   `<RuleParamSync onChange={setActiveRuleId}/>`, a child that calls `useSearchParams` and
   `resolveRuleId` and pushes the result through an effect, rendered inside its own
   `<Suspense fallback={null}>`. In search-provider.tsx do the same for the initial `q`
   (an inner `<QueryParamSync/>` under `<Suspense fallback={null}>` that seeds `query` once). Keep
   the provider's public API (`query`, `setQuery`, `inputRef`, `focusSearch`) unchanged. Remove
   the `<Suspense fallback={<HomeLoading/>}>` wrapper and delete `HomeLoading`.
3. Delete `delayIndex` and the `--delay` styles. Remove `reveal` from the category `<section>`
   (page.tsx:191) and from the card `<article>` (rule-card.tsx:23), and remove the `delay` prop
   from RuleCard. Keep `reveal` only on the empty-search state, which responds to a user action.
   This applies motion-29: the default catalog doesn't animate on first render, and clearing a
   search doesn't replay a cascade.

Verify: `npm test`. Load `/#accessibility` at 1440 and take a screenshot at 300ms, which must
show the Accessibility cards. In a throwaway build (only with the dev server stopped, or after
confirming Next 16 isolates dev output in `.next/dev`), `npm run build && grep -c "Letter spacing
on caps" .next/server/app/index.html` must be ≥1. `?rule=motion-12` and `?q=focus` deep links
must still open the drawer and filter after hydration.

### Wave 2 — surfaces (eleven disjoint batches, run in parallel)

**W2-A · Sidebar and mobile sheet.** Owns `src/components/layout/sidebar.tsx`.

1. Mobile sheet a11y (F10). On the wrapper (~:259) set `inert={!isOpen || undefined}`.
   On the panel set `id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"`. On
   Open menu set `aria-expanded={isOpen} aria-controls="mobile-menu"`. While open, close on Escape
   (keydown effect), focus `#searchInput-mobile` on open, and return focus to Open menu on close.
   Copy the focus-trap pattern from skill-bonus.tsx:140-184 into this file (don't import it, since
   016 rewrites that file).
2. Shadow bleed (F22): `isOpen ? "translate-x-0 shadow-panel" : "translate-x-full shadow-none"`
   (:278-279). Also add `invisible` when closed with `transition-[transform,visibility]`.
3. Index during search (F23): `countByCategory(query)` from `@/lib/rule-search`. Each link gets
   `<span className="ml-auto text-xs tabular-nums text-ink-muted">{n}</span>` while a query is
   active. Zero-count links get `aria-disabled="true" tabIndex={-1}` with `opacity-40
   pointer-events-none`.
4. Mobile search (F23): wrap the mobile input in `<form role="search" onSubmit>` that closes the
   sheet and focuses `#rulesContainer`. Under the field, show `{n} rules match` (`mt-2 px-2 text-xs
   text-ink-muted`) when the query is non-empty.
5. Contrast (F17): "Axiom UI" eyebrow (:106), "Index" (:125) and llms link (:163) go from
   `text-neutral-400 dark:text-neutral-500` to `text-ink-muted`.
6. Alignment and targets (F57): "Index" `px-1` → `px-2`. The llms link becomes `flex min-h-11 w-full
   items-center rounded-xl px-2 hover:bg-fill`. The nav (`overflow-y-auto`, :128) gets `-mx-1 px-1`
   so 2px-offset outlines aren't clipped.
7. Active vs hover (F57): active `bg-fill text-ink font-semibold` plus a 2px left indicator
   (`before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2
   before:rounded-full before:bg-ink`, link `relative`). Hover `hover:bg-fill/50`.
8. Icon buttons (F44/F62): the collapse/expand, theme slot, Open menu and Close menu use `IconButton`
   (`md` on mobile, `sm` on desktop). Drop the 32px close (:289) and the bordered Open menu (:250),
   so both mobile header buttons match.
9. Motion (F13/F16/F47): remove `duration-150` and `transition-[…]` from pressable elements (:21,
   :143). Panels and the expand button use `duration-slow ease-drawer` for entrances and
   `data-[closed]`/state-driven `duration-medium` for exits. The backdrop (:268) uses
   `duration-medium ease-out-strong`. Add `sidebar-motion` to all four transitioning elements.
10. Tablet (F21): initialise `isDesktopOpen` to `window.matchMedia("(min-width: 1024px)").matches`
    on mount (default open on SSR, then correct in an effect before paint via `useLayoutEffect`),
    so 768–1023 starts collapsed.
11. Lockup (P3): desktop and mobile both show "Axiom UI" `text-base font-semibold text-ink`. On
    desktop "UI logic" follows as `text-xs text-ink-muted`.
12. Replace `rounded-lg`/`rounded-xl` in this file with `rounded-field`/`rounded-full` at today's
    pixels (24px on a 36–40px row is already full), ahead of W3-A.

Verify: at 390, Tab from load goes Skip → theme → Open menu → first card. Esc closes the open
sheet and focus returns to Open menu. No grey band on the right edge in either theme. Typing
"focus" in the sheet shows a count, and Enter reveals the results. At 1440, query "zzqx" dims
all Index links. At 768 the sidebar starts collapsed. Screenshot the sidebar foot: text edges
align at one x.

**W2-B · Search field, theme toggle, 404.** Owns `src/components/features/search/search-input.tsx`,
`src/components/ui/theme-toggle.tsx`, `src/app/not-found.tsx`.

1. search-input: replace the `ring-neutral-400` focus recipe (:45) with
   `focus-visible:outline-offset-0` (house outline). The placeholder becomes `placeholder:text-ink-faint`.
   The kbd (:54) becomes `text-ink-muted font-sans`. Add `enterKeyHint="search"`. When `query` is
   non-empty, render a clear button in the kbd slot: lucide `X` `size-3.5`, `size-7 rounded-md
   text-ink-muted hover:bg-fill`, with `relative after:absolute after:-inset-2` (44px). It clears the
   query and refocuses the input. Field radius `rounded-lg` → `rounded-field`.
2. theme-toggle: render through `IconButton` (sm, ghost). Sun/Moon at 18px, stroke 1.8.
3. not-found: add `whitespace-nowrap` to both links, `sm:flex-row` → `md:flex-row`, and `max-w-md` → `max-w-lg`.
   Use `Button` (primary/secondary, md). Eyebrow and footnote (:20, :46) become `text-ink-muted`. Remove
   the `focus-visible:ring` recipes (:34, :40). `rounded-lg` → `rounded-field`.

Verify: the search field shows the custom ×, not the blue WebKit glyph, in both themes. Tabbing
to the field shows the blue outline. The theme toggle glyph matches the collapse glyph's size.
`/nope` at 1440 has both pills on one line each, and at 390 they stack. Add the strict marker
to any of the three files that are fully clean.

**W2-C · Homepage catalog and card.** Owns `src/app/page.tsx`, `src/components/features/rules/rule-card.tsx`,
`src/components/features/rules/copy-rule-button.tsx`, `src/components/layout/header.tsx`,
`src/components/ui/category-icon.tsx`.

1. Card container queries (F21): `.rule-card` article gets `@container`. Change `md:grid-cols-2`
   (:50) to `@[600px]:grid-cols-2` and the header's `md:grid-cols-[minmax(0,1fr)_auto]` (:26) to
   `@[600px]:grid-cols-[minmax(0,1fr)_auto]`.
2. Concentric card (F42): card `rounded-card p-2`, title block `px-3 pt-3 pb-1 sm:px-4 sm:pt-4`, panel
   `rounded-well p-2.5` (28 = 20 + 8, and 20 = 10 + 10 around the frame). Re-check the mobile card at 390.
3. Card title `<h4>` → `<h3>` (F49). Learn more icon `ArrowUpRight` → `PanelRightOpen` size-3.5 (F76).
4. Active rule (F56): `id={`rule-${rule.id}`}` and `data-active={isActive}` on the article with
   `data-[active=true]:ring-1 data-[active=true]:ring-ink/15`. In page.tsx, when `activeRuleId`
   changes at ≥1280px, run `document.getElementById(`rule-${id}`)?.scrollIntoView({ block: "nearest",
   behavior: reduced ? "auto" : "smooth" })`.
5. Card and copy pills (F41): Learn more and Copy become `Button` secondary sm. In dark they're
   transparent over the surface, not `bg-neutral-950`. copy-rule-button icon variant: `dark:hover:bg-neutral-900`
   (:117) becomes `hover:bg-fill` via `IconButton`. Remove `transition-colors` from pressable elements.
6. Copy glyph (F47): the glyph swap (:174, :182) uses `duration-medium ease-out-strong`, scale
   0.25→1, blur 4px→0, and `motion-reduce:transition-none`.
7. Verdict labels in panels (rule-card.tsx:76-88) become `VerdictLabel size="sm"` (F63, and drops `text-[11px]`).
8. page.tsx rhythm (F59/F60/F61): the count pill becomes `text-sm tabular-nums text-ink-muted` with no border
   or background, and the row is `items-baseline`. Heading→cards `md:mt-6` → `md:mt-4`, and categories
   `md:space-y-10` → `md:space-y-20`. The footer becomes `<footer className="mx-auto w-full max-w-[920px]
   border-t border-line pt-6 pb-10 text-sm text-ink-muted">` with the line on the left and author /
   GitHub / llms.txt links on the right.
9. Live count (F58): `<p role="status" className="sr-only">` with `${n} rules match` while a query is
   active, updated 300ms after typing stops.
10. Page wrapper `bg-neutral-50 dark:bg-neutral-950` → `bg-canvas`. Replace this file's `rounded-lg`/`rounded-xl`
    with semantic radii at today's pixels.
11. category-icon.tsx (F48): drop the hard-coded `h-[18px] w-[18px]` when a `className` is passed, so
    page.tsx's `h-5 w-5` takes effect.
12. header.tsx (F73): the hero list reads "…typography, layout, color, motion, and the states between them."

Verify: at 768 with the sidebar open, card previews sit in one column and "Skip for now" stays on one
line. A corner crop at deviceScaleFactor 2 shows an even gap around the panel corner. In dark,
pills read lighter than or equal to the card, not as holes. Opening `?rule=motion-12` at 1440 scrolls
the grid to motion-12 and outlines it. Category gaps are visibly wider than card gaps.

**W2-D · Rule drawer.** Owns `src/components/features/rules/rule-drawer.tsx`.

1. Width and scrim (F20): Drawer.Content `w-full sm:inset-y-3 sm:right-3 sm:w-[min(calc(100vw-24px),560px)]
   xl:inset-y-6 xl:right-6 xl:w-[min(40vw,480px)]`. The panel is `sm:rounded-card`. Add
   `<Drawer.Overlay className="fixed inset-0 z-[89] bg-neutral-950/20 dark:bg-black/50 xl:hidden"/>`.
2. Modality and focus (F11): `modal={!isXl}` via a `useMediaQuery("(min-width: 1280px)")` hook in this file.
   When `activeRuleId` goes null→id, focus the visible title (`tabIndex={-1}`, `outline-none`,
   `focus({ preventScroll: true })`). On close, restore focus to the element that was active before opening
   (capture it in an effect when the drawer opens).
3. Headings (F49/F50): the category `<h2>` (:225) becomes `<p className="min-w-0 truncate font-sans text-sm
   font-medium text-ink-muted">`. The visible title becomes `<Drawer.Title asChild><h2 …>` and the
   sr-only Drawer.Title (:204) is deleted. Section `<h4 className="drawer-label…">` becomes `<h3
   className="font-sans …">`.
4. Header buttons (F19/F77): close, open-full-page and copy use `IconButton md` (hover `bg-fill`, which
   is #262626 in dark), and all glyphs are 18px.
5. Showcase duplication (F25): when `hasShowcase(rule.id)`, don't render the two verdict articles.
   Render the shorthand once under the showcase as `<dl className="mt-4 grid gap-2 font-mono text-sm
   sm:grid-cols-2">` with a `VerdictLabel size="sm"` term and `rule.do`/`rule.dont` details. For
   non-showcase rules use `VerdictLabel` (F63) and add `min-w-0` to each article (F05).
6. Lead (F51): `text-base leading-7 sm:leading-8` (:252) → `text-base leading-7`.
7. Prev/next (F52): a `grid grid-cols-2 gap-4` nav. Each link is a two-line block: a
   `text-xs text-ink-muted` "Previous"/"Next" label above a `line-clamp-2` title. Next uses
   `col-start-2 justify-self-end text-right`.
8. List numerals (F77/F17): `<li className="flex items-baseline gap-3">`, remove `mt-0.5`, numerals in `text-ink-muted`.
9. Remove `transition-colors` on pressable elements. Replace `focus-visible:ring*` recipes with the house outline.

Verify: at 1024 and 1279 the drawer is a 560px right sheet with a scrim, and prose stays around 60–70 chars per line.
At 390, open a rule with Enter: focus lands on the title and Tab stays inside the drawer. Esc returns
focus to the Learn more that opened it. In dark, hover on the header buttons shows a visible fill.
motion-12 shows Do/Don't once. `/?rule=typo-10` at 390 has no horizontal scroll.

**W2-E · Static rule page.** Owns `src/app/rules/[id]/page.tsx`.

1. F05: add `min-w-0` to both verdict `<article>`s and to the grid. Confirm `scrollWidth === 390` on
   `/rules/typo-10` at 390 and at 320.
2. F26: `<main id="main-content" tabIndex={-1} className="… outline-none">`.
3. F24: wrap the `space-y-10` prose block (:236) and the lead `<p>` (:167) in `max-w-[65ch]`. The lead
   `text-lg leading-8` → `text-lg leading-7` (F51).
4. F54: delete the eyebrow `<p>` (:159-161). Make the "Axiom UI" lockup a `<Link href="/">` (the wordmark
   `font-bold` → `font-semibold`) and drop the separate back arrow (:122). Delete the footer "Back to
   all rules" block (:340-348). Add `<ThemeToggle/>` at `ml-auto` in the header. Breadcrumb links get
   `py-3 -my-3` (F44).
5. F25/F55: for showcase rules, use the same single `<dl>` shorthand as W2-D task 5 and skip the
   two cards. For other rules, drop the outer card chrome (`rounded-2xl border … bg-white p-6` →
   none) and keep `grid gap-6 md:grid-cols-2`, matching the drawer. Showcase card `p-6` → `p-4 sm:p-6`.
   Use `VerdictLabel`.
6. F53: `getRelatedRules(rule, 6).filter(r => r.id !== prev?.id && r.id !== next?.id).slice(0, 3)`.
7. F52/F77: same prev/next grid as W2-D task 7. Same list numerals as W2-D task 8. Tags become
   `h-8 px-3` (no `py-1`) to match the Copy pill.
8. F74: add `siteName: "Axiom UI", locale: "en_US"` to the rule `openGraph`. Replace the `HowTo` JSON-LD
   with `TechArticle` (`headline`, `description`, `about: category.name`, `url`, `isPartOf` the site
   `@id`, `author` the existing person `@id`).
9. Replace this file's `rounded-lg` with semantic radii and migrate the lines touched to tokens.

Verify: screenshot `/rules/typo-1` and `/rules/motion-4` at 1440 and 390 in both themes. The
category appears once, and prose lines measure ≤ 75 chars. Tab from load, then Enter on the skip
link, then Tab lands on the first link inside main. `/rules/typo-10` has no horizontal scroll at
320 or 390. The theme toggles on the page.

**W2-F · Previews, part 1.** Owns `previews/components.tsx`, `previews/layout.tsx`,
`previews/accessibility.tsx`, `previews/forms.tsx` (all under `src/components/features/rules/`).

1. comp-4 (F03): the Don't avatar and both file tiles use `rounded-[5px]` (components.tsx:204, :217).
2. comp-2 (F33/F48): row `rounded-[12px]`, button `rounded-[6px]`. Strip `px/py/text-*` from the shared
   `BTN_*` recipes and pass size per call so `px-1.5 py-0.5 text-[9px]` applies (:113-137). Button
   label "Delete project…" (F80).
3. comp-12 / comp-5 dark (F35): dialog lines and X chip `dark:bg-neutral-700`. Scrim
   `bg-neutral-950/55 dark:bg-black/70`. Page under the overlay `dark:bg-neutral-800` with
   `dark:bg-neutral-700` lines. comp-12 X chip `rounded-[6px]`. comp-5 field labels `w-9` in the UI face
   (`text-[9px] font-medium text-neutral-500`), so "Locale" doesn't truncate (F80).
4. comp-3 (F40): replace the blue dot (:168) with a labelled corner callout (1px blue arc on the outer
   corner plus `r·12` / `r·4` FINE labels).
5. layout-2 (F06): draw a scaled page. Scene `w-[556px] origin-top-left scale-50` inside an
   `overflow-hidden` parent of fixed height, copy at `text-[13px] leading-[20px]`, Do `max-w-[45ch]`,
   Don't full width (≈95ch). Annotations "45ch" vs "≈95ch". Drop the shared "45–75ch reads easily" line,
   or keep it only on Do.
6. layout-11 (F34): layer labels `items-start pt-1.5 leading-none`.
7. layout-7 (F65): the surface layer `absolute inset-px rounded-[9px]`, and Do in dark is `dark:bg-neutral-800/70`
   with stats `dark:bg-neutral-700/70`.
8. a11y-3 (F36): the 44px patch becomes `border-blue-500/30 bg-transparent`, with a 6px centroid dot
   plus a 1px crosshair as the protagonist. Annotation "centroid → gutter" / "centroid → Delete".
9. forms.tsx (F48/F67): remove `text-[11px]` from the `Value` base (:68) so callers' `text-[10px]`
   (:354, :576) apply, and give the default via a size prop. form-9: the "MM / YY" hint goes next to the
   label (`ml-1.5 text-neutral-500`), not as an accent Ann at the far right.

Verify: `npm test` (consistency tests recompute stated claims). Re-shoot each touched rule at 1440
and dsf 2 in both themes, and at 390. comp-4 Don't shows a square-cornered avatar. layout-2 Don't
measures ≈95ch (DOM width / `0` width).

**W2-G · Previews, part 2.** Owns `previews/color.tsx`, `previews/system.tsx`, `previews/typography.tsx`.

1. color-1 (F07): notes stacked `flex flex-col gap-0.5`, with numbers corrected to the measured coverage (re-measure
   after the change; today 3% / 42%).
2. color-6 (F38): the note on its own line under the divider label, then `flex justify-end gap-2` for the buttons.
3. color-2/8/9/10 (F66): color-2 notes stacked and shortened to "#0f172a · 17.9:1 · AAA". `text-pretty`
   on Note spans. color-8 "every state = blue-500/α"-style shortening, and color-10 "rebrand = 3 edits".
   color-9 verdict `mt-1 block` under the helper.
4. color-8 (F65): surface layer `inset-px rounded-[9px]`.
5. Token labels in dark (F65): add `ThemedValue({ light, dark })` (`<span className="dark:hidden">` /
   `<span className="hidden dark:inline">`) and use it for typo-6, color-5, color-6 and color-12 labels.
6. sys-13 (F37): button `shrink-0 whitespace-nowrap`. Draw the drift as three absolutely positioned dashed outlines behind
   the button (w-[92px]/[100px]/[108px], opacity .6/.4/.25). In Do, a single solid button and "width: instant".
7. sys-11 (F39): alternate tick labels above (even) and below (odd) the axis. In Do, the middle zone uses
   Tablet `size-4 rotate-90`.
8. sys-5 (F67): add the second chain to Do: `amber-500 → warning → Payment overdue` (amber chip), annotated
   "each role owns its alias".
9. sys-10 (F67): the Don't shows a native failure: 12px `ImageOff` plus alt text "hero@2x.jpg" flush left in
   neutral-500, with image height collapsed. No dashed box.
10. typography.tsx: typo-10 FileRow icon tile `rounded-[4px]` (F33). typo-7 keeps `text-right` in both panes
    and toggles only `tabular-nums`, with 1-heavy amounts ($1,111.10 / $24.50 / $808.08, total $1,943.68) and Spec
    "tabular-nums" / "proportional-nums" (F67). typo-9 Don't: meta `font-bold`, description `font-medium`,
    title `font-semibold`, label `font-medium` (F67). typo-12/13 Spec "wrap" (F80). typo-11 card
    `max-w-[280px]` (F80).

Verify: as W2-F, for every touched rule. In dark, typo-6/color-5/6/12 labels name the dark steps.

**W2-H · WAAPI showcases.** Owns `demos/motion-showcase.tsx`, `demos/showcase-specs.tsx`,
`demos/showcase-chrome.tsx`, `demos/easing-graph.tsx`, `demos/scenes.tsx`.

1. motion-28 (F04): Don't tracks key the full end state. `icon-in`
   `[{opacity:0,transform:"scale(1)",filter:"blur(0px)"},{opacity:1,transform:"scale(1)",filter:"blur(0px)"}]`,
   and the mirror for exitTracks. Add a showcase-specs test: every property in a scene's inline rest style for
   an animated target is keyed in each pane's tracks.
2. Exit readouts (F27): in `exit()` (motion-showcase.tsx:214) call `runBar` for each pane with
   `{ ...spec.x, tracks: spec.x.exitTracks }`. While engaged, the toggle reads "Dismiss" and has
   `aria-pressed={engaged}`.
3. `readoutMs` (F29): add an optional `readoutMs` to `PaneSpec` (showcase-specs.tsx:43) used by `writeMs`/`runBar`.
   sys-9 do 0 (with a "synced 700ms" tag), don't 560. sys-1 900 / 900. Extend the consistency check
   so a caption's first stated ms equals the readout.
4. motion-25 (F68): `pinRate?: true` on PaneSpec, set on the Don't pane (plays at 1×). Hide the speed group for motion-25.
5. Control row and reduced motion (F69): row 1 `flex items-center justify-between` (action left, speed
   `ml-auto`), row 2 hint `mt-2 text-xs`. When `reduced`, hide the speed group and change the tally to
   "opened ×1 — would cost 0.2s with motion on".
6. Bar tone only (see open questions for the bar's semantics): `h-1 bg-neutral-400 dark:bg-neutral-500`
   on a `bg-neutral-200 dark:bg-neutral-800` track, so it reads as an instrument.
7. Easing graph (F28): the dot's travel box is inset by `pad/w` and `pad/h` percentages
   (easing-graph.tsx:55), not `inset-0`. The dot is visible and unclipped at rest and at the end.
8. motion-23 (F31): parent labels swap "parent · 220ms" → "parent · 140ms" on toggle. Use a 40px move. The child
   animates relative to the parent, so the Do child visibly lags while the Don't child moves in lockstep.
   The mobile label is "child · inherits", with `max-w-full px-3` on the stage.
9. motion-14 (F32): hint "Same 220ms, same smoothness on an idle thread — rule 21 shows what load does to the right one".
10. motion-8 (F71): ButtonScene lg renders `h-10 px-6 text-sm` with a dashed rest-bounds outline behind it.
    motion-10: pip `size-2 ring-2 ring-white dark:ring-neutral-900`, fading out 300ms after settle.
    motion-4 caption (showcase-specs.tsx:250): drop the backticks, and add a test rejecting "`" in captions.
11. PaneChrome caption (F78) `font-mono text-xs leading-5`. Pin stage/frame radii in motion-showcase and
    showcase-chrome (`rounded-lg`, `rounded-md`) to explicit values at today's pixels ahead of W3-A.

Verify: for motion-28, motion-7, motion-4, motion-23, motion-25, sys-9 and motion-8, pause WAAPI at 0 / 150 / 300 / 900ms
(the motion lens's sampling script) in both themes and at 390. With reduced motion the speed control is hidden.

**W2-I · Custom showcases.** Owns `demos/load-showcase.tsx`, `demos/thread-meter.tsx`,
`demos/tooltip-showcase.tsx`, `demos/drag-showcases.tsx`, `demos/interrupt-showcase.tsx`.

1. motion-21/22 (F08): drop `fill: "forwards"` (:159, :278). In `onfinish`, `anim.commitStyles(); anim.cancel()`,
   so `scheduleReset` moves the card home.
2. ThreadMeter (F70): always render. With no samples, show the empty track plus "main thread — run it to record"
   at the same height (`min-h-[48px]`).
3. motion-11 (F09): panes `grid-cols-1 sm:grid-cols-2`. The toolbar frame (:163) gets `min-w-0 overflow-hidden`.
4. motion-19 (F30): the wall moves inside the rail (`left-[68%]`), and damping clamps against that x.
5. motion-18 (F30): measure the 60% marker against the card's travel:
   `left: calc(8px + 60% * (100% - 8px - <card width>))`, the same number the logic uses.
6. Dead air (F78): put the rail inside a visible stage (`flex h-36 items-center rounded-[16px] border
   border-neutral-200 bg-neutral-50/80 px-2 dark:border-neutral-800 dark:bg-neutral-900/50`) in interrupt,
   load and tooltip showcases.

Verify: run motion-21/22 and screenshot at 5s. Both cards are back at rest and the height is unchanged before and after
(273 CSS px). motion-11 at 390 fits its frame. Drag motion-19 past the wall: the overshoot is visible.
motion-18 at 390: the card at rest sits left of the marker.

**W2-J · Rule copy.** Owns `src/data/ui-logic.ts`, `src/data/deep-dives.ts`, `src/data/__tests__/consistency.test.ts`.

1. typo-1 (F46): desc "Capitalize only the first word and proper nouns. Sentence case reads as plain
   speech, removes the per-word capitalization debate, and keeps proper nouns standing out." Rewrite
   `whyItMatters` around consistency, tone and proper-noun contrast, with no word-shape claim. In typo-2's deep dive,
   replace the "silhouette" claim with "caps share one height, so spacing is the only cue separating letters".
2. F72: comp-2 desc "Keep Delete secondary. For permanent deletes, confirm in a modal with a red button;
   when the delete can be undone, use an undo toast instead (sys-6)." motion-9 desc adds "Small icons
   (≤24px) are the exception; see motion-28." layout-8 desc "Within one grid, use one gutter for siblings
   of the same kind; vary gaps only to show grouping (layout-3)."
3. F39/F40/F80: sys-11 do "2 breakpoints: 640px / 1024px (3 tiers)", dont "8 breakpoints, one per device".
   comp-3 dont "Outer 4px = Inner 4px (padding ignored)". comp-2 caption must match the "Delete project…"
   label (W2-F). typo-1 caption: change it to "Invite your team / Skip for now" to match the pane.
4. F75: straight apostrophes between letters in deep-dives.ts prose become ’. "grey" becomes "gray"
   throughout (keep code strings untouched). Add tests: no straight `'` between letters in prose fields,
   and no "grey".

Verify: `npm test && npm run check` (105/105). Spot-read typo-1, comp-2 and sys-11 on the rule page.

**W2-K · Site metadata and homepage OG.** Owns `src/app/layout.tsx`, `src/app/opengraph-image.tsx` (new),
`src/app/sitemap.ts`, `public/og-image.png` (delete).

1. F45: `src/app/opengraph-image.tsx` (`size = { width: 1200, height: 630 }`), built from the same fonts
   and JSX vocabulary as `rules/[id]/opengraph-image.tsx`: Axiom UI mark, serif headline "The decision engine
   behind sharp, consistent interfaces", and `${rules.length} rules · ${categories.length} categories`.
   Remove the `openGraph.images`/`twitter.images` entries from layout.tsx and delete `public/og-image.png`.
   The JSON-LD Organization logo becomes `/icon.png` (or the existing icon route).
2. F73: description "`${ruleCount}` UI design rules with live do/don’t previews: typography, layout,
   color, components, forms, system states, motion, and accessibility." Use it for og:description and JSON-LD.
3. F81: `lastModified` → `new Date("2026-10-02")`.

Verify: `/opengraph-image` renders 1200×630. View-source on `/` shows the new og:image URL and description.

### Wave 3 — take back the radius scale, delete dead code

**W3-A · Radius scale reset.** Owns `src/app/globals.css`, `src/components/features/rules/preview-primitives.tsx`,
`previews/*.tsx` (all seven), `src/lib/__tests__/design-system.test.ts`. Starts only after every wave-2 batch has pinned its chrome
`rounded-sm/md/lg/xl` uses (re-grep the chrome files listed in "Token decisions". Expected remaining:
zero outside previews/demos scenes).

1. Delete `--radius-sm/md/lg/xl` from `:root` (globals.css:66-69). Numeric names return to Tailwind's
   4/6/8/12, and `rounded-xl` < `rounded-2xl` again. Delete `.drawer-label` (W2-D removed its uses).
2. Re-shoot all 72 static previews at 1440 / dsf 2 in both themes (the previews lens's combo script).
   Mini fields and buttons should stop being pills. Fix only real regressions, with explicit radii
   where a rule depends on corners (comp-3, comp-4, nested cases).
3. preview-primitives.tsx: delete the 10 never-imported primitives (textClass, MiniInput, MiniLabel,
   MiniBlock, MiniAvatar, MiniSwitch, MiniCheckbox, MiniRadio, MiniDot, MiniPlayCircle).
4. design-system.test.ts: assert globals.css declares no `--radius-(xs|sm|md|lg|xl|\dxl)` outside `@theme`.
5. `skill-bonus.tsx` belongs to 016. Before deleting the radius lines, ask 016's owner to pin any
   `rounded-lg/xl` left in it to explicit values. Don't edit that file from this batch.

Verify: the combo sheets before and after, side by side. comp-3's own Do still reads concentric. No chrome
element changes pixels (compare the sidebar, cards and drawer at 1440).

**W3-B · Remove the dead `size="sm"` preview branch.** Owns `src/components/features/rules/rule-preview.tsx`,
`demos/scenes.tsx`, `demos/showcase-specs.tsx`, `demos/easing-graph.tsx`, `src/data/__tests__/rule-previews.test.ts`.

1. Remove `PreviewSize` from `PreviewRenderer`/`DemoProps`, and collapse every `size === "lg" ? A : B` / `isLg`
   to A (scenes.tsx has 56 sites, plus showcase-specs.tsx:122-131 and easing-graph).
2. rule-previews.test.ts: assert every non-showcase id has a static preview (no GenericPreview fallback).

Verify: `npm run typecheck && npm test`. Pixel spot-check five showcases and five cards. Nothing changes.

## Rejected or deferred

| Finding | Reason |
|---|---|
| Category names in Title Case (content P0) | Already fixed in `2089439`. |
| sys-12 / motion-3 duplicate, redirect, 106 counts | Already fixed in `2089439` (catalog is 105, redirect in next.config.ts). |
| `<title>` "UI Logic Repository" | Already sentence case in layout.tsx. |
| Change motion-12 to 240ms to satisfy motion-6 | The interruption lesson needs a window long enough to hit mid-flight, and consistency tests pin the showcase duration. Keep it. |
| Bar shows eased progress next to a linear ms counter → make it linear and proportional | Plan 005 made bars easing-aware on purpose. This is a semantics decision, so it's in open questions. Only the bar tone ships now (W2-H task 6). |
| Wire `rate` into motion-12 and the load races | Plan 011 owns those durations, and scaling them reopens 011/012's tuning. Not worth it this round. |
| tailwind-merge in `cn()` | 016 forbids new site dependencies. The three dead overrides are fixed at source (W2-C, W2-F) and recipes are rule-bound (W1-A task 14). |
| Inline-code backtick convention across all deep-dive prose | A new rendering feature, not a defect. The one literal backtick is fixed (W2-H task 10). Revisit with the ~35 terse descs. |
| Rewrite ~35 terse rule descs into "claim + why" | Editorial voice is the owner's call (open questions). |
| color-11 thumbnails read as inputs | Taste. The pane still demonstrates the outline. |
| Bulk-migrate ~485 raw neutral utilities in chrome (plan 010) | Bulk replacement corrupted class strings last time. Migration is per touched line with the strict-marker ratchet. |
| Separate `Chip` primitive | Two uses after W2-C/W2-E remove the count pill border and re-size tags. Not enough to justify it. |
| Sitemap-date git test | `git log` in vitest breaks on shallow CI clones. Bump the date by hand. |
| Skill modal: SKILL.md headings in Title Case, 2.0 line-height, title stated twice, `#111216` surface, white ring-offset halo, `text-[11px]` "Bonus skill", sidebar skill-row inset | **Handed to 016**, which rewrites `skill-bonus.tsx` and moves the SKILL.md body. 016 should apply: sentence-case headings; body `text-sm leading-6 sm:text-base sm:leading-[26px]`; header shows only "SKILL.md"; `bg-surface` instead of `#111216`; no `ring-offset`; `text-xs text-ink-muted` labels; row text inset `px-2` to align with the Index. |
| llms.txt lists category hashes, not the 105 rule URLs | **Handed to 016** (it edits `llms.txt/route.ts`). Change it to one `### <category>` per category with `- [title](origin/rules/id): desc`. |

## Open questions (owner decisions)

1. **Recategorise rules?** sys-3 (targets), sys-8 (keyboard) and color-9 (contrast) are accessibility rules,
   and sys-13/sys-14 are motion performance rules. Ids carry the category prefix, so moving them changes URLs
   and needs redirects. Accessibility has 3 rules while Motion has 29.
2. **Merge or retitle near-duplicates?** motion-1/motion-2 (frequency vs keyboard), layout-1 (4px base) vs
   layout-10 (8px base, "8 → 13 → 18px"), layout-4 vs layout-6 (optical alignment twice).
3. **color-7 vs color-10.** color-7's Do is hand-picked `blue-600 → blue-700`, which is color-10's Don't.
   Either reword color-10 to allow scale steps for solid fills, or change color-7 to `blue-600/90`.
4. **motion-24 (30–80ms stagger) vs motion-26 (80–100ms).** Widen motion-24 or retune motion-26's showcase.
5. **Type system vs typo-5/typo-9.** The site loads three families and Manrope 400/500/600/700, which is typo-9's Don't
   word for word. Either drop to two weights and two text faces, or soften the rules to say a code mono doesn't count.
6. **Timing bar semantics.** Should it measure time (linear, length ∝ duration) or motion progress (eased, as now)?
7. **Default playback rate ½×.** It makes "responsiveness" Do panes feel slower than the rule promises on first view.
8. **Touch fallback for hover-only lessons** (motion-11 tooltips, motion-16). The "sweep" hint can't be followed on a phone.
9. **Paging across categories.** Prev/next and the arrow keys stop at category edges today.
10. **Rule desc voice.** About 35 descs are terse fragments or absolutes ("Never show a broken state."). Should they be
    rewritten to "rule + mechanism"?

## Relation to older plans

- **008** (tokens into Tailwind): superseded by W1-A. Its `@theme inline { --color-accent: var(--color-accent) }`
  was self-referential in Tailwind's namespace, the same collision class as the radius bug. W1-A renames raw
  values to `--ax-*` first.
- **009** (primitives): superseded by W1-A tasks 13–15 (IconButton, Button, VerdictLabel).
- **010** (migration + guardrails): the guardrail half is superseded by `design-system.test.ts` and the
  strict-marker ratchet. The remaining chrome migration happens per touched line in wave 2 and in later rounds,
  never in bulk.
- Root `PLAN-*.md` files are background only. `PLAN-client-bundle-diet.md` is why no dependency is added here.

## Shared verification

Every batch: `npm run lint && npm run typecheck && npm run check && npm test`, then the batch's on-screen
checks against the running dev server (Playwright, 1440×900 and 390×844, light and dark via
`localStorage['axiom-theme:v1']` in an init script, dsf 2 for crops). Wave 1 and wave 3 also need a
throwaway `npm run build` (see W1-B). Commit per batch, in the owner's voice, with no model attribution.
