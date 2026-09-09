import { ImageResponse } from "next/og";
import { categories, rules } from "@/data/ui-logic";
import { VERDICT_LABEL } from "@/lib/verdict";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Axiom UI design rule — Do and Don't comparison";

type Props = {
  params: Promise<{ id: string }>;
};

// ── Palette (mirrors the site's dark theme) ─────────────────────────
const CANVAS = "#0a0a0a"; // neutral-950 page ground
const PANEL_BORDER = "rgba(255, 255, 255, 0.08)";
const INK = "#fafafa"; // neutral-50
const INK_MUTED = "#a3a3a3"; // neutral-400
const INK_EVIDENCE = "#d4d4d4"; // neutral-300 — mono evidence
const ACCENT = "#60a5fa"; // blue-400 — the one accent
const EMERALD_ICON = "#34d399"; // emerald-400
const EMERALD_LABEL = "#6ee7b7"; // emerald-300
const ROSE_ICON = "#fda4af"; // rose-300
const ROSE_LABEL = "#fecdd3"; // rose-200

// ── Brand fonts, fetched once per server process and cached across image
// requests. Requests are bounded so a slow third party cannot stall the social
// image. All-or-nothing: a partial set would mix brand and default faces, so
// any failure falls back to ImageResponse's built-in font stack.
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

// ── Shared pieces ───────────────────────────────────────────────────

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

/** lucide CheckCircle2 / XCircle, matching the rule cards' label chrome. */
function VerdictIcon({ kind }: { kind: "do" | "dont" }) {
  return (
    <svg
      width={23}
      height={23}
      viewBox="0 0 24 24"
      fill="none"
      stroke={kind === "do" ? EMERALD_ICON : ROSE_ICON}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      {kind === "do" ? (
        <path d="m9 12 2 2 4-4" />
      ) : (
        <path d="m15 9-6 6M9 9l6 6" />
      )}
    </svg>
  );
}

/** One half of the controlled experiment: label chrome + mono evidence. */
function VerdictPanel({ kind, text }: { kind: "do" | "dont"; text: string }) {
  const evidence = text.length > 80 ? `${text.slice(0, 77)}…` : text;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 13,
        flex: 1,
        padding: "25px 28px",
        borderRadius: 24,
        backgroundColor: "#0e0e10",
        border: `1px solid ${PANEL_BORDER}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <VerdictIcon kind={kind} />
        <div
          style={{
            display: "flex",
            fontFamily: SANS,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 0.3,
            color: kind === "do" ? EMERALD_LABEL : ROSE_LABEL,
          }}
        >
          {VERDICT_LABEL[kind]}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: MONO,
          fontSize: 23,
          lineHeight: 1.5,
          color: INK_EVIDENCE,
        }}
      >
        {evidence}
      </div>
    </div>
  );
}

/** The floating panel that carries the whole composition. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
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
          padding: "48px 60px 52px",
          borderRadius: 40,
          border: `1px solid ${PANEL_BORDER}`,
          backgroundImage: "linear-gradient(180deg, #17171a 0%, #101012 100%)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Display-level smart punctuation: data stays straight-quoted. */
function smartApostrophes(text: string): string {
  return text.replace(/'/g, "’");
}

/** Long titles step down the scale instead of wrapping into a crowd. */
function titleSize(title: string): number {
  if (title.length <= 18) return 78;
  if (title.length <= 28) return 68;
  return 58;
}

// ── Route handler ───────────────────────────────────────────────────

export default async function Image({ params }: Props) {
  const { id } = await params;
  const rule = rules.find((candidate) => candidate.id === id);
  const category = categories.find((candidate) => candidate.id === rule?.category);
  const fonts = await loadBrandFonts();
  const options = fonts.length > 0 ? { ...size, fonts } : size;

  if (!rule) {
    // dynamicParams=false makes this unreachable, but never render a
    // broken card — a quiet brand lockup on the same floating stage.
    return new ImageResponse(
      (
        <Stage>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: 26,
            }}
          >
            <AxiomMark width={64} />
            <div
              style={{
                display: "flex",
                fontFamily: SERIF,
                fontSize: 84,
                fontWeight: 600,
                letterSpacing: -1,
                color: INK,
              }}
            >
              Axiom
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: SANS,
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: INK_MUTED,
              }}
            >
              UI Logic Repository
            </div>
          </div>
        </Stage>
      ),
      options,
    );
  }

  const heroSize = titleSize(rule.title);

  return new ImageResponse(
    (
      <Stage>
        {/* Header row: wordmark left, rule id as quiet mono detail right */}
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
              Axiom
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
            {rule.id}
          </div>
        </div>

        {/* Hero: category eyebrow + serif display title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: 16,
            paddingBottom: 6,
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
            {category?.name ?? "UI Logic"}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: SERIF,
              fontSize: heroSize,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: -(heroSize * 0.015),
              color: INK,
              textWrap: "balance",
            }}
          >
            {smartApostrophes(rule.title)}
          </div>
        </div>

        {/* The controlled experiment: emerald/rose evidence pair */}
        <div style={{ display: "flex", gap: 20 }}>
          <VerdictPanel kind="do" text={rule.do} />
          <VerdictPanel kind="dont" text={rule.dont} />
        </div>
      </Stage>
    ),
    options,
  );
}
