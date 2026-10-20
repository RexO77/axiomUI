import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rules } from "@/data/ui-logic";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { absoluteUrl, siteConfig } from "@/lib/site";
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
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function() {
      try {
        var storageKey = 'axiom-theme:v1';
        var stored = localStorage.getItem(storageKey);
        var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = mode === 'dark' || (mode === 'system' && prefersDark);
        var root = document.documentElement;
        root.classList.toggle('dark', isDark);
        root.dataset.theme = isDark ? 'dark' : 'light';
        root.style.colorScheme = isDark ? 'dark' : 'light';
      } catch (e) {}
    })();
  `;

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
          url: absoluteUrl("/icon.png"),
          width: 1024,
          height: 1024,
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
      <body
        className={`${sourceSerif.variable} ${manrope.variable} ${plexMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
