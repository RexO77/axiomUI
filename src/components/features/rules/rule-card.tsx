// design-system: strict
"use client";

import { PanelRightOpen } from "lucide-react";
import { memo } from "react";
import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { hasShowcase } from "@/components/features/rules/demos/registry";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import { Button } from "@/components/ui/button";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { useHaptics } from "@/hooks/use-haptics";

interface RuleCardProps {
  rule: Rule;
  isActive: boolean;
  onDeepDive: (ruleId: string) => void;
}

/**
 * Concentric by construction (comp-3): card 28 = 8 padding + well 20, and
 * well 20 = 10 padding + preview frame 10.
 * The title, the verdict labels and the captions share one left edge, 20px
 * in from the card (8 + 12 for the title, 8 + 10 + 2 inside the panels).
 *
 * Layout follows the card's own width, not the viewport's (@container): the
 * same 768px screen can hold a 424px card beside the sidebar or a 720px one
 * without it, and the previews need ~300px each to read.
 */
function RuleCardComponent({ rule, isActive, onDeepDive }: RuleCardProps) {
  const { tapSuccess } = useHaptics();
  return (
    <article
      id={`rule-${rule.id}`}
      data-active={isActive}
      className="rule-card @container w-full max-w-[920px] scroll-my-6 rounded-card p-2 data-[active=true]:outline-1 data-[active=true]:-outline-offset-1 data-[active=true]:outline-ink/25"
    >
      <div className="grid gap-3 px-3 pt-3 pb-1 @[600px]:grid-cols-[minmax(0,1fr)_auto] @[600px]:items-start @[600px]:gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug text-ink sm:text-xl">{rule.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">{rule.desc}</p>
        </div>
        <div className="flex items-start gap-2 @[600px]:justify-end">
          <CopyRuleButton rule={rule} />
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Learn more about ${rule.title}`}
            onClick={() => {
              if (!isActive) {
                onDeepDive(rule.id);
                window.setTimeout(tapSuccess, 0);
              }
            }}
          >
            Learn more
            <PanelRightOpen aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 @[600px]:grid-cols-2">
        <ComparisonPanel rule={rule} variant="do" />
        <ComparisonPanel rule={rule} variant="dont" />
      </div>
    </article>
  );
}

export const RuleCard = memo(RuleCardComponent);

function ComparisonPanel({ rule, variant }: { rule: Rule; variant: "do" | "dont" }) {
  const isDo = variant === "do";
  // Motion showcases carry their own caption (richer than rule.do/dont);
  // static previews get the rule's shorthand as a single flat footer line.
  const showFooter = !hasShowcase(rule.id);

  return (
    <section className="rule-card-panel flex min-w-0 flex-col rounded-well bg-sunken p-2.5">
      {/* The words and palette come from VerdictLabel, so card, drawer,
          detail page and showcase cannot drift. */}
      <VerdictLabel verdict={variant} size="sm" className="px-0.5" />

      {/* The preview IS the card — full deep-dive detail, first impression. */}
      <div className="mt-2 flex-1">
        <RulePreview rule={rule} variant={variant} size="lg" />
      </div>

      {showFooter ? (
        <p className="mt-2.5 break-words px-0.5 font-mono text-xs leading-5 text-ink-muted">
          {isDo ? rule.do : rule.dont}
        </p>
      ) : null}
    </section>
  );
}
