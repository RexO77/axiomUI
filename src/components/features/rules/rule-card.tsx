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
    <article
      className="rule-card reveal w-full max-w-[920px] rounded-[28px] p-4 sm:p-5"
      style={style}
    >
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
        <ComparisonPanel rule={rule} variant="do" />
        <ComparisonPanel rule={rule} variant="dont" />
      </div>
    </article>
  );
}

function ComparisonPanel({ rule, variant }: { rule: Rule; variant: "do" | "dont" }) {
  const isDo = variant === "do";
  const Icon = isDo ? CheckCircle2 : XCircle;

  return (
    <section className="rule-card-panel flex min-w-0 flex-col rounded-[20px] bg-neutral-50/80 p-3 dark:bg-neutral-950/45">
      <div className="flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className={isDo
            ? "h-4 w-4 text-emerald-600 dark:text-emerald-300"
            : "h-4 w-4 text-rose-600 dark:text-rose-300"}
        />
        <span className={isDo
          ? "text-xs font-semibold text-emerald-700 dark:text-emerald-200"
          : "text-xs font-semibold text-rose-700 dark:text-rose-200"}
        >
          {isDo ? "Do this" : "Avoid this"}
        </span>
      </div>

      <div className="mt-3">
        <RulePreview rule={rule} variant={variant} />
      </div>

      <div className="mt-auto pt-2">
        <code className="rule-card-code block min-h-9 break-words rounded-[8px] bg-white/90 px-3 py-2 text-xs leading-5 text-neutral-700 dark:bg-neutral-950/90 dark:text-neutral-200">
          {isDo ? rule.do : rule.dont}
        </code>
      </div>
    </section>
  );
}
