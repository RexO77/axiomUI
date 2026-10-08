// design-system: strict
import { CircleCheck, CircleX } from "lucide-react";
import { VERDICT_LABEL, type Verdict } from "@/lib/verdict";
import { cn } from "@/lib/utils";

/**
 * The Do / Don’t label above every comparison pane: card, drawer, detail page
 * and showcase. One palette, one icon pair, one set of words (VERDICT_LABEL).
 *
 * The icon takes the brighter verdict tone and the word the darker ink tone,
 * so the label clears 4.5:1 on canvas, surface and the card's sunken panel in
 * both themes. `sm` is text-xs, the smallest size the catalog allows for
 * readable text (typo-11). `md` is text-sm.
 *
 * `className` is for layout only. Wrap it in a <dt> or a heading when the
 * label names a section; it renders a plain inline span.
 */

const SIZE = {
  sm: { text: "gap-1.5 text-xs", icon: "size-3.5" },
  md: { text: "gap-2 text-sm", icon: "size-4" },
} as const;

export function VerdictLabel({
  verdict,
  size = "sm",
  className,
}: {
  verdict: Verdict;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const isDo = verdict === "do";
  const Icon = isDo ? CircleCheck : CircleX;

  return (
    <span
      className={cn(
        "inline-flex items-center font-sans font-semibold",
        SIZE[size].text,
        isDo ? "text-do-ink" : "text-dont-ink",
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("shrink-0", SIZE[size].icon, isDo ? "text-do" : "text-dont")} />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
