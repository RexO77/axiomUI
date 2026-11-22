import { ImageResponse } from "next/og";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { railCategories } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Axiom UI design catalog with ${rules.length} rules in ${railCategories.length} categories`;

// The homepage card speaks the same visual language as the per-rule cards in
// rules/[id]/opengraph-image.tsx: the dark floating stage, the mark and
// wordmark, a quiet mono pill, a blue eyebrow and a display line.

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
    loadGoogleFont("Inter", 500),
    loadGoogleFont("Inter", 600),
    loadGoogleFont("Inter", 700),
    loadGoogleFont("IBM Plex Mono", 400),
  ]).catch(() => []);

  return fontsPromise;
}

const SANS = "Inter, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const index = railCategories.map((category) => ({
  id: category.id,
  name: category.short,
  count: category.rules.length,
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
              <AxiomLogo width={34} color={INK} />
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
              {`${rules.length} rules · ${railCategories.length} categories`}
            </div>
          </div>

          {/* Hero: eyebrow + display headline */}
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
                letterSpacing: 0,
                color: ACCENT,
              }}
            >
              UI design rules
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 900,
                fontFamily: SANS,
                fontSize: 64,
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: -0.96,
                color: INK,
                textWrap: "balance",
              }}
            >
              Compare the Do and Don’t examples for each rule.
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
