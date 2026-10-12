// design-system: strict
import {
  Accessibility,
  Activity,
  BoxSelect,
  Cpu,
  Layers,
  LayoutGrid,
  Palette,
  TextCursorInput,
  Type,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  typography: Type,
  layout: LayoutGrid,
  color: Palette,
  components: BoxSelect,
  forms: TextCursorInput,
  system: Cpu,
  motion: Activity,
  accessibility: Accessibility,
};

const categoryIconColors: Record<string, string> = {
  typography: "text-blue-600 dark:text-blue-400",
  layout: "text-amber-600 dark:text-amber-400",
  color: "text-rose-600 dark:text-rose-400",
  components: "text-violet-600 dark:text-violet-400",
  forms: "text-cyan-600 dark:text-cyan-400",
  system: "text-emerald-600 dark:text-emerald-400",
  motion: "text-fuchsia-600 dark:text-fuchsia-400",
  accessibility: "text-orange-600 dark:text-orange-400",
};

/**
 * `className` replaces the default 18px size rather than adding to it: cn()
 * only concatenates, so a size passed next to the default would lose or win
 * by stylesheet order. A caller that passes a class sets the size itself.
 */
export function CategoryIcon({
  categoryId,
  className = "size-[18px]",
}: {
  categoryId: string;
  className?: string;
}) {
  const Icon = categoryIcons[categoryId] ?? Layers;

  return (
    <Icon
      aria-hidden="true"
      className={cn(
        categoryIconColors[categoryId] ?? "text-ink-muted",
        className
      )}
      strokeWidth={1.8}
    />
  );
}
