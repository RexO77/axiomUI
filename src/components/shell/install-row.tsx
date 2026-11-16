// design-system: strict
"use client";

/*
 * The rail's install row and its popover. Expanded, the row shows the skills
 * command in mono with a copy button on hover or focus; collapsed it is an
 * icon whose tooltip carries the command. Either way a click opens the
 * popover beside the rail.
 *
 * The popover is non-modal and mounted only while open. It places itself in a
 * layout effect against the row, follows the row through a ResizeObserver
 * (expanding or collapsing the rail resizes it) and a window resize, and stays
 * inside the viewport. If the row disappears (the phone layout hides the
 * rail), it closes and hands focus to the sheet, so focus never drops to
 * <body>. Esc closes it from inside, in the bubble phase, so nothing behind
 * it hears that Esc; focus then returns to the row.
 *
 * "Browse the skills" closes the popover and opens the full skills dialog.
 * The dialog is its own chunk, fetched when the popover first opens, so the
 * catalog's first load never carries it. Focus returns to the row when it
 * closes.
 *
 * Phones have no rail: the phone menu's install row (`InstallMenuRow`) opens
 * the same dialog, held by the shell (`useSkillsDialog`) so it outlives the
 * menu.
 */

import dynamic from "next/dynamic";
import { ArrowRight, Check, Copy, SquareTerminal } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { skillsCliCommand } from "@/lib/skills/catalog";

const loadSkillsDialog = () => import("@/components/features/skills/skill-bonus").then((mod) => mod.SkillBonus);
const SkillsDialog = dynamic(loadSkillsDialog, { ssr: false });

/** From the row's right edge to the popover: clear of the rail's 8px gutter, then 8px more. */
const GAP = 16;
const EDGE = 8;
const COPIED_MS = 1500;

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** A copy that shows "Copied" for a moment. The newest attempt wins; the timer dies with the control. */
function useCopy(text: string) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const attempt = useRef(0);
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), COPIED_MS);
    return () => clearTimeout(timer);
  }, [state]);
  useEffect(() => () => void (attempt.current += 1), []);
  const copy = useCallback(async () => {
    const mine = ++attempt.current;
    const ok = await writeClipboard(text);
    if (mine === attempt.current) setState(ok ? "copied" : "failed");
  }, [text]);
  return [state, copy] as const;
}

type PopoverProps = {
  id: string;
  anchor: HTMLElement;
  onClose: (focus: "anchor" | "fallback" | null) => void;
  onBrowse: () => void;
};

function InstallPopover({ id, anchor, onClose, onBrowse }: PopoverProps) {
  const pop = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [copied, copy] = useCopy(skillsCliCommand);

  // Warm the dialog's chunk, so "Browse the skills" opens it without a wait.
  useEffect(() => {
    void loadSkillsDialog().catch(() => {});
  }, []);

  useLayoutEffect(() => {
    const el = pop.current;
    if (!el) return;
    const place = () => {
      if (!anchor.isConnected || anchor.getClientRects().length === 0) {
        onClose("fallback");
        return;
      }
      const row = anchor.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const left = Math.max(EDGE, Math.min(row.right + GAP, vw - el.offsetWidth - EDGE));
      const top = Math.max(EDGE, Math.min(row.bottom - el.offsetHeight, vh - el.offsetHeight - EDGE));
      el.style.translate = `${Math.round(left)}px ${Math.round(top)}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(anchor);
    observer.observe(el);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [anchor, onClose]);

  useEffect(() => {
    pop.current?.focus({ preventScroll: true });
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!pop.current?.contains(target) && !anchor.contains(target)) onClose(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [anchor, onClose]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    onClose("anchor");
  };

  return (
    <div
      ref={pop}
      id={id}
      role="dialog"
      aria-labelledby={`${uid}-title`}
      tabIndex={-1}
      className="install-pop"
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        // Tabbing away closes it; a click elsewhere is the pointerdown listener's.
        const next = event.relatedTarget as Node | null;
        if (next && !event.currentTarget.contains(next) && !anchor.contains(next)) onClose(null);
      }}
    >
      <h2 id={`${uid}-title`}>Install in your agent</h2>
      <p>Axiom UI’s rules as agent skills.</p>
      <div className="install-cmd">
        <code>{skillsCliCommand}</code>
        <button type="button" className="install-copy" data-copied={copied === "copied" ? "" : undefined}
          aria-label={copied === "failed" ? "Retry copying the install command" : "Copy install command"} onClick={() => void copy()}>
          {copied === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      </div>
      <p>Choose which skills and agents to install. Run it in your project, or add <code>-g</code> for every project.</p>
      <button type="button" className="install-link" aria-haspopup="dialog" onClick={onBrowse}>
        Browse the skills
        <ArrowRight aria-hidden="true" />
      </button>
      <span role="status" className="sr-only">
        {copied === "copied" ? "Copied" : copied === "failed" ? "Copy failed. Try again." : ""}
      </span>
    </div>
  );
}

/**
 * The skills dialog, loaded on first open and then kept mounted so it can
 * animate out. Returns the element to render and the opener. The dialog
 * returns focus to whatever held it when it opened.
 */
export function useSkillsDialog() {
  const [state, setState] = useState<"unloaded" | "open" | "closed">("unloaded");
  const onOpenChange = useCallback((open: boolean) => setState(open ? "open" : "closed"), []);
  const open = useCallback(() => setState("open"), []);
  const dialog = state === "unloaded" ? null : <SkillsDialog open={state === "open"} onOpenChange={onOpenChange} />;
  return [dialog, open] as const;
}

/** The phone menu's row for the skills dialog: a full 44px row, its chunk warmed while the menu is open. */
export function InstallMenuRow({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    void loadSkillsDialog().catch(() => {});
  }, []);
  return (
    <button type="button" className="rail-row" aria-haspopup="dialog" onClick={onOpen}>
      <SquareTerminal aria-hidden="true" />
      <span className="rail-row-label">Install in your agent</span>
    </button>
  );
}

/** `fallback` takes focus when the row disappears under an open popover. */
export function InstallRow({ expanded, fallback }: { expanded: boolean; fallback: RefObject<HTMLElement | null> }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const popId = useId();
  const [copied, copy] = useCopy(skillsCliCommand);
  const [skillsDialog, openSkills] = useSkillsDialog();

  const close = useCallback(
    (focus: "anchor" | "fallback" | null) => {
      setAnchor(null);
      if (focus === "anchor") button.current?.focus({ preventScroll: true });
      else if (focus === "fallback") fallback.current?.focus({ preventScroll: true });
    },
    [fallback],
  );
  const browse = useCallback(() => {
    close("anchor");
    openSkills();
  }, [close, openSkills]);

  return (
    <div className="install-row">
      <Tooltip content={<>Install in your agent · <code className="install-tip-code">{skillsCliCommand}</code></>} disabled={expanded || anchor !== null} className="w-full">
        <button ref={button} type="button" className="rail-row" aria-haspopup="dialog" aria-expanded={anchor !== null}
          aria-controls={anchor ? popId : undefined}
          onClick={(event) => setAnchor((open) => (open ? null : event.currentTarget))}>
          <SquareTerminal aria-hidden="true" />
          <span className="rail-row-label">
            <span className="sr-only">Install in your agent: </span>
            <code className="install-row-code">{skillsCliCommand}</code>
          </span>
        </button>
      </Tooltip>
      {expanded ? (
        <button type="button" className="install-row-copy" data-copied={copied === "copied" ? "" : undefined}
          aria-label={copied === "failed" ? "Retry copying the install command" : "Copy install command"} onClick={() => void copy()}>
          {copied === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      ) : null}
      {expanded ? (
        <span role="status" className="sr-only">
          {copied === "copied" ? "Copied" : copied === "failed" ? "Copy failed. Try again." : ""}
        </span>
      ) : null}
      {anchor ? <InstallPopover id={popId} anchor={anchor} onClose={close} onBrowse={browse} /> : null}
      {skillsDialog}
    </div>
  );
}
