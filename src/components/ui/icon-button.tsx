// design-system: strict
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one icon-only control. Every glyph renders at 18px with a 1.8 stroke,
 * whatever size the icon was given, so neighbouring controls match.
 *
 * - `sm` is a 36px circle with an invisible 44px hit area (sys-3), for dense
 *   desktop chrome. `md` is a full 44px circle, for touch-first surfaces.
 * - `ghost` shows a fill only on hover. `outline` sits on its own surface with
 *   a hairline, for controls that float over content.
 *
 * `pressable` owns the transitions. Don't add transition-* or duration-*.
 * `className` is for layout only (margins, positioning, visibility), never for
 * colour, size or shape: those belong to the recipe, so every icon button on
 * the site stays the same object.
 *
 * A string `label` becomes the aria-label. Pass a node instead when the name
 * has to switch with CSS (the theme toggle names the theme it switches to);
 * it is rendered visually hidden inside the control.
 */

type IconButtonSize = "sm" | "md";
type IconButtonVariant = "ghost" | "outline";

const BASE =
  "pressable inline-flex shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-fill hover:text-ink disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.8]";

const SIZE: Record<IconButtonSize, string> = {
  sm: "relative size-9 after:absolute after:-inset-1",
  md: "size-11",
};

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: "",
  outline: "border border-line bg-surface",
};

type OwnProps = {
  label: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonRest = Omit<ComponentProps<"button">, keyof OwnProps | "aria-label"> & {
  href?: undefined;
};
type LinkRest = Omit<ComponentProps<"a">, keyof OwnProps | "aria-label" | "href"> & {
  href: string;
  prefetch?: boolean;
};

export type IconButtonProps = OwnProps & (ButtonRest | LinkRest);

function isLink(rest: ButtonRest | LinkRest): rest is LinkRest {
  return typeof rest.href === "string";
}

export function IconButton({
  label,
  size = "sm",
  variant = "ghost",
  className,
  children,
  ...rest
}: IconButtonProps) {
  const classes = cn(BASE, SIZE[size], VARIANT[variant], className);
  const named = typeof label === "string";
  const content = (
    <>
      {children}
      {named ? null : <span className="sr-only">{label}</span>}
    </>
  );

  if (isLink(rest)) {
    return (
      <Link {...rest} aria-label={named ? label : undefined} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" {...rest} aria-label={named ? label : undefined} className={classes}>
      {content}
    </button>
  );
}
