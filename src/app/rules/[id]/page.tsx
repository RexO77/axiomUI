import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Tag } from "lucide-react";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";

import { buildDeepDive } from "@/data/deep-dive-builder";
import { rules, categories, getAdjacentRules, getRelatedRules } from "@/data/ui-logic";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { absoluteUrl } from "@/lib/site";
import { VERDICT_LABEL } from "@/lib/verdict";

export const dynamicParams = false;

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
        title: rule.title,
        description: rule.desc,
        keywords: [...rule.tags, category?.name ?? "", "design system", "UI logic"],
        openGraph: {
            title: `${rule.title} | Axiom`,
            description: rule.desc,
            type: "article",
            url: absoluteUrl(`/rules/${rule.id}`),
        },
        twitter: {
            card: "summary_large_image",
            title: `${rule.title} | Axiom`,
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
    const related = getRelatedRules(rule);

    // Generate JSON-LD for this specific rule
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: rule.title,
        description: rule.desc,
        step: [
            {
                "@type": "HowToStep",
                name: VERDICT_LABEL.do,
                text: rule.do,
            },
            {
                "@type": "HowToStep",
                name: VERDICT_LABEL.dont,
                text: rule.dont,
            },
        ],
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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
                    <Link
                        href="/"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                        aria-label="Back to all rules"
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                            <AxiomLogo className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Axiom
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-3xl px-4 py-12">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                    <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                        All rules
                    </Link>
                    <span className="mx-2">/</span>
                    <Link
                        href={`/#${rule.category}`}
                        className="text-neutral-900 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                    >
                        {category?.name}
                    </Link>
                </nav>

                {/* Title Section */}
                <article>
                    <header className="mb-12">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            {category?.name}
                        </p>
                        {/* Eyebrow couples tightly to the title (mt-3); the
                            description and tags step away in growing increments. */}
                        <h1 className="mt-3 text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {rule.title}
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-300">
                            {rule.desc}
                        </p>

                        {/* Tags + Cite: one muted Tag glyph labels the whole
                            group; repeating it per pill reads as noise. */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Tag aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                            <span className="sr-only">Tags</span>
                            {rule.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    {tag}
                                </span>
                            ))}
                            <CopyRuleButton rule={rule} className="ml-auto" />
                        </div>
                    </header>

                    {/* Motion showcase (interactive do/don't comparison) */}
                    {hasShowcase(rule.id) ? (
                        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <MotionShowcase ruleId={rule.id} />
                        </div>
                    ) : null}

                    {/* Do / Don't cards: same voice and same two words as the
                        drawer's comparison articles — 4px circle icons, xs
                        semibold emerald/rose labels, muted mono shorthand. */}
                    <div className="mb-12 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                    {VERDICT_LABEL.do}
                                </span>
                            </div>
                            {!hasShowcase(rule.id) && (
                                <div className="mt-3">
                                    <RulePreview rule={rule} variant="do" size="lg" />
                                </div>
                            )}
                            <p className="mt-3 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                {rule.do}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-2">
                                <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                                <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                                    {VERDICT_LABEL.dont}
                                </span>
                            </div>
                            {!hasShowcase(rule.id) && (
                                <div className="mt-3">
                                    <RulePreview rule={rule} variant="dont" size="lg" />
                                </div>
                            )}
                            <p className="mt-3 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                {rule.dont}
                            </p>
                        </div>
                    </div>

                    {/* Summary and the Do/Don't shorthand are omitted here
                        because the page header and comparison cards show them. */}
                    <div className="space-y-10">
                        {implementationNotes.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    How to apply it
                                </h2>
                                <ol className="space-y-4">
                                    {implementationNotes.map((item, index) => (
                                        <li key={`${item}-${index}`} className="flex gap-3">
                                            <span className="mt-0.5 w-5 shrink-0 text-right text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
                                                {index + 1}
                                            </span>
                                            <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{item}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                        {whyItMatters && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    Why it works
                                </h2>
                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{whyItMatters}</p>
                            </section>
                        )}

                        {riskWhenIgnored && (
                            <section>
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    <AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    What breaks
                                </h2>
                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{riskWhenIgnored}</p>
                            </section>
                        )}

                        {reviewPrompts.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    Review questions
                                </h2>
                                <ol className="space-y-4">
                                    {reviewPrompts.map((item, index) => (
                                        <li key={`${item}-${index}`} className="flex gap-3">
                                            <span className="mt-0.5 w-5 shrink-0 text-right text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
                                                {index + 1}
                                            </span>
                                            <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{item}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </div>
                </article>

                {/* Related rules */}
                {related.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">Related rules</h2>
                        <ul className="grid gap-3 sm:grid-cols-3">
                            {related.map((r) => (
                                <li key={r.id}>
                                    <Link
                                        href={`/rules/${r.id}`}
                                        className="block h-full rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                                    >
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{r.title}</p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{r.desc}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Navigation */}
                <nav aria-label="Rule navigation" className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-4">
                        {prev ? (
                            <Link
                                href={`/rules/${prev.id}`}
                                rel="prev"
                                aria-label={`Previous rule: ${prev.title}`}
                                className="group inline-flex min-h-11 max-w-[45%] items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
                                <span className="truncate">{prev.title}</span>
                            </Link>
                        ) : <span />}
                        {next ? (
                            <Link
                                href={`/rules/${next.id}`}
                                rel="next"
                                aria-label={`Next rule: ${next.title}`}
                                className="group inline-flex min-h-11 max-w-[45%] items-center gap-2 text-right text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                <span className="truncate">{next.title}</span>
                                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                            </Link>
                        ) : <span />}
                    </div>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Back to all rules
                        </Link>
                    </div>
                </nav>
            </main>
        </div>
    );
}
