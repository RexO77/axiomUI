// design-system: strict
"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { AxiomLogo } from "@/components/ui/axiom-logo";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, closeAllTooltips } from "@/components/ui/tooltip";
import { railCategoryOf, railOrder } from "@/data/taxonomy";
import { PHONE_QUERY, REDUCED_MOTION_QUERY } from "@/lib/media";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { memoryStore } from "@/lib/navigation/memory";
import { createRoutes } from "@/lib/navigation/routes";
import { siteConfig } from "@/lib/site";
import { CLOSE_MS, OPEN_MS, OPEN_SHIFT } from "./geometry";
import { useShell } from "./shell-context";
import { SidebarList } from "./sidebar-list";

const sidebarSnapshot = () => memoryStore.getSnapshot().prefs.sidebarOpen;

/** The strip and the bottom rows are slots the shell fills. */
export function Rail({ strip, bottomCluster }: { strip?: ReactNode; bottomCluster?: ReactNode }) {
  const { view, ruleId, deck, hrefFor, home, openRule, peek, sheet, phone, singleKeys, inputOrigin } = useShell();
  // hrefFor is already bound to the shell's route base.
  const routes = useMemo(() => createRoutes(hrefFor(railOrder[0].id).split("/rules/")[0]), [hrefFor]);
  const matches = useMemo(() => view === "gallery" && deck.kind !== "catalog" ? new Set(deck.rules.map((rule) => rule.id)) : null, [view, deck]);
  const currentCat = ruleId ? railCategoryOf(ruleId) : null;
  const preference = useSyncExternalStore(memoryStore.subscribe, sidebarSnapshot, () => null);
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const target = useRef(false);
  const railFocused = useRef(false);
  const move = useRef<{ generation: number; stop: (() => void) | null; finish: (() => void) | null }>({ generation: 0, stop: null, finish: null });

  const setRail = useCallback((next: boolean, instant: boolean) => {
    const root = nav.current?.closest<HTMLElement>(".shell");
    const element = root?.querySelector<HTMLElement>(".shell-sheet");
    if (!element || !root) return;
    const session = move.current;
    session.generation += 1;
    session.stop?.();
    session.stop = null;
    session.finish = null;
    target.current = next;
    peek.current?.close();
    closeAllTooltips();
    // Focus must leave the surface before CSS hides it or React makes it inert.
    const disappearing = nav.current?.querySelector(next ? ".rail-region" : ".rail-list");
    if (disappearing?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
    const commit = (expanded: boolean, wide: boolean) => {
      root.toggleAttribute("data-open", expanded);
      root.toggleAttribute("data-wide", wide);
      setOpen(expanded);
    };
    root.setAttribute("data-rail-ready", "");
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (instant || reduced || window.matchMedia(PHONE_QUERY).matches) {
      delete element.dataset.moving;
      element.style.transform = "";
      commit(next, next);
      return;
    }
    const generation = session.generation;
    const x = element.getBoundingClientRect().left;
    // Keep the collapsed layout throughout the move; reflow only at the end.
    commit(true, false);
    delete element.dataset.moving;
    const from = x - element.offsetLeft;
    element.style.transform = `translateX(${from}px)`;
    void element.offsetWidth;
    const to = next ? OPEN_SHIFT : 0;
    const finish = () => {
      if (session.generation !== generation) return;
      session.stop?.();
      session.stop = null;
      session.finish = null;
      // Closing keeps the list visible during travel; focus can enter it meanwhile.
      if (!next && nav.current?.querySelector(".rail-list")?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
      delete element.dataset.moving;
      element.style.transform = "";
      commit(next, next);
    };
    session.finish = finish;
    if (Math.abs(from - to) < 0.5) { finish(); return; }
    element.dataset.moving = next ? "open" : "close";
    element.style.transform = `translateX(${to}px)`;
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === "transform") finish();
    };
    element.addEventListener("transitionend", onEnd);
    element.addEventListener("transitioncancel", onEnd);
    const timer = window.setTimeout(finish, (next ? OPEN_MS : CLOSE_MS) + 80);
    session.stop = () => {
      element.removeEventListener("transitionend", onEnd);
      element.removeEventListener("transitioncancel", onEnd);
      window.clearTimeout(timer);
    };
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
    const settle = () => session.finish?.();
    const onPhone = () => {
      if (!phoneQuery.matches) return;
      // CSS or inert may already have blurred the hidden control to body.
      if (railFocused.current || nav.current?.contains(document.activeElement)) sheet.current?.focus({ preventScroll: true });
      railFocused.current = false;
      settle();
    };
    reduced.addEventListener("change", settle);
    phoneQuery.addEventListener("change", onPhone);
    return () => {
      reduced.removeEventListener("change", settle);
      phoneQuery.removeEventListener("change", onPhone);
      session.stop?.();
    };
  }, [sheet]);

  return (
    <nav ref={nav} className="shell-rail" aria-label="Rules navigation" inert={phone}
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
      <div className="rail-region" inert={open}>{strip}</div>
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
        {bottomCluster}
      </div>
    </nav>
  );
}
