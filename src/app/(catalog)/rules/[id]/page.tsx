// design-system: strict
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Inspector } from "@/components/rule/inspector";
import { railCategory, railCategoryOf } from "@/data/taxonomy";
import { categories, rules } from "@/data/ui-logic";
import { ruleProse } from "@/lib/rule-prose";
import { absoluteUrl, siteConfig } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

/** Only the known ids are pages; every other id is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return rules.map((rule) => ({ id: rule.id }));
}

/** Ends a caption with one terminator: "First keystrokes land." never becomes "land..". */
const sentence = (text: string) => (/[.!?…]["”’)]?$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/*
 * The social card lives at /rules/<id>/opengraph-image, outside this route
 * group so its URL never changes. File-based images only attach to a page in
 * their own directory, so this page names it explicitly.
 */
const ogImage = (rule: (typeof rules)[number]) => ({
  url: `/rules/${rule.id}/opengraph-image`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${sentence(rule.title)} Do: ${sentence(rule.do)} Don’t: ${sentence(rule.dont)}`,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rule = rules.find((candidate) => candidate.id === id);
  if (!rule) return { title: "Rule not found" };

  const category = categories.find((candidate) => candidate.id === rule.category);
  const title = `${rule.title} · Axiom UI`;
  const url = absoluteUrl(`/rules/${rule.id}`);
  const image = ogImage(rule);

  return {
    title: { absolute: title },
    description: rule.desc,
    keywords: [...rule.tags, category?.name ?? "", "design system", "UI logic"],
    openGraph: {
      title,
      description: rule.desc,
      type: "article",
      url,
      siteName: "Axiom UI",
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: rule.desc,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

/**
 * CatalogApp in the layout draws the rule view. The page carries the rule's
 * structured data and its deep dive, built on the server, which the rule view
 * seats while this rule is shown. No other rule's prose reaches the page.
 */
export default async function RulePage({ params }: Props) {
  const { id } = await params;
  const rule = rules.find((candidate) => candidate.id === id);
  const prose = ruleProse(id);
  if (!rule || !prose) notFound();

  // The category the catalog files the rule under, as the rule header and the
  // social card's eyebrow name it: the three accessibility rules sit in System
  // and Color on the rail.
  const category = railCategory(railCategoryOf(rule));
  const url = absoluteUrl(`/rules/${rule.id}`);

  // A rule is an article about one decision. The person and website @ids
  // resolve against the graph in the root layout.
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: rule.title,
    description: rule.desc,
    about: { "@type": "Thing", name: category.name },
    keywords: rule.tags.join(", "),
    url,
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    author: { "@id": "https://www.nischal.fyi/#person" },
  };

  // The middle crumb is that category; its /#<category> anchor is the wall's
  // section for it.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "All rules", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(`/#${category.id}`) },
      { "@type": "ListItem", position: 3, name: rule.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Inspector ruleId={prose.id} prose={prose} />
    </>
  );
}
