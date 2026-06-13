"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { categories, type Rule } from "@/data/ui-logic";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "error";

const FALLBACK_ORIGIN = "https://axiom.design";
const RESET_DELAY_MS = 1800;

const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

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

  // Fallback for non-secure origins (e.g. previewing over a LAN IP).
  try {
    const textarea = document.createElement("textarea");
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
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function buildText(rule: Rule): string {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : FALLBACK_ORIGIN;
  const url = `${origin}/rules/${rule.id}`;
  const categoryName = categoryNameById.get(rule.category) ?? "Axiom";

  return [
    `${rule.title} (${categoryName})`,
    rule.desc,
    ``,
    `Do: ${rule.do}`,
    `Don't: ${rule.dont}`,
    ``,
    url,
  ].join("\n");
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
  const isCopied = state === "copied";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label={isCopied ? "Copied" : "Copy rule"}
        title="Copy rule"
        className={cn(
          "pressable inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
          className
        )}
      >
        <CopyGlyph isCopied={isCopied} className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={isCopied ? "Copied" : "Copy rule"}
      className={cn(
        "pressable inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-neutral-50",
        className
      )}
    >
      <CopyGlyph isCopied={isCopied} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function CopyGlyph({ isCopied, className }: { isCopied: boolean; className: string }) {
  return (
    <span className={cn("relative shrink-0", className)} aria-hidden="true">
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
          isCopied ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
        )}
      >
        <Check className={className} />
      </span>
      <span
        className={cn(
          "flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
          isCopied ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0"
        )}
      >
        <Copy className={className} />
      </span>
    </span>
  );
}
