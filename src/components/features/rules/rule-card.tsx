"use client";

import { CheckCircle2, Expand, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";

interface RuleCardProps {
  rule: Rule;
  activeRuleId: string | null;
  onDeepDive: (ruleId: string) => void;
  style?: CSSProperties;
}

export function RuleCard({ rule, activeRuleId, onDeepDive, style }: RuleCardProps) {
  return (
    <article className="rule-card glass reveal rounded-2xl p-6 md:p-7" style={style}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            {rule.id}
          </p>
          <h4 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{rule.title}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {rule.tags.map((tag) => (
            <span
              key={`${rule.id}-${tag}`}
              className="chip rounded-full px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{rule.desc}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
              Do this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="do" />
          </div>
          <code className="mt-2 block rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            {rule.do}
          </code>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
          <div className="flex items-center gap-2">
            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-200">
              Avoid this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="dont" />
          </div>
          <code className="mt-2 block rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            {rule.dont}
          </code>
        </section>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-700">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
          Deep Dive
        </span>
        <button
          type="button"
          onClick={() => {
            if (rule.id !== activeRuleId) {
              onDeepDive(rule.id);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500"
        >
          <Expand aria-hidden="true" className="h-4 w-4" />
          More About This
        </button>
      </div>
    </article>
  );
}
