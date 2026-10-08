// design-system: strict
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one text button, as a pill.
 *
 * - `primary` is the inverse pill, one per view.
 * - `secondary` is a hairline pill that stays transparent, so it reads as
 *   part of whatever surface it sits on (card, drawer, page) in both themes.
 * - `ghost` is text only, for tertiary actions.
 *
 * `sm` is 32px tall with an invisible 44px hit area (sys-3), for actions
 * inside cards. `md` is 44px on touch screens and 40px from `sm` up.
 *
 * `pressable` owns the transitions. Don't add transition-* or duration-*.
 * `className` is for layout only (margins, `ml-auto`, width, visibility),
 * never colour, size or shape: a recipe a caller has to override is a
 * recipe that will drift. Renders a Next.js `Link` when `href` is set.
 */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const BASE =
  "pressable relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-inverse text-on-inverse hover:opacity-90",
  secondary: "border border-line-strong text-ink-secondary hover:bg-fill hover:text-ink",
  ghost: "text-ink-muted hover:text-ink",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2",
  md: "min-h-11 px-4 text-xs sm:min-h-10",
};

type OwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonRest = Omit<ComponentProps<"button">, keyof OwnProps> & { href?: undefined };
type LinkRest = Omit<ComponentProps<"a">, keyof OwnProps | "href"> & {
  href: string;
  prefetch?: boolean;
};

export type ButtonProps = OwnProps & (ButtonRest | LinkRest);

function isLink(rest: ButtonRest | LinkRest): rest is LinkRest {
  return typeof rest.href === "string";
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(BASE, VARIANT[variant], SIZE[size], className);

  if (isLink(rest)) {
    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
