// design-system: strict
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Check, Copy } from "lucide-react";
import type { Rule } from "@/data/ui-logic";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import { ruleToText } from "@/lib/rule-text";

type CopyState = "idle" | "copied" | "error";

const RESET_DELAY_MS = 1800;

async function copyText(text: string): Promise<boolean> {
  // Prefer the async Clipboard API, which only exists in secure contexts (https/localhost).
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path below.
    }
  }

  // Keep focus on the control when the legacy clipboard path borrows it.
  const previousFocus = document.activeElement;
  const textarea = document.createElement("textarea");
  try {
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    return ok;
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  }
}

function buildText(rule: Rule): string {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : absoluteUrl("/").replace(/\/$/, "");

  return ruleToText(rule, origin);
}

interface CopyRuleButtonProps {
  rule: Rule;
  variant?: "pill" | "icon";
  className?: string;
}

export function CopyRuleButton({ rule, variant = "pill", className }: CopyRuleButtonProps) {
  const { tapSuccess, tapError } = useHaptics();
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setState("idle"), RESET_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  async function handleCopy() {
    const ok = await copyText(buildText(rule));
    if (ok) {
      tapSuccess();
      setState("copied");
    } else {
      tapError();
      setState("error");
    }
  }

  const label = state === "copied" ? "Copied" : state === "error" ? "Retry" : "Copy";
  // The icon-only variant lives in the drawer header, already scoped to one
  // rule; the pill repeats on every card in a 105-item grid, where only the
  // title tells a screen-reader user which rule they are about to copy.
  const target = variant === "icon" ? "rule" : rule.title;
  const ariaLabel =
    state === "copied"
      ? `Copied ${target} to clipboard`
      : state === "error"
        ? `Retry copying ${target}`
        : `Copy ${target} to clipboard`;
  // A changed accessible name is not reliably announced, so the transient
  // result also lands in a polite live region. Empty while idle, so the next
  // copy is a content change and gets announced again.
  const announcement =
    state === "copied"
      ? "Copied to clipboard"
      : state === "error"
        ? "Copy failed, try again"
        : "";
  const isCopied = state === "copied";
  const isError = state === "error";

  if (variant === "icon") {
    return (
      <>
        <IconButton
          size="md"
          label={ariaLabel}
          title="Copy rule"
          onClick={() => void handleCopy()}
          className={className}
        >
          <CopyGlyph isCopied={isCopied} isError={isError} className="size-[18px]" />
        </IconButton>
        <CopyAnnouncer message={announcement} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        aria-label={ariaLabel}
        onClick={() => void handleCopy()}
        className={className}
      >
        <FixedWidth widest="Copied">
          <CopyGlyph isCopied={isCopied} isError={isError} className="size-3.5" />
          {label}
        </FixedWidth>
      </Button>
      <CopyAnnouncer message={announcement} />
    </>
  );
}

// Holds the pill at the width of its widest state, so the Learn more pill
// beside it never shifts when "Copy" becomes "Copied". An invisible copy of
// the widest word (a pseudo-element, so it stays out of the page text, with
// room for the 14px glyph and 6px gap) shares one grid cell with the live
// glyph and label, which are centred as a unit: the slack splits evenly
// between the two ends and the glyph-to-word gap stays 6px.
function FixedWidth({ widest, children }: { widest: string; children: ReactNode }) {
  return (
    <span
      data-widest={widest}
      className="grid justify-items-center before:invisible before:col-start-1 before:row-start-1 before:pl-5 before:content-[attr(data-widest)]"
    >
      <span className="col-start-1 row-start-1 inline-flex items-center gap-1.5">{children}</span>
    </span>
  );
}

// Sibling rather than child: a live region inside the button would join its
// accessible name. `sr-only` is absolutely positioned, so it is not a flex
// item and never affects the gap of the row it sits in.
function CopyAnnouncer({ message }: { message: string }) {
  return (
    <span role="status" className="sr-only">
      {message}
    </span>
  );
}

// The check grows in from a quarter-size blur while the copy glyph shrinks
// into one. No will-change: it would hold two compositor layers per card for
// a swap that happens once in a while.
const GLYPH_MOTION =
  "flex items-center justify-center transition-[opacity,filter,scale] duration-medium ease-out-strong motion-reduce:transition-none";

function CopyGlyph({
  isCopied,
  isError,
  className,
}: {
  isCopied: boolean;
  isError: boolean;
  className: string;
}) {
  // The base layer carries the resting icon and swaps to an alert on failure,
  // so success and error are each distinguished by icon — not label text alone.
  const BaseIcon = isError ? AlertCircle : Copy;
  return (
    <span className={cn("relative shrink-0", className)} aria-hidden="true">
      <span
        className={cn(
          GLYPH_MOTION,
          "absolute inset-0",
          isCopied ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
        )}
      >
        <Check className={className} />
      </span>
      <span
        className={cn(
          GLYPH_MOTION,
          isCopied ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0",
          isError && "text-dont"
        )}
      >
        <BaseIcon className={className} />
      </span>
    </span>
  );
}
