import {
  Activity,
  BoxSelect,
  Cpu,
  Eye,
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
  accessibility: Eye,
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

export function CategoryIcon({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const Icon = categoryIcons[categoryId] ?? Layers;

  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "h-[18px] w-[18px]",
        categoryIconColors[categoryId] ?? "text-neutral-500",
        className
      )}
      strokeWidth={1.8}
    />
  );
}
