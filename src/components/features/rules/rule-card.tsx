"use client";

import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { useHaptics } from "@/hooks/use-haptics";

interface RuleCardProps {
  rule: Rule;
  activeRuleId: string | null;
  onDeepDive: (ruleId: string) => void;
  style?: CSSProperties;
}

export function RuleCard({ rule, activeRuleId, onDeepDive, style }: RuleCardProps) {
  const { tapSuccess } = useHaptics();
  return (
    <article className="rule-card glass reveal rounded-2xl p-4 sm:p-5 md:p-6" style={style}>
      <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div className="min-w-0 max-w-2xl">
          <h4 className="text-lg font-semibold leading-snug text-neutral-900 sm:text-xl dark:text-neutral-100">{rule.title}</h4>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{rule.desc}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
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

      <div className="mt-5 grid gap-3 md:grid-cols-2 md:gap-4">
        <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 sm:p-4 dark:border-neutral-700/80 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
              Do this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="do" />
          </div>
          <code className="mt-2 block break-words rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200">
            {rule.do}
          </code>
        </section>

        <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 sm:p-4 dark:border-neutral-700/80 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2">
            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-200">
              Avoid this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="dont" />
          </div>
          <code className="mt-2 block break-words rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            {rule.dont}
          </code>
        </section>
      </div>

      <div className="soft-divider mt-5" />

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (rule.id !== activeRuleId) {
              tapSuccess();
              onDeepDive(rule.id);
            }
          }}
          className="pressable inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 sm:w-auto sm:py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-900"
        >
          Learn more
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
