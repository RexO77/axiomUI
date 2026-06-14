"use client";

import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
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
    <article className="rule-card glass reveal w-full max-w-[920px] rounded-2xl p-4 sm:p-5" style={style}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-4">
        <div className="min-w-0">
          <h4 className="text-lg font-semibold leading-snug text-neutral-900 sm:text-xl dark:text-neutral-100">{rule.title}</h4>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{rule.desc}</p>
        </div>
        <div className="flex items-start gap-2 md:justify-end">
          <CopyRuleButton rule={rule} />
          <button
            type="button"
            aria-label={`Learn more about ${rule.title}`}
            onClick={() => {
              if (rule.id !== activeRuleId) {
                tapSuccess();
                onDeepDive(rule.id);
              }
            }}
            className="pressable relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 after:absolute after:inset-x-0 after:-inset-y-1.5 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            Learn more
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-700/80 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
              Do this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="do" animate />
          </div>
          <code className="mt-2 block break-words rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200">
            {rule.do}
          </code>
        </section>

        <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-700/80 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2">
            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-200">
              Avoid this
            </span>
          </div>
          <div className="mt-3">
            <RulePreview rule={rule} variant="dont" animate />
          </div>
          <code className="mt-2 block break-words rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            {rule.dont}
          </code>
        </section>
      </div>
    </article>
  );
}
