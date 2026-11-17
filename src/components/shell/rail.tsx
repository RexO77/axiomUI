// design-system: strict
"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { AxiomLogo } from "@/components/ui/axiom-logo";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, closeAllTooltips } from "@/components/ui/tooltip";
import { railCategoryOf, railOrder } from "@/data/taxonomy";
import { catalogStores } from "@/lib/catalog/stores";
import { PHONE_QUERY, REDUCED_MOTION_QUERY } from "@/lib/media";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { memoryStore } from "@/lib/navigation/memory";
import { createRoutes } from "@/lib/navigation/routes";
import { siteConfig } from "@/lib/site";
import { CLOSE_MS, OPEN_MS, RAIL, RAIL_OPEN } from "./geometry";
import { InstallRow } from "./install-row";
import { MagnifyStrip } from "./magnify-strip";
import { moveSheet, settleSheet } from "./sheet-resize";
import { useShell } from "./shell-context";
import { SidebarList } from "./sidebar-list";
import { StripHint } from "./strip-hint";
import { ThemeRow } from "./theme-row";
import "./overlays.css";

const sidebarSnapshot = () => memoryStore.getSnapshot().prefs.sidebarOpen;

/**
 * The rail: the home row, the strip (collapsed) or the list (expanded), and the bottom rows.
 * `covered`: one of the shell's modals is open. The rail stays inert under it even when the
 * layout changes underneath (a phone widened past the breakpoint), where `phone` alone would
 * lift `inert` behind the open dialog.
 */
export function Rail({ covered = false }: { covered?: boolean }) {
  const { view, ruleId, deck, hrefFor, home, openRule, peek, sheet, phone, singleKeys, inputOrigin } = useShell();
  // hrefFor is already bound to the shell's route base.
  const routes = useMemo(() => createRoutes(hrefFor(railOrder[0].id).split("/rules/")[0]), [hrefFor]);
  const matches = useMemo(() => view === "gallery" && deck.kind !== "catalog" ? new Set(deck.rules.map((rule) => rule.id)) : null, [view, deck]);
  const currentCat = ruleId ? railCategoryOf(ruleId) : null;
  const toCategory = useCallback((id: string) => home(id, "pointer"), [home]);
  const keyboardOrigin = useCallback(() => inputOrigin() === "keyboard", [inputOrigin]);
  const dismissHint = useCallback(() => catalogStores.dismissStripHint(), []);
  const preference = useSyncExternalStore(memoryStore.subscribe, sidebarSnapshot, () => null);
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const target = useRef(false);
  const railFocused = useRef(false);
  const move = useRef<{ generation: number; finish: (() => void) | null; release: (() => void) | null }>({ generation: 0, finish: null, release: null });

  /*
   * One move, one motion: the sheet's left edge transitions (shell.css) and
   * everything in it reflows with the edge, so it lands in its final layout
   * when the edge does. Opening shows the list at once and the edge uncovers
   * it; closing keeps it until the edge has covered it again. A second toggle
   * mid-move turns the edge around from where it is.
   */
  const setRail = useCallback((next: boolean, instant: boolean) => {
    const root = nav.current?.closest<HTMLElement>(".shell");
    const element = root?.querySelector<HTMLElement>(".shell-sheet");
    if (!element || !root) return;
    const session = move.current;
    session.generation += 1;
    session.finish = null;
    target.current = next;
    peek.current?.close();
    closeAllTooltips();
    // Focus must leave the surface before CSS hides it or React makes it inert.
    const disappearing = nav.current?.querySelector(next ? ".rail-region" : ".rail-list");
    if (disappearing?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
    const expand = (expanded: boolean) => {
      root.toggleAttribute("data-open", expanded);
      setOpen(expanded);
    };
    root.setAttribute("data-rail-ready", "");
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (instant || reduced || window.matchMedia(PHONE_QUERY).matches) {
      session.release?.();
      session.release = null;
      delete root.dataset.moving;
      root.toggleAttribute("data-wide", next);
      expand(next);
      return;
    }
    const generation = session.generation;
    // Written together, after the move has read the page: one restyle on the click, not one per attribute.
    const start = () => {
      root.dataset.moving = next ? "open" : "close";
      root.toggleAttribute("data-wide", next);
      if (next) expand(true);
    };
    const release = moveSheet(element, start, next ? RAIL_OPEN : RAIL, {
      duration: next ? OPEN_MS : CLOSE_MS,
      easing: next ? "var(--ease-drawer)" : "var(--ease-out-strong)",
    });
    session.release = release;
    const finish = () => {
      if (session.generation !== generation || session.finish !== finish) return;
      session.finish = null;
      session.release = null;
      // Closing keeps the list visible during travel; focus can enter it meanwhile.
      if (!next && nav.current?.querySelector(".rail-list")?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
      delete root.dataset.moving;
      release();
      if (!next) expand(false);
    };
    session.finish = finish;
    // The edge's own transition decides when the move is over, at any playback speed.
    const edge = element.getAnimations().find((animation) => animation instanceof CSSTransition && animation.transitionProperty === "left");
    if (edge) edge.finished.then(finish, finish);
    else finish();
  }, [peek]);

  useLayoutEffect(() => {
    const next = preference ?? document.documentElement.dataset.rail === "open";
    if (next !== target.current || !nav.current?.closest(".shell[data-rail-ready]")) setRail(next, true);
  }, [preference, setRail]);

  const change = useCallback((instant: boolean) => {
    const next = !target.current;
    setRail(next, instant);
    document.documentElement.dataset.rail = next ? "open" : "closed";
    memoryStore.setPrefs({ sidebarOpen: next });
  }, [setRail]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (phone || event.repeat || shortcutAction(event, { view, singleKeys }) !== "sidebar") return;
      event.preventDefault();
      change(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [change, phone, singleKeys, view]);

  useEffect(() => {
    const session = move.current;
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const phoneQuery = window.matchMedia(PHONE_QUERY);
    const settle = () => {
      if (sheet.current) settleSheet(sheet.current);
      session.finish?.();
    };
    const onPhone = () => {
      if (!phoneQuery.matches) return;
      // CSS or inert may already have blurred the hidden control to body.
      if (railFocused.current || nav.current?.contains(document.activeElement)) sheet.current?.focus({ preventScroll: true });
      railFocused.current = false;
      settle();
    };
    window.addEventListener("resize", settle);
    reduced.addEventListener("change", settle);
    phoneQuery.addEventListener("change", onPhone);
    return () => {
      window.removeEventListener("resize", settle);
      reduced.removeEventListener("change", settle);
      phoneQuery.removeEventListener("change", onPhone);
      session.generation += 1;
      session.finish = null;
      session.release?.();
      session.release = null;
    };
  }, [sheet]);

  return (
    <nav ref={nav} className="shell-rail" aria-label="Rules navigation" inert={phone || covered}
      onFocusCapture={() => { railFocused.current = true; }}
      onBlurCapture={() => { if (!window.matchMedia(PHONE_QUERY).matches) railFocused.current = false; }}>
      <div className="rail-brand-row">
        <Tooltip content="All rules" disabled={open}>
          <a className="rail-home" href={routes.galleryHref()} aria-label={`${siteConfig.name} — All rules`}
            aria-current={view === "gallery" ? "page" : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
              event.preventDefault();
              home(null, event.detail === 0 ? "keyboard" : "pointer");
            }}>
            <span className="rail-logo-tile"><AxiomLogo className="size-4" /></span>
            <span className="rail-brand-name">{siteConfig.name}</span>
          </a>
        </Tooltip>
      </div>
      {/* The first hover or focus on the strip is the hint's "seen". */}
      <div className="rail-region" inert={open} onPointerEnter={dismissHint} onFocus={dismissHint}>
        <MagnifyStrip ruleId={ruleId} currentCat={currentCat} matches={matches} routes={routes} peek={peek}
          onOpen={openRule} onCategory={toCategory} />
        <StripHint ruleId={ruleId} hidden={open} />
      </div>
      <SidebarList ruleId={ruleId} currentCat={currentCat} matches={matches} peek={peek}
        hidden={!open} routes={routes} onOpen={openRule} />
      <div className="rail-bottom">
        <Tooltip content={<>Expand sidebar <Kbd>[</Kbd></>} disabled={open} className="w-full">
          <button ref={toggle} type="button" className="rail-button" aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            onClick={(event) => change(event.detail === 0 || inputOrigin() === "keyboard")}>
            <PanelLeftOpen aria-hidden="true" className="rail-icon-expand" />
            <PanelLeftClose aria-hidden="true" className="rail-icon-collapse" />
            <span className="rail-button-label">Collapse <Kbd className="ml-2">[</Kbd></span>
          </button>
        </Tooltip>
        <InstallRow expanded={open} fallback={sheet} />
        <ThemeRow expanded={open} keyboard={keyboardOrigin} />
      </div>
    </nav>
  );
}
