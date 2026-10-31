// design-system: strict
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one icon-only control. The glyph's size and stroke come from the size,
 * whatever the icon was given, so neighbouring controls match.
 *
 * - `xs` is a 28px control with an invisible 44px hit area (sys-3), for an
 *   action nested inside a field. Its 16px, 2-stroke glyph matches the field's
 *   own glyph beside it, and its focus ring hugs it, since the field leaves
 *   only 6-8px of room around it.
 * - `sm` is a 36px circle with an invisible 44px hit area, for dense desktop
 *   chrome. `md` is a full 44px circle, for touch-first surfaces. Both draw
 *   an 18px glyph with a 1.8 stroke.
 * - `ghost` shows a fill only on hover. `outline` sits on its own surface with
 *   a hairline, for controls that float over content.
 *
 * `pressable` owns the transitions. Don't add transition-* or duration-*.
 * `className` is for layout only (margins, positioning, visibility), never for
 * colour, size or shape: those belong to the recipe, so every icon button on
 * the site stays the same object. The one shape a caller may set is `radius`,
 * and only to nest the control concentrically inside another shape (comp-3):
 * the parent's radius minus the inset, e.g.
 * `rounded-[calc(var(--radius-field)-6px)]`.
 *
 * A string `label` becomes the aria-label. Pass a node instead when the name
 * has to switch with CSS (the theme toggle names the theme it switches to);
 * it is rendered visually hidden inside the control.
 */

type IconButtonSize = "xs" | "sm" | "md";
type IconButtonVariant = "ghost" | "outline";
type IconButtonRadius = "rounded-full" | `rounded-[${string}]`;

const BASE =
  "pressable inline-flex shrink-0 items-center justify-center text-ink-muted hover:bg-fill hover:text-ink disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const SIZE: Record<IconButtonSize, string> = {
  xs: "relative size-7 after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-offset-0 [&_svg]:size-4 [&_svg]:stroke-2",
  sm: "relative size-9 after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 [&_svg]:size-[18px] [&_svg]:stroke-[1.8]",
  md: "size-11 [&_svg]:size-[18px] [&_svg]:stroke-[1.8]",
};

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: "",
  outline: "border border-line bg-surface",
};

type OwnProps = {
  label: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  radius?: IconButtonRadius;
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
  radius = "rounded-full",
  className,
  children,
  ...rest
}: IconButtonProps) {
  const classes = cn(BASE, SIZE[size], VARIANT[variant], radius, className);
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
