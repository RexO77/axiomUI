import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X, Tag } from "lucide-react";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";

import { rules, categories, buildDeepDive, getAdjacentRules, getRelatedRules } from "@/data/ui-logic";
import { absoluteUrl } from "@/lib/site";

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
            title: "Rule Not Found",
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
            card: "summary",
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
                name: "Do",
                text: rule.do,
            },
            {
                "@type": "HowToStep",
                name: "Don't",
                text: rule.dont,
            },
        ],
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "All Rules", item: absoluteUrl("/") },
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
                        <ArrowLeft className="h-4 w-4" />
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
                <nav className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                    <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                        All Rules
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
                        <h1 className="mt-4 text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {rule.title}
                        </h1>
                        <p className="prose-justify mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                            {rule.desc}
                        </p>

                        {/* Tags + Cite */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            {rule.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    <Tag className="h-3 w-3" />
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

                    {/* Do / Don't Cards */}
                    <div className="mb-12 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="badge-do flex h-6 w-6 items-center justify-center rounded-full">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-emerald-700 dark:text-teal-300">
                                    Do
                                </span>
                            </div>
                            {!hasShowcase(rule.id) && (
                                <div className="mb-3">
                                    <RulePreview rule={rule} variant="do" size="lg" />
                                </div>
                            )}
                            <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                                {rule.do}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="badge-dont flex h-6 w-6 items-center justify-center rounded-full">
                                    <X className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                                    Don&apos;t
                                </span>
                            </div>
                            {!hasShowcase(rule.id) && (
                                <div className="mb-3">
                                    <RulePreview rule={rule} variant="dont" size="lg" />
                                </div>
                            )}
                            <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                                {rule.dont}
                            </p>
                        </div>
                    </div>

                    {/* Deep Dive Sections */}
                    <div className="space-y-8">
                        {deepDive.map((section, idx) => (
                            <section key={idx}>
                                {section.title && (
                                    <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                        {section.title}
                                    </h2>
                                )}
                                {section.type === "text" && (
                                    <p className="prose-justify text-neutral-600 dark:text-neutral-300">
                                        {section.content}
                                    </p>
                                )}
                                {section.type === "list" && (
                                    <ul className="list-inside list-disc space-y-2 text-neutral-600 dark:text-neutral-300">
                                        {section.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                                {section.type === "code" && (
                                    <pre className="rounded-xl border border-neutral-200 bg-neutral-100 p-4 font-mono text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                                        {section.code}
                                    </pre>
                                )}
                            </section>
                        ))}
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
                <nav className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-4">
                        {prev ? (
                            <Link
                                href={`/rules/${prev.id}`}
                                rel="prev"
                                className="group inline-flex max-w-[45%] items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                <ArrowLeft className="h-4 w-4 shrink-0" />
                                <span className="truncate">{prev.title}</span>
                            </Link>
                        ) : <span />}
                        {next ? (
                            <Link
                                href={`/rules/${next.id}`}
                                rel="next"
                                className="group inline-flex max-w-[45%] items-center gap-2 text-right text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            >
                                <span className="truncate">{next.title}</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                            </Link>
                        ) : <span />}
                    </div>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to all rules
                        </Link>
                    </div>
                </nav>
            </main>
        </div>
    );
}
