// design-system: strict
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";

import { buildDeepDive } from "@/data/deep-dive-builder";
import { rules, categories, getAdjacentRules, getRelatedRules } from "@/data/ui-logic";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamicParams = false;

// Breadcrumb links keep their line box but take an at-least-44px hit area
// (sys-3) from a pseudo-element, so the focus outline still hugs the text.
const CRUMB = "relative -mx-1 rounded-full px-1 after:absolute after:inset-x-0 after:-inset-y-3.5";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
    return rules.map((rule) => ({
        id: rule.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const rule = rules.find((r) => r.id === id);

    if (!rule) {
        return {
            title: "Rule not found",
        };
    }

    const category = categories.find((c) => c.id === rule.category);

    return {
        title: { absolute: `${rule.title} | Axiom UI` },
        description: rule.desc,
        keywords: [...rule.tags, category?.name ?? "", "design system", "UI logic"],
        openGraph: {
            title: `${rule.title} | Axiom UI`,
            description: rule.desc,
            type: "article",
            url: absoluteUrl(`/rules/${rule.id}`),
            siteName: "Axiom UI",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: `${rule.title} | Axiom UI`,
            description: rule.desc,
        },
        alternates: {
            canonical: absoluteUrl(`/rules/${rule.id}`),
        },
    };
}

export default async function RulePage({ params }: Props) {
    const { id } = await params;
    const rule = rules.find((r) => r.id === id);

    if (!rule) {
        notFound();
    }

    const category = categories.find((c) => c.id === rule.category);
    const deepDive = buildDeepDive(rule);
    const whyItMatters = findTextSection(deepDive, "Why it matters");
    const riskWhenIgnored = findTextSection(deepDive, "Risk when ignored");
    const implementationNotes = findListSection(deepDive, "Implementation notes");
    const reviewPrompts = findListSection(deepDive, "Design review prompts");
    const { prev, next } = getAdjacentRules(rule);
    // Prev/next already sit at the foot of the page, so Related spends its
    // three slots on rules the reader can't reach one click away.
    const related = getRelatedRules(rule, 6)
        .filter((r) => r.id !== prev?.id && r.id !== next?.id)
        .slice(0, 3);
    const showcase = hasShowcase(rule.id);

    // A rule is an article about one decision, not a two-step recipe. The
    // person and website @ids resolve against the graph in the root layout.
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: rule.title,
        description: rule.desc,
        about: { "@type": "Thing", name: category?.name ?? "User interface design" },
        keywords: rule.tags.join(", "),
        url: absoluteUrl(`/rules/${rule.id}`),
        isPartOf: { "@id": `${siteConfig.origin}/#website` },
        author: { "@id": "https://www.nischal.fyi/#person" },
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "All rules", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: category?.name ?? "Rules", item: absoluteUrl(`/#${rule.category}`) },
            { "@type": "ListItem", position: 3, name: rule.title, item: absoluteUrl(`/rules/${rule.id}`) },
        ],
    };

    return (
        <div className="min-h-screen bg-canvas">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* One way home: the lockup. The breadcrumb below names the
                category, so the page never prints it twice. */}
            <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
                    <Link
                        href="/"
                        aria-label="Axiom UI, all rules"
                        className="-ml-1.5 flex min-h-11 items-center gap-2 rounded-full pr-2 pl-1.5"
                    >
                        <span className="flex size-8 items-center justify-center rounded-full bg-inverse text-on-inverse">
                            <AxiomLogo className="size-4" />
                        </span>
                        <span className="text-sm font-semibold tracking-tight text-ink">Axiom UI</span>
                    </Link>
                    <ThemeToggle className="-mr-2 ml-auto" />
                </div>
            </header>

            <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-8 pb-12 outline-none sm:pt-12">
                {/* The breadcrumb doubles as the eyebrow. */}
                <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
                    <Link href="/" className={`${CRUMB} hover:text-ink`}>
                        All rules
                    </Link>
                    <span aria-hidden="true" className="mx-2 text-ink-faint">/</span>
                    <Link
                        href={`/#${rule.category}`}
                        className={`${CRUMB} text-ink-secondary hover:text-ink`}
                    >
                        {category?.name}
                    </Link>
                </nav>

                <article>
                    <header className="mb-12">
                        <h1 className="mt-3 text-4xl font-semibold text-ink">
                            {rule.title}
                        </h1>
                        <p className="mt-4 max-w-[32rem] text-lg leading-7 text-ink-secondary">
                            {rule.desc}
                        </p>

                        {/* Tags + Cite: one muted Tag glyph labels the whole
                            group; repeating it per pill reads as noise. Tags are
                            32px, the height of the Copy pill beside them. */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Tag aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
                            <span className="sr-only">Tags</span>
                            {rule.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex h-8 items-center rounded-full border border-line bg-fill px-3 text-xs font-medium whitespace-nowrap text-ink-secondary"
                                >
                                    {tag}
                                </span>
                            ))}
                            <CopyRuleButton rule={rule} className="ml-auto" />
                        </div>
                    </header>

                    {showcase ? (
                        // The showcase panes already carry the Do/Don't labels and
                        // the live demo, so the shorthand appears once beneath
                        // them instead of as two more cards.
                        <div className="mb-12 rounded-card border border-line bg-surface p-4 sm:p-6">
                            <MotionShowcase ruleId={rule.id} />
                            <dl className="mt-6 grid gap-x-3 gap-y-4 pt-5 sm:grid-cols-2">
                                <div className="min-w-0">
                                    <dt><VerdictLabel verdict="do" /></dt>
                                    <dd className="mt-1.5 font-mono text-sm leading-6 text-ink-muted">{rule.do}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt><VerdictLabel verdict="dont" /></dt>
                                    <dd className="mt-1.5 font-mono text-sm leading-6 text-ink-muted">{rule.dont}</dd>
                                </div>
                            </dl>
                        </div>
                    ) : (
                        // The preview frame is the only frame. min-w-0 lets a
                        // preview that refuses to wrap (typo-10) clip inside its
                        // own pane instead of widening the page.
                        <div className="mb-12 grid min-w-0 gap-6 md:grid-cols-2">
                            <section aria-labelledby="verdict-do" className="min-w-0">
                                <h2 id="verdict-do"><VerdictLabel verdict="do" /></h2>
                                <div className="mt-3">
                                    <RulePreview rule={rule} variant="do" size="lg" />
                                </div>
                                <p className="mt-3 font-mono text-sm leading-6 text-ink-muted">{rule.do}</p>
                            </section>
                            <section aria-labelledby="verdict-dont" className="min-w-0">
                                <h2 id="verdict-dont"><VerdictLabel verdict="dont" /></h2>
                                <div className="mt-3">
                                    <RulePreview rule={rule} variant="dont" size="lg" />
                                </div>
                                <p className="mt-3 font-mono text-sm leading-6 text-ink-muted">{rule.dont}</p>
                            </section>
                        </div>
                    )}

                    {/* Summary and the Do/Don't shorthand are omitted here
                        because the page header and comparison show them. The
                        measure is set in rem, not ch: Manrope's zero is wide,
                        so 65ch ran ~90 characters a line. 32rem holds body
                        prose at 75 or fewer, and the lead shares the edge. */}
                    <div className="max-w-[32rem] space-y-10">
                        {implementationNotes.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-ink">
                                    How to apply it
                                </h2>
                                <NumberedList items={implementationNotes} />
                            </section>
                        )}

                        {whyItMatters && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-ink">
                                    Why it works
                                </h2>
                                <p className="leading-relaxed text-ink-secondary">{whyItMatters}</p>
                            </section>
                        )}

                        {riskWhenIgnored && (
                            <section>
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-ink">
                                    <AlertTriangle aria-hidden="true" className="size-5 text-amber-600 dark:text-amber-400" />
                                    What breaks
                                </h2>
                                <p className="leading-relaxed text-ink-secondary">{riskWhenIgnored}</p>
                            </section>
                        )}

                        {reviewPrompts.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-ink">
                                    Review questions
                                </h2>
                                <NumberedList items={reviewPrompts} />
                            </section>
                        )}
                    </div>
                </article>

                {related.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-4 text-xl font-semibold text-ink">Related rules</h2>
                        <ul className="grid gap-3 sm:grid-cols-3">
                            {related.map((r) => (
                                <li key={r.id}>
                                    <Link
                                        href={`/rules/${r.id}`}
                                        className="block h-full rounded-field border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-fill/50"
                                    >
                                        <p className="text-sm font-semibold text-ink">{r.title}</p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">{r.desc}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(prev || next) && (
                    <nav aria-label="Rule navigation" className="mt-16 grid grid-cols-2 gap-4 pt-6">
                        {prev ? (
                            <Link
                                href={`/rules/${prev.id}`}
                                rel="prev"
                                className="group -mx-2 flex min-h-11 min-w-0 flex-col justify-center gap-1 justify-self-start rounded-frame px-2 py-2"
                            >
                                <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                                    <ArrowLeft aria-hidden="true" className="size-3.5 shrink-0" />
                                    Previous
                                </span>
                                <span className="line-clamp-2 text-sm font-medium text-ink-secondary transition-colors group-hover:text-ink">
                                    {prev.title}
                                </span>
                            </Link>
                        ) : null}
                        {next ? (
                            <Link
                                href={`/rules/${next.id}`}
                                rel="next"
                                className="group col-start-2 -mx-2 flex min-h-11 min-w-0 flex-col items-end justify-center gap-1 justify-self-end rounded-frame px-2 py-2 text-right"
                            >
                                <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                                    Next
                                    <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
                                </span>
                                <span className="line-clamp-2 text-sm font-medium text-ink-secondary transition-colors group-hover:text-ink">
                                    {next.title}
                                </span>
                            </Link>
                        ) : null}
                    </nav>
                )}
            </main>
        </div>
    );
}

/* Numerals share the first line's baseline with their item, so a 14px
   numeral beside 16px text sits on the line rather than floating above it. */
function NumberedList({ items }: { items: string[] }) {
    return (
        <ol className="space-y-4">
            {items.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0 text-right text-sm tabular-nums text-ink-muted">
                        {index + 1}
                    </span>
                    <p className="leading-relaxed text-ink-secondary">{item}</p>
                </li>
            ))}
        </ol>
    );
}
