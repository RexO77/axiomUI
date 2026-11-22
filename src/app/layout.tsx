// design-system: strict
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rules } from "@/data/ui-logic";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { bootScript } from "@/components/shell/boot-script";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { brandIcons } from "@/lib/brand";
import "./globals.css";

const ruleCount = rules.length;
const description = `Explore ${ruleCount} UI design rules with live Do and Don’t previews, from typography and layout to motion and accessibility.`;

/*
 * The sans is SF Pro on Apple devices (the system face, named first in
 * --font-sans) and Inter everywhere else. Inter is the variable cut with its
 * optical-size axis, so headings take the Display design the way SF switches
 * to SF Display. It is not preloaded: an Apple device never needs the file.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
  preload: false,
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
  "d.classList.toggle('dark',dark);d.dataset.theme=dark?'dark':'light';d.style.colorScheme=dark?'dark':'light';" +
  // Off Apple devices the sans is Inter, which takes its own tracking (globals.css).
  "try{var u=navigator.userAgentData,p=(u&&u.platform)||navigator.platform||'';" +
  "if(!/mac|iphone|ipad|ipod/i.test(p))d.dataset.face='inter'}catch(e){}})();";
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
    default: "All rules · Axiom UI",
    template: "%s · Axiom UI",
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
    title: "UI design rules · Axiom UI",
    description,
    siteName: "Axiom UI",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI design rules · Axiom UI",
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
        name: "UI design rules",
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
        className={`${inter.variable} ${plexMono.variable} antialiased`}
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
