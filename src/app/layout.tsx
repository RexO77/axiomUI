import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = "https://axiomui.vercel.app";

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
    default: "Axiom — UI Logic Repository",
    template: "%s | Axiom",
  },
  description:
    "29 actionable UI design rules covering typography, layout, color, and components. Learn button padding formulas, the 60-30-10 rule, modal vs drawer patterns, and more.",
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
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Axiom — UI Logic Repository",
    description:
      "29 actionable UI design rules for consistent, sharp interfaces. Master typography, layout, color, and component patterns.",
    siteName: "Axiom",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Axiom UI Logic Repository — Design System Rules",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom — UI Logic Repository",
    description:
      "29 actionable UI design rules for consistent, sharp interfaces.",
    images: ["/og-image.png"],
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
      { url: "/favicon.ico" },
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
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Axiom",
        description:
          "UI Logic Repository of repeatable design decisions for consistent, sharp interfaces",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Axiom",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/og-image.png`,
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#collection`,
        url: siteUrl,
        name: "UI Logic Rules",
        description:
          "29 actionable UI design rules covering typography, layout, color, and components",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@type": "Thing",
          name: "User Interface Design",
        },
        numberOfItems: 29,
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
