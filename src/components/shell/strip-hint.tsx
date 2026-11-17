// design-system: strict
"use client";

/*
 * The strip's one-time hint: "Each dot on the left is a rule — hover to
 * preview". It is shown to a reader with no history until dismissed
 * (`axiom:strip-hint`), and goes for good on the first hover or focus on the
 * strip, or when another rule opens. Left alone, it fades out after a while
 * for this page view only; that alone does not count as seen. The fade is
 * timed here rather than as a delayed CSS animation, so nothing sits running
 * at idle.
 *
 * It never covers the page. Both sheet headers (the wall's toolbar and the
 * rule view's) keep a flexible spacer between their leading and trailing
 * controls, and the hint sits centred in the visible one, on the header's
 * line, at least GAP clear of the controls either side, so it reads as a
 * passing note rather than one more item in the breadcrumb. When the spacer
 * is too narrow for that, it stays hidden rather than crowd.
 *
 * Showing or hiding the deep dive moves the header's controls under it, so
 * that fades it for this page view, as being left alone does.
 *
 * The server never renders it (the store's server snapshot says "seen"), so
 * first paint never flips. Plain text inside the rail's navigation, read once
 * in order: never a live region. The rail is hidden on phones, and so is this.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { catalogStores } from "@/lib/catalog/stores";

/** How long an untouched hint stays, then how long it takes to fade. */
const SHOW_MS = 12_000;
const FADE_MS = 220;
/** The header's free run: its spacer, in whichever view is on screen. */
const SPACERS = ".shell-sheet header :is(.gw-spacer, .rv-spacer)";
/** Room kept clear on each side of the hint inside that run. */
const GAP = 32;
/** A header still mounting (the wall arriving after a direct load) is looked for this many frames. */
const SEEK_FRAMES = 30;

type Spot = { left: number; top: number };

/** Where the hint fits in the visible header's spacer, or null when it does not. */
function freeSpot(width: number, height: number): Spot | null | undefined {
  for (const spacer of document.querySelectorAll<HTMLElement>(SPACERS)) {
    if (spacer.closest("[inert]")) continue;
    const run = spacer.getBoundingClientRect();
    const header = spacer.closest("header")?.getBoundingClientRect();
    if (!header || header.height === 0) continue;
    if (run.width < width + 2 * GAP) return null;
    return { left: Math.round(run.left + (run.width - width) / 2), top: Math.round(header.top + (header.height - height) / 2) };
  }
  return undefined;
}

export function StripHint({ ruleId, hidden }: { ruleId: string | null; hidden: boolean }) {
  const { stripHintSeen, deepDive } = catalogStores;
  const seen = useSyncExternalStore(stripHintSeen.subscribe, stripHintSeen.get, stripHintSeen.server);

  // Landing on a rule is arriving, not opening one: the next rule opened dismisses it.
  const [first] = useState(ruleId);
  const opened = Boolean(ruleId && ruleId !== first);
  const [phase, setPhase] = useState<"shown" | "leaving" | "gone">("shown");
  const [spot, setSpot] = useState<Spot | null>(null);
  const card = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (opened) catalogStores.dismissStripHint();
  }, [opened]);
  const showing = !seen && !opened && phase !== "gone";
  // The deep dive shown or hidden while the hint is up: it fades now.
  useEffect(() => {
    if (!showing) return;
    let gone: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = deepDive.subscribe(() => {
      setPhase("leaving");
      clearTimeout(gone);
      gone = setTimeout(() => setPhase("gone"), FADE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(gone);
    };
  }, [showing, deepDive]);
  useEffect(() => {
    if (!showing) return;
    const leave = setTimeout(() => setPhase("leaving"), SHOW_MS);
    const gone = setTimeout(() => setPhase("gone"), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, [showing]);

  const place = useCallback(() => {
    const el = card.current;
    if (!el) return true;
    const found = freeSpot(el.offsetWidth, el.offsetHeight);
    setSpot((current) => {
      const next = found ?? null;
      return current?.left === next?.left && current?.top === next?.top ? current : next;
    });
    return found !== undefined;
  }, []);

  /* Placed before it paints, again on resize and whenever the view under it changes. */
  useLayoutEffect(() => {
    if (!showing || hidden) return;
    let frame = 0;
    let tries = 0;
    const seek = () => {
      frame = 0;
      if (!place() && tries++ < SEEK_FRAMES) frame = requestAnimationFrame(seek);
    };
    seek();
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [showing, hidden, ruleId, place]);

  if (!showing || hidden) return null;
  return (
    <p
      ref={card}
      className="strip-hint"
      data-placed={spot ? "" : undefined}
      data-leaving={phase === "leaving" ? "" : undefined}
      style={spot ? { left: spot.left, top: spot.top } : undefined}
    >
      <span className="strip-hint-dots" aria-hidden="true" />
      Each dot on the left is a rule — hover to preview
    </p>
  );
}
