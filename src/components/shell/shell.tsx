// design-system: strict
"use client";

/*
 * The shell frame: the backdrop behind the rail, one sheet over it,
 * the keyboard, the live region and the reading position. It owns no location: CatalogApp does, and the shell asks
 * it to move through `onOpenRule`, `onExit` and `onHome`.
 *
 * - Paging replaces, opening pushes (CatalogApp writes history).
 * - The sheet's reading position rides in the rule's history entry as
 *   `{ id, top }`, saved after scrolling settles, and is restored only on
 *   popstate, and only for that rule. Any other rule change
 *   starts at the top.
 * - Focus moves to the rule title only when the rule view is entered from the
 *   wall. Paging leaves focus where it is and speaks through the live region
 *   instead, so nothing is announced twice.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from "react";

import { collections, railCategory } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { PHONE_QUERY, useMediaQuery } from "@/lib/media";
import { deckPosition, sectionJump, stepRule, type Deck, type Direction } from "@/lib/navigation/deck";
import { currentUrl, saveScroll, scrollToRestore, writeHistory } from "@/lib/navigation/history";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { memoryStore, useRuleMemory } from "@/lib/navigation/memory";
import type { ShellView } from "@/lib/navigation/routes";

import { SCROLL_SAVE_MS, shellVars } from "./geometry";
import { Rail } from "./rail";
import { ShellContext, type InputOrigin, type PeekHandle, type ShellApi } from "./shell-context";
import "./shell.css";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
const noop = () => {};
const never = () => () => {};

const singleKeysSnapshot = () => memoryStore.getSnapshot().prefs.singleKeys;
const modKeySnapshot = () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl ");

/** What the live region says for a rule in a deck. */
function whereIs(deck: Deck, id: string): string {
  const rule = ruleById.get(id);
  const position = deckPosition(deck, id);
  if (!rule || !position) return rule?.title ?? "";
  const at = `${rule.title}, ${position.label}`;
  if (deck.kind === "search") return `${at} matches`;
  if (deck.kind === "collection") return `${at}, ${collections.find((item) => item.id === deck.collection)?.name ?? ""}`;
  return `${at}, ${railCategory(position.category).name}`;
}

export type ShellProps = {
  view: ShellView;
  ruleId: string | null;
  /** The deck the rule view pages: already resolved, so it always holds the rule. */
  deck: Deck;
  onOpenRule: (id: string, mode: "push" | "replace") => void;
  onExit: (origin: InputOrigin) => void;
  onHome: (categoryId: string | null, origin: InputOrigin) => void;
  onClearDeck: () => void;
  hrefFor: (id: string) => string;
  children: ReactNode;
};

export function Shell({ view, ruleId, deck, onOpenRule, onExit, onHome, onClearDeck, hrefFor, children }: ShellProps) {
  const rule = view === "rule" && ruleId ? ruleById.get(ruleId) ?? null : null;
  const currentId = rule?.id ?? null;
  const phone = useMediaQuery(PHONE_QUERY);
  const modKey = useSyncExternalStore(never, modKeySnapshot, () => "⌘");
  const singleKeys = useSyncExternalStore(memoryStore.subscribe, singleKeysSnapshot, () => true);
  const { deepDive } = catalogStores;
  const inspectorOpen = useSyncExternalStore(deepDive.subscribe, deepDive.get, deepDive.server);

  const sheet = useRef<HTMLElement>(null);
  const peek = useRef<PeekHandle>(null);
  const origin = useRef<InputOrigin>("pointer");
  const [scrolled, setScrolled] = useState(false);
  const [message, setMessage] = useState("");

  /* Last, Recent and visited (after a dwell, so skimming with J marks nothing). */
  useRuleMemory(currentId);

  /* Where the last input came from, on <html> so portalled content can key on it too. */
  useEffect(() => {
    const root = document.documentElement;
    const set = (next: InputOrigin) => {
      if (origin.current === next && root.dataset.input === next) return;
      origin.current = next;
      root.dataset.input = next;
    };
    const onKey = (event: KeyboardEvent) => {
      if (!["Shift", "Meta", "Control", "Alt"].includes(event.key)) set("keyboard");
    };
    const onPointer = (event: PointerEvent) => {
      if (event.type === "pointerdown" || event.movementX || event.movementY) set("pointer");
    };
    root.dataset.input = origin.current;
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("pointermove", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("pointermove", onPointer, true);
      delete root.dataset.input;
    };
  }, []);
  const inputOrigin = useCallback(() => origin.current, []);

  /* The deep dive's hidden state on <html>: the boot script sets it before paint, this keeps it in step. */
  useEffect(() => {
    const sync = () => {
      if (deepDive.get()) delete document.documentElement.dataset.deep;
      else document.documentElement.dataset.deep = "hidden";
    };
    sync();
    return deepDive.subscribe(sync);
  }, [deepDive]);
  const toggleInspector = useCallback(() => catalogStores.setDeepDiveOpen(!deepDive.get()), [deepDive]);

  /*
   * Reading position. This listener is registered before CatalogApp's (a
   * child's effects run first), so it holds the entry's state for the commit
   * that popstate causes. A pop that lands on the same rule commits nothing,
   * and the next change is to another rule, whose id cannot match.
   */
  const popped = useRef<unknown>(undefined);
  const saveTimer = useRef(0);
  useEffect(() => {
    const onPop = () => {
      window.clearTimeout(saveTimer.current);
      popped.current = window.history.state;
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(saveTimer.current);
    };
  }, []);

  /*
   * The live region speaks a page turn, a jump and a deck change inside the
   * rule view. Entering from the wall says nothing here: focus moves to the
   * title, which speaks. The wall clears it.
   */
  const deckKey = `${deck.kind}\u0000${deck.q ?? ""}\u0000${deck.collection ?? ""}`;
  const announceKey = `${view}\u0000${currentId ?? ""}\u0000${deckKey}`;
  const [announced, setAnnounced] = useState({ key: announceKey, view });
  if (announced.key !== announceKey) {
    setAnnounced({ key: announceKey, view });
    setMessage(rule && announced.view === "rule" ? whereIs(deck, rule.id) : "");
  }

  const previous = useRef({ view, id: currentId });
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { view, id: currentId };
    const state = popped.current;
    popped.current = undefined;
    window.clearTimeout(saveTimer.current);
    document.title = rule ? `${rule.title} · Axiom UI` : "All rules · Axiom UI";
    if (!rule || before.id === rule.id) return;
    const el = sheet.current;
    const target = state === undefined ? 0 : (scrollToRestore(state, rule.id) ?? 0);
    if (el && el.scrollTop !== target) el.scrollTop = target;
    if (before.view === "gallery") el?.querySelector<HTMLElement>("[data-rule-title]")?.focus({ preventScroll: true });
    if (!el || target === 0) return;
    // A rule still laying out may clamp the write: check once, a frame later.
    const frame = requestAnimationFrame(() => {
      if (el.scrollTop < target) el.scrollTop = target;
    });
    return () => cancelAnimationFrame(frame);
  }, [view, rule, currentId]);

  const onScroll = (event: UIEvent<HTMLElement>) => {
    setScrolled(event.currentTarget.scrollTop > 0);
    if (!currentId) return;
    const id = currentId;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      // Still this rule's entry: popstate and every rule change clear the timer.
      const el = sheet.current;
      if (!el) return;
      const write = saveScroll(window.history.state, id, Math.round(el.scrollTop));
      writeHistory(write.mode, write.axiom, currentUrl(window.location));
    }, SCROLL_SAVE_MS);
  };

  /* Navigation. Opening pushes; paging replaces. */
  const openRule = useCallback(
    (id: string) => {
      peek.current?.close();
      if (id !== currentId) onOpenRule(id, "push");
    },
    [currentId, onOpenRule],
  );
  const page = useCallback(
    (direction: Direction, category = false) => {
      if (!currentId) return;
      const target = category ? sectionJump(deck, currentId, direction) : stepRule(deck, currentId, direction);
      if (target) onOpenRule(target.id, "replace");
    },
    [currentId, deck, onOpenRule],
  );
  const exit = useCallback(
    (from: InputOrigin) => {
      peek.current?.close();
      onExit(from);
    },
    [onExit],
  );
  const home = useCallback(
    (categoryId: string | null, from: InputOrigin) => {
      peek.current?.close();
      onHome(categoryId, from);
    },
    [onHome],
  );

  /* Keyboard, from the shared table: bubble phase, so fields, widgets and dialogs go first. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action = shortcutAction(event, { view, singleKeys });
      const inRule = view === "rule";
      switch (action) {
        case "next":
        case "previous":
        case "nextSection":
        case "previousSection":
          if (!inRule) return;
          page(action === "next" || action === "nextSection" ? 1 : -1, action.endsWith("Section"));
          break;
        case "inspector":
          if (!inRule) return;
          toggleInspector();
          break;
        case "escape":
          if (peek.current?.isOpen()) peek.current.close();
          else if (inRule) exit("keyboard");
          else return;
          break;
        default:
          // Enter on a tile stays native: its click reaches CatalogApp's listener.
          return;
      }
      event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view, singleKeys, page, toggleInspector, exit]);

  const api = useMemo<ShellApi>(
    () => ({
      view,
      ruleId: currentId,
      deck,
      openRule,
      page,
      exit,
      home,
      clearDeck: onClearDeck,
      hrefFor,
      peek,
      sheet,
      phone,
      scrolled,
      modKey,
      inspectorOpen,
      toggleInspector,
      singleKeys,
      inputOrigin,
      openPalette: noop,
      openShortcuts: noop,
    }),
    [view, currentId, deck, openRule, page, exit, home, onClearDeck, hrefFor, phone, scrolled, modKey, inspectorOpen, toggleInspector, singleKeys, inputOrigin],
  );

  return (
    <ShellContext.Provider value={api}>
      <div className="shell" data-view={view} style={shellVars() as CSSProperties}>
        <Rail />
        <main ref={sheet} id="main-content" className="shell-sheet" data-view={view} tabIndex={-1} onScroll={onScroll}>
          {children}
        </main>
        <p aria-live="polite" className="sr-only">
          {message}
        </p>
      </div>
    </ShellContext.Provider>
  );
}
