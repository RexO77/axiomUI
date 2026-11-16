// design-system: strict
"use client";

/*
 * Copy rule ▾. The main half copies the rule for an agent; the menu has
 * Markdown and the link. "Copied" holds for 1.5 s at a locked width. The
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

import { AlertCircle, Check, ChevronDown, Copy, FileText, Link2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { Rule } from "@/data/ui-logic";
import { ruleToText } from "@/lib/rule-text";

type Done = "md" | "link" | null;

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

const STATUS = { copied: "Rule copied", error: "Couldn’t copy", md: "Copied as Markdown", link: "Link copied" } as const;

export function CopyMenu({ rule, className }: { rule: Rule; className?: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Done>(null);
  const [main, setMain] = useState<"idle" | "copied" | "error">("idle");
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (main === "idle") return;
    const timer = setTimeout(() => setMain("idle"), 1500);
    return () => clearTimeout(timer);
  }, [main]);
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

  const pick = async (kind: "md" | "link") => {
    // Started inside the click, which the clipboard needs; focus goes back now,
    // never after the write, by which time the reader may have moved on.
    const writing = writeClipboard(kind === "md" ? ruleMarkdown(rule) : ruleLink(rule));
    close(true);
    const ok = await writing;
    setDone(ok ? kind : null);
    if (!ok) setMain("error");
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

  const status = main !== "idle" ? STATUS[main] : done ? STATUS[done] : "";

  return (
    <div
      ref={group}
      className={className ? `rv-split ${className}` : "rv-split"}
      onBlur={(event) => {
        if (open && !group.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="rv-split-main"
        data-state={main === "idle" ? undefined : main}
        onClick={async () => setMain((await writeClipboard(ruleToText(rule, window.location.origin))) ? "copied" : "error")}
      >
        {main === "copied" ? <Check aria-hidden="true" /> : main === "error" ? <AlertCircle aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span>{main === "copied" ? "Copied" : main === "error" ? "Couldn’t copy" : "Copy rule"}</span>
      </button>
      <button
        ref={trigger}
        type="button"
        className="rv-split-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More ways to copy"
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown aria-hidden="true" />
      </button>
      {open ? (
        <div ref={menu} role="menu" aria-label="Copy" className="rv-menu" onKeyDown={onMenuKey}>
          <button type="button" role="menuitem" tabIndex={-1} onClick={() => void pick("md")}>
            <FileText aria-hidden="true" />
            Copy as Markdown
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={() => void pick("link")}>
            <Link2 aria-hidden="true" />
            Copy link
          </button>
        </div>
      ) : null}
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
