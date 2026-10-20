import { ImageResponse } from "next/og";
import { categories, rules } from "@/data/ui-logic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Axiom UI — ${rules.length} UI design rules across ${categories.length} categories`;

// The homepage card speaks the same visual language as the per-rule cards in
// rules/[id]/opengraph-image.tsx: the dark floating stage, the mark and
// wordmark, a quiet mono pill, a blue eyebrow and a serif display line.

// ── Palette (mirrors the site's dark theme) ─────────────────────────
const CANVAS = "#0a0a0a"; // neutral-950 page ground
const PANEL_BORDER = "rgba(255, 255, 255, 0.08)";
const INK = "#fafafa"; // neutral-50
const INK_MUTED = "#a3a3a3"; // neutral-400
const INK_EVIDENCE = "#d4d4d4"; // neutral-300
const ACCENT = "#60a5fa"; // blue-400 — the one accent

// ── Brand fonts, fetched once per server process and cached across image
// requests. Bounded so a slow third party cannot stall the social image, and
// all-or-nothing so a partial set never mixes brand and default faces.
type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

async function loadGoogleFont(
  family: string,
  weight: LoadedFont["weight"],
): Promise<LoadedFont> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
  const cssResponse = await fetch(cssUrl, { signal: AbortSignal.timeout(2500) });

  if (!cssResponse.ok) {
    throw new Error(`Font stylesheet fetch failed for ${family} ${weight}`);
  }

  const css = await cssResponse.text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
  );

  if (!resource) {
    throw new Error(`No TTF source for ${family} ${weight}`);
  }

  const response = await fetch(resource[1], { signal: AbortSignal.timeout(2500) });

  if (!response.ok) {
    throw new Error(`Font fetch failed for ${family} ${weight}`);
  }

  return {
    name: family,
    data: await response.arrayBuffer(),
    weight,
    style: "normal",
  };
}

let fontsPromise: Promise<LoadedFont[]> | null = null;

function loadBrandFonts(): Promise<LoadedFont[]> {
  fontsPromise ??= Promise.all([
    loadGoogleFont("Source Serif 4", 600),
    loadGoogleFont("Manrope", 500),
    loadGoogleFont("Manrope", 700),
    loadGoogleFont("IBM Plex Mono", 400),
  ]).catch(() => []);

  return fontsPromise;
}

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "Manrope, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

/** The site's layered-stack mark (AxiomLogo), inlined for satori. */
function AxiomMark({ width }: { width: number }) {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L3 8.5L12 14L21 8.5L12 3Z" />
      <path d="M3 15.5L12 21L21 15.5" />
      <path d="M3 12L12 17.5L21 12" />
    </svg>
  );
}

/** "Typography & text" → "Typography": the index needs the noun, not the pair. */
function shortName(name: string): string {
  return name.split(" & ")[0];
}

const index = categories.map((category) => ({
  id: category.id,
  name: shortName(category.name),
  count: rules.filter((rule) => rule.category === category.id).length,
}));

export default async function Image() {
  const fonts = await loadBrandFonts();
  const options = fonts.length > 0 ? { ...size, fonts } : size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: CANVAS,
          padding: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 60px 44px",
            borderRadius: 40,
            border: `1px solid ${PANEL_BORDER}`,
            backgroundImage: "linear-gradient(180deg, #17171a 0%, #101012 100%)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Header row: wordmark left, catalog size as quiet mono detail right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <AxiomMark width={34} />
              <div
                style={{
                  display: "flex",
                  fontFamily: SANS,
                  fontSize: 29,
                  fontWeight: 700,
                  letterSpacing: -0.3,
                  color: INK,
                }}
              >
                Axiom UI
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: MONO,
                fontSize: 21,
                color: INK_MUTED,
                padding: "7px 17px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              {`${rules.length} rules · ${categories.length} categories`}
            </div>
          </div>

          {/* Hero: eyebrow + serif display headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: SANS,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2.6,
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              UI logic repository
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 900,
                fontFamily: SERIF,
                fontSize: 64,
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: -0.96,
                color: INK,
                textWrap: "balance",
              }}
            >
              The decision engine behind sharp, consistent interfaces
            </div>
          </div>

          {/* The catalog index: every category with its rule count. Each count
              sits right after its own name and the space goes between the four
              equal columns, so a pair always reads as one unit (layout-3). */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              rowGap: 14,
              paddingTop: 26,
            }}
          >
            {index.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "25%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontFamily: SANS,
                    fontSize: 21,
                    fontWeight: 500,
                    lineHeight: "28px",
                    color: INK_EVIDENCE,
                  }}
                >
                  {entry.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: MONO,
                    fontSize: 20,
                    lineHeight: "28px",
                    color: INK_MUTED,
                  }}
                >
                  {entry.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    options,
  );
}
