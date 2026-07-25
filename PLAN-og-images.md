# PLAN: Per-rule Open Graph images

**Rank: 2 of 5.** The last three shipped plans made the 106 `/rules/[id]` pages reachable (internal links), unique (authored deep dives), and machine-readable (llms exports). The one missing piece of the SEO/sharing story: every rule page still shares the single static `/og-image.png`. When someone pastes a rule link into Slack/X/LinkedIn, the card says nothing about the rule. Generate a unique 1200×630 card per rule at build time.

## Goal

Use Next's file-convention metadata image (`opengraph-image.tsx` inside the `rules/[id]` segment) with `ImageResponse` from `next/og`. Because the segment already has `generateStaticParams` and `dynamicParams = false`, all 106 images render **at build time** — zero runtime cost. Also flip the rule pages' Twitter card from `summary` to `summary_large_image` so the big card actually shows.

## Files to touch

| File | Change |
|---|---|
| `src/app/rules/[id]/opengraph-image.tsx` (NEW) | The image renderer |
| `src/app/rules/[id]/page.tsx` | `twitter.card: "summary"` → `"summary_large_image"` |

Do **not** touch `src/app/layout.tsx` or `public/og-image.png` — the homepage keeps its static card. Do not add an `opengraph-image` at the app root.

## Implementation order

### Step 1 — the image file

Create `src/app/rules/[id]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { categories, rules } from "@/data/ui-logic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Axiom UI design rule — Do and Don't comparison";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const rule = rules.find((r) => r.id === id);
    const category = categories.find((c) => c.id === rule?.category);

    if (!rule) {
        // dynamicParams=false makes this unreachable, but never render a broken card.
        return new ImageResponse(
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", color: "#fafafa", fontSize: 64 }}>
                Axiom
            </div>,
            size
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#0a0a0a",
                    color: "#fafafa",
                    padding: 72,
                    fontFamily: "sans-serif",
                }}
            >
                {/* Header row: wordmark + category */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                backgroundColor: "#fafafa",
                                color: "#0a0a0a",
                                fontSize: 34,
                                fontWeight: 700,
                            }}
                        >
                            A
                        </div>
                        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>Axiom</div>
                    </div>
                    <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>{category?.name ?? ""}</div>
                </div>

                {/* Title + desc */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                        {rule.title}
                    </div>
                    <div style={{ display: "flex", fontSize: 30, lineHeight: 1.4, color: "#a1a1aa", maxWidth: 980 }}>
                        {rule.desc.length > 140 ? `${rule.desc.slice(0, 137)}...` : rule.desc}
                    </div>
                </div>

                {/* Do / Don't strip */}
                <div style={{ display: "flex", gap: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                            padding: "24px 28px",
                            borderRadius: 20,
                            backgroundColor: "#052e1b",
                            border: "1px solid #14532d",
                        }}
                    >
                        <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#34d399" }}>Do</div>
                        <div style={{ display: "flex", fontSize: 26, color: "#e4e4e7" }}>
                            {rule.do.length > 60 ? `${rule.do.slice(0, 57)}...` : rule.do}
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                            padding: "24px 28px",
                            borderRadius: 20,
                            backgroundColor: "#3b0a12",
                            border: "1px solid #7f1d1d",
                        }}
                    >
                        <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#fb7185" }}>Don't</div>
                        <div style={{ display: "flex", fontSize: 26, color: "#e4e4e7" }}>
                            {rule.dont.length > 60 ? `${rule.dont.slice(0, 57)}...` : rule.dont}
                        </div>
                    </div>
                </div>
            </div>
        ),
        size
    );
}
```

### Step 2 — flip the Twitter card

In `src/app/rules/[id]/page.tsx`, inside `generateMetadata`, change:

```ts
        twitter: {
            card: "summary",
```

to:

```ts
        twitter: {
            card: "summary_large_image",
```

Change nothing else in that object. Next's file convention automatically injects `og:image` and `twitter:image` tags pointing at the generated image for this segment — do not manually add an `images` array anywhere.

## Edge cases found during exploration (a weaker model will miss these)

1. **Satori (the renderer behind `ImageResponse`) requires `display: flex` on every element with more than one child.** A plain `<div>` wrapping two children throws at build time with a cryptic error. Every multi-child `div` in the JSX above already carries `display: "flex"` — keep that discipline for any layout change.
2. **No Tailwind classes work here.** Satori consumes inline `style` objects only. Do not "clean up" the inline styles into `className`s.
3. **`params` is a Promise in this Next version** (the sibling `page.tsx` does `const { id } = await params`) — the image function must `await params` too, or every image renders the fallback.
4. **Don't load custom fonts.** `next/og` ships a bundled default font; loading Manrope/Source Serif requires raw font bytes at build time and is the #1 way this plan fails. System default is acceptable for v1 — a follow-up can add fonts.
5. **Long content must be truncated in code** (the `.slice` guards above). Rules like sys-5 have long `do` strings; satori does not ellipsize for you, it overflows the box.
6. **Curly quotes and the apostrophe in "Don't"** render fine in the default font — do not replace them with ASCII equivalents.
7. **Do not create `twitter-image.tsx`.** The opengraph image doubles as the Twitter image automatically; a second file doubles build work for nothing.
8. **Build-time verification, not just dev:** in `next dev` these images render on-demand and can mask build failures. The acceptance criteria below require a full `npm run build`.

## Acceptance criteria

1. `npm run build` succeeds; the route table lists `/rules/[id]/opengraph-image` (or equivalent image route) and all 106 pages still generate.
2. `npm run lint` and `npx tsc --noEmit` pass.
3. Start the dev server. `curl -sI http://localhost:3000/rules/motion-6/opengraph-image` (append the query/hash suffix Next generates if needed — find the exact URL in the page's `<meta property="og:image">` tag) returns `200` with `content-type: image/png`.
4. View source on `http://localhost:3000/rules/typo-1`: there is a `<meta property="og:image"` tag pointing at the segment image (not `/og-image.png`), and `<meta name="twitter:card" content="summary_large_image">`.
5. Fetch two different rules' images (e.g. typo-1 and motion-18) and confirm they differ in size/bytes (`curl -s <url> | wc -c` for each — different counts, or save both and `cmp`).
6. Homepage still uses the static card: view source on `/` shows `og:image` ending in `/og-image.png`.
7. Visual check: open one generated image in the browser — title legible, Do panel green-tinted, Don't panel red-tinted, no text overflowing its box (check a long-title rule like `color-8 "Dark Mode Isn't Inverted"`).
