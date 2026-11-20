// design-system: strict
"use client";

/*
 * One menu offers plain text, Markdown and the canonical link. "Copied" holds for 1.5 s at a locked width. The
 * rule view keys it by rule id, so a page turn never carries "Copied" over.
 *
 * The menu:
 * - opens on the first item; ↑/↓ wrap, Home and End jump;
 * - Escape closes it here and returns focus to the trigger, without reaching
 *   the shell, so the rule view stays;
 * - Tab, or any focus leaving the trigger group, closes it, and focus goes on
 *   where Tab was taking it;
 * - it is a [role="menu"], which the shared keyboard table leaves alone, so
 *   J/K and ←/→ never page the rule from inside it.
 */

import { AlertCircle, Check, ChevronDown, Copy, FileText, Link2 } from "@/components/ui/icons";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { Rule } from "@/data/ui-logic";
import { ruleToText } from "@/lib/rule-text";

type Format = "text" | "md" | "link";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The canonical address, independent of the catalog mount point. */
const ruleLink = (rule: Rule) => `${window.location.origin}/rules/${rule.id}`;

function ruleMarkdown(rule: Rule): string {
  return [`## ${rule.title}`, "", rule.desc, "", `- **Do:** ${rule.do}`, `- **Don’t:** ${rule.dont}`, "", ruleLink(rule)].join("\n");
}

const STATUS = { text: "Rule copied", error: "Couldn’t copy", md: "Copied as Markdown", link: "Link copied" } as const;

export function CopyMenu({ rule, className }: { rule: Rule; className?: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Format | "error" | null>(null);
  const attempt = useRef(0);
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(null), 1500);
    return () => clearTimeout(timer);
  }, [done]);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    const onDown = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const pick = async (kind: Format) => {
    const current = ++attempt.current;
    const text = kind === "link" ? ruleLink(rule) : kind === "md" ? ruleMarkdown(rule) : ruleToText(rule, window.location.origin);
    const writing = writeClipboard(text);
    close(true);
    const ok = await writing;
    if (attempt.current === current) setDone(ok ? kind : "error");
  };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    let to = -1;
    if (event.key === "ArrowDown") to = (at + 1) % items.length;
    else if (event.key === "ArrowUp") to = (at - 1 + items.length) % items.length;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = items.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    } else if (event.key === "Tab") {
      // Dismiss and let Tab move focus on from where it is.
      setOpen(false);
      return;
    }
    if (to < 0) return;
    event.preventDefault();
    items[to]?.focus();
  };

  const status = done ? STATUS[done] : "";

  return (
    <div
      ref={group}
      className={className ? `rv-copy ${className}` : "rv-copy"}
      onBlur={(event) => {
        if (open && !group.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="rv-copy-trigger"
        data-state={done ? (done === "error" ? "error" : "copied") : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setDone(null);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {done === "error" ? <AlertCircle aria-hidden="true" /> : done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span>{done === "error" ? "Copy failed" : done ? "Copied" : "Copy rule"}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      <div ref={menu} role="menu" aria-label="Copy" hidden={!open} inert={!open} className="rv-menu" onKeyDown={onMenuKey}>
        <button type="button" role="menuitem" tabIndex={-1} onClick={() => void pick("text")}>
          <Copy aria-hidden="true" />
          Copy as plain text
        </button>
        <button type="button" role="menuitem" tabIndex={-1} onClick={() => void pick("md")}>
          <FileText aria-hidden="true" />
          Copy as Markdown
        </button>
        <button type="button" role="menuitem" tabIndex={-1} onClick={() => void pick("link")}>
          <Link2 aria-hidden="true" />
          Copy link
        </button>
      </div>
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
