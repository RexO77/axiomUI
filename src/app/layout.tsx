// design-system: strict
import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rules } from "@/data/ui-logic";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { bootScript } from "@/components/shell/boot-script";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { brandIcons } from "@/lib/brand";
import "./globals.css";

const ruleCount = rules.length;
const description = `${ruleCount} UI design rules with live do/don’t previews: typography, layout, color, components, forms, system states, motion, and accessibility.`;

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/*
 * Runs before first paint, from <head>: the theme (a stored choice, else the
 * system's, even when storage is blocked) and the catalog shell's first-paint
 * attributes. It is part of the document React hydrates and never renders
 * again, so it never shows up as a script in a client render.
 */
const themeScript =
  "(function(){var d=document.documentElement,mode='system',dark=false;" +
  "try{var stored=window.localStorage.getItem('axiom-theme:v1');" +
  "if(stored==='light'||stored==='dark'||stored==='system')mode=stored}catch(e){}" +
  "try{dark=mode==='dark'||(mode==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){dark=mode==='dark'}" +
  "d.classList.toggle('dark',dark);d.dataset.theme=dark?'dark':'light';d.style.colorScheme=dark?'dark':'light'})();";
const firstPaintScript = themeScript + bootScript();

/** Vercel's analytics endpoints exist only on a Vercel deployment; anywhere else they 404 on every load. */
const onVercel = Boolean(process.env.VERCEL);

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Axiom UI — UI logic repository",
    template: "%s | Axiom UI",
  },
  description,
  keywords: [
    "design system",
    "UI logic",
    "typography rules",
    "button padding",
    "color theory",
    "UX patterns",
    "interface design",
    "design decisions",
    "refactoring UI",
    "component patterns",
  ],
  authors: [{ name: "Nischal Skanda" }],
  creator: "Nischal Skanda",
  metadataBase: new URL(siteConfig.origin),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.origin,
    title: "Axiom UI — UI logic repository",
    description,
    siteName: "Axiom UI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom UI — UI logic repository",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: brandIcons.svg, type: "image/svg+xml", sizes: "any" },
      { url: brandIcons.png, type: "image/png", sizes: `${brandIcons.pngSize}x${brandIcons.pngSize}` },
    ],
    apple: { url: brandIcons.apple, sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.origin}/#website`,
        url: siteConfig.origin,
        name: "Axiom UI",
        description,
        publisher: {
          "@id": `${siteConfig.origin}/#organization`,
        },
        creator: {
          "@id": "https://www.nischal.fyi/#person",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.origin}/#organization`,
        name: "Axiom UI",
        url: siteConfig.origin,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(brandIcons.png),
          width: brandIcons.pngSize,
          height: brandIcons.pngSize,
        },
      },
      {
        "@type": "Person",
        "@id": "https://www.nischal.fyi/#person",
        name: "Nischal Skanda",
        url: "https://www.nischal.fyi/",
        jobTitle: "Product Designer and Design Engineer",
        sameAs: [
          "https://github.com/RexO77",
          "https://www.linkedin.com/in/nischalskanda",
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.origin}/#collection`,
        url: siteConfig.origin,
        name: "UI logic rules",
        description,
        isPartOf: {
          "@id": `${siteConfig.origin}/#website`,
        },
        about: {
          "@type": "Thing",
          name: "User interface design",
        },
        numberOfItems: ruleCount,
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: firstPaintScript }} />
      </head>
      <body
        className={`${sourceSerif.variable} ${manrope.variable} ${plexMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        {onVercel ? <Analytics /> : null}
        {onVercel ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
