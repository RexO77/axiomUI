// design-system: strict
"use client";

/*
 * The shell frame: the rail (the back layer), one sheet over it, the phone's
 * top bar and bottom strip, the modal session, the keyboard, the live region
 * and the reading position. It owns no location: CatalogApp does, and the
 * shell asks it to move through `onOpenRule`, `onExit` and `onHome`.
 *
 * - Paging replaces, opening pushes (CatalogApp writes history).
 * - The sheet and reading panel positions ride in the rule's history entry,
 *   saved after scrolling settles, and are restored only on
 *   popstate, and only for that rule. Any other rule change starts at the top.
 * - Focus moves to the rule title only when the rule view is entered from the
 *   wall. Paging leaves focus where it is and speaks through the live region
 *   instead, so nothing is announced twice.
 * - The phone layout is CSS's call (PHONE_QUERY), so the first paint is
 *   already right; `phone` only drives behaviour. Both layouts' controls are
 *   in the server HTML, and the bottom strip leaves a wide screen once
 *   hydration shows it is not needed.
 * - One modal at a time (modal.ts): the phone menu here; the palette and the
 *   shortcuts sheet mount beside it.
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

import { flushSync } from "react-dom";

import { cancelDeepDive, toggleDeepDive } from "@/components/rule/deep-dive-motion";
import { collections, railCategory, railCategoryOf, railOrder } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { PHONE_QUERY, useMediaQuery } from "@/lib/media";
import { deckPosition, sectionJump, stepRule, type Deck, type Direction } from "@/lib/navigation/deck";
import { currentUrl, readAxiomState, saveScroll, scrollToRestore, writeHistory, type AxiomScroll } from "@/lib/navigation/history";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { memoryStore, useRuleMemory } from "@/lib/navigation/memory";
import { createRoutes, type ShellView } from "@/lib/navigation/routes";

import { BottomStrip } from "./bottom-strip";
import { SCROLL_SAVE_MS, shellVars } from "./geometry";
import { InstallMenuRow, useSkillsDialog, type SkillsDialogComponent } from "./install-row";
import { useModalSession, type ModalKind } from "./modal";
import { Overlays } from "./overlays";
import { PhoneBar, usePhoneChrome } from "./phone-bar";
import { PhoneMenu } from "./phone-menu";
import { Rail } from "./rail";
import { ShellContext, type InputOrigin, type PeekHandle, type ShellApi } from "./shell-context";
import { SidebarList } from "./sidebar-list";
import { ThemeRow } from "./theme-row";
import "./shell.css";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
const never = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;
/** Controls that exist only in the phone layout: focus there has to move when the layout ends. */
const PHONE_ONLY = ".phone-bar, .bstrip";

const singleKeysSnapshot = () => memoryStore.getSnapshot().prefs.singleKeys;
const modKeySnapshot = () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl ");

/** What the live region says for a rule in a deck. */
function whereIs(deck: Deck, id: string): string {
  const rule = ruleById.get(id);
  const position = deckPosition(deck, id);
  if (!rule || !position) return rule?.title ?? "";
  const at = `${rule.title}, ${position.label}`;
  if (deck.kind === "search") return `${rule.title}, match ${position.label}`;
  if (deck.kind === "collection") return `${rule.title}, rule ${position.label}, ${collections.find((item) => item.id === deck.collection)?.name ?? ""}`;
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

  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const peek = useRef<PeekHandle>(null);
  const origin = useRef<InputOrigin>("pointer");
  const [scrolled, setScrolled] = useState(false);
  const [message, setMessage] = useState("");
  const hydrated = useSyncExternalStore(never, hydratedSnapshot, serverSnapshot);
  // hrefFor is bound to the catalog's base; the phone's links need the same routes.
  const routes = useMemo(() => createRoutes(hrefFor(railOrder[0].id).split("/rules/")[0]), [hrefFor]);

  /* The modal session: one modal at a time, focus back to whatever opened it. */
  const modal = useModalSession(sheet);
  const { open: openModal, close: closeModal, isOpen: modalOpen, returnInstead } = modal;
  const modalKind = useRef<ModalKind | null>(null);
  useLayoutEffect(() => {
    modalKind.current = modal.kind;
  }, [modal.kind]);
  const openMenu = useCallback(() => {
    peek.current?.close();
    openModal("menu");
  }, [openModal]);
  const openPalette = useCallback(
    (returnTo?: HTMLElement | null) => {
      openModal("palette");
      if (returnTo) returnInstead(returnTo);
    },
    [openModal, returnInstead],
  );
  const openShortcuts = useCallback(() => openModal("shortcuts"), [openModal]);

  /* Only the visible reading surface drives the phone chrome. */
  const onChrome = usePhoneChrome(root, phone, currentId);

  /*
   * Leaving the phone layout: the menu closes, so nothing stays inert behind a
   * hidden dialog, and its focus goes to the sheet, not the hidden Menu button.
   * Focus on a phone-only control moves to the sheet. CSS may have hidden that
   * control, or the media store's re-render removed it, before this runs, so
   * the last focus inside one is remembered.
   */
  useLayoutEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    let phoneFocus = false;
    const onFocusIn = (event: FocusEvent) => {
      phoneFocus = event.target instanceof Element && Boolean(event.target.closest(PHONE_ONLY));
    };
    const onChange = () => {
      if (query.matches) return;
      if (modalKind.current === "menu") {
        returnInstead(sheet.current);
        closeModal();
        return;
      }
      const active = document.activeElement;
      const inPhone = active instanceof Element && Boolean(active.closest(PHONE_ONLY));
      // CSS may already have blurred the hidden control to <body>.
      if (inPhone || (phoneFocus && (!active || active === document.body))) sheet.current?.focus({ preventScroll: true });
      phoneFocus = false;
    };
    document.addEventListener("focusin", onFocusIn);
    query.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      query.removeEventListener("change", onChange);
    };
  }, [closeModal, returnInstead]);

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
      // A press inside what already has focus moves no focus, so no focusin
      // follows: a field reached with / and then clicked drops its ring here.
      const focused = document.activeElement;
      if (event.type === "pointerdown" && focused && focused !== document.body && event.target instanceof Node && focused.contains(event.target)) {
        root.dataset.focusOrigin = "pointer";
      }
    };
    /* How focus last arrived, frozen at that moment: a ring marks keyboard focus
       only (globals.css). A click into a text field, or a script moving focus
       after a click, never draws one, and typing afterwards does not add one. */
    const onFocus = () => {
      root.dataset.focusOrigin = origin.current;
    };
    root.dataset.input = origin.current;
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("pointermove", onPointer, true);
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("pointermove", onPointer, true);
      document.removeEventListener("focusin", onFocus, true);
      delete root.dataset.input;
      delete root.dataset.focusOrigin;
    };
  }, []);
  const inputOrigin = useCallback(() => origin.current, []);
  const keyboardOrigin = useCallback(() => origin.current === "keyboard", []);

  /* The deep dive's hidden state on <html>: the boot script sets it before paint, this keeps it in step. */
  useEffect(() => {
    const sync = () => {
      cancelDeepDive(sheet.current?.querySelector<HTMLElement>(".rv") ?? null);
      if (deepDive.get()) delete document.documentElement.dataset.deep;
      else document.documentElement.dataset.deep = "hidden";
    };
    sync();
    return deepDive.subscribe(sync);
  }, [deepDive]);
  const toggleInspector = useCallback((origin: InputOrigin = "keyboard") => {
    toggleDeepDive(
      sheet.current?.querySelector<HTMLElement>(".rv") ?? null,
      !deepDive.get(),
      () => flushSync(() => catalogStores.setDeepDiveOpen(!deepDive.get())),
      origin === "pointer" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, [deepDive]);

  /*
   * Reading position. This listener is registered before CatalogApp's (a
   * child's effects run first), so it holds the entry's state for the commit
   * that popstate causes. A pop that lands on the same rule commits nothing,
   * and the next change is to another rule, whose id cannot match.
   */
  const popped = useRef<unknown>(undefined);
  const panelReturn = useRef<AxiomScroll | null>(null);
  const saveTimer = useRef(0);
  useEffect(() => {
    const onPop = () => {
      window.clearTimeout(saveTimer.current);
      popped.current = window.history.state;
      panelReturn.current = readAxiomState(popped.current)?.scroll ?? null;
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(saveTimer.current);
    };
  }, []);

  const restorePanel = useCallback((id: string, panel: HTMLElement) => {
    const entry = panelReturn.current;
    if (!entry || entry.id !== id) return;
    panelReturn.current = null;
    const reading = panel.querySelector<HTMLElement>(".rv-dd[data-panel-rule]");
    if (entry.panelTop && reading) reading.scrollTop = entry.panelTop;
    if (entry.relatedId) {
      panel.querySelector<HTMLElement>(`a[data-related-rule="${CSS.escape(entry.relatedId)}"]`)?.focus({ preventScroll: true });
    }
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
    const saved = readAxiomState(state)?.scroll;
    if (before.view === "gallery" && !(saved?.id === rule.id && saved.relatedId)) {
      el?.querySelector<HTMLElement>("[data-rule-title]")?.focus({ preventScroll: true });
    }
    if (!el || target === 0) return;
    // A rule still laying out may clamp the write: check once, a frame later.
    const frame = requestAnimationFrame(() => {
      if (el.scrollTop < target) el.scrollTop = target;
    });
    return () => cancelAnimationFrame(frame);
  }, [view, rule, currentId]);

  const savePosition = useCallback((relatedId?: string) => {
    const el = sheet.current;
    if (!currentId || !el) return;
    const panel = el.querySelector<HTMLElement>(".rv-dd[data-panel-rule]");
    if (panel?.dataset.panelRule !== currentId) return;
    const active = document.activeElement;
    const focused = active instanceof HTMLElement && el.contains(active) ? active.dataset.relatedRule : undefined;
    const write = saveScroll(window.history.state, currentId, Math.round(el.scrollTop), Math.round(panel.scrollTop), relatedId ?? focused);
    writeHistory(write.mode, write.axiom, currentUrl(window.location));
  }, [currentId]);

  const onScroll = (event: UIEvent<HTMLElement>) => {
    if (!currentId && event.target instanceof HTMLElement && event.target.classList.contains("shell-wall")) {
      onChrome(event.target);
      return;
    }
    if (event.target === event.currentTarget) {
      setScrolled(event.currentTarget.scrollTop > 0);
      if (currentId) onChrome(event.currentTarget);
    } else if (!(event.target instanceof HTMLElement) || event.target.dataset.panelRule !== currentId) return;
    if (!currentId) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(savePosition, SCROLL_SAVE_MS);
  };

  /* Navigation. Opening pushes; paging replaces. */
  const openRule = useCallback(
    (id: string, source?: "related") => {
      peek.current?.close();
      if (id === currentId) return;
      panelReturn.current = null;
      window.clearTimeout(saveTimer.current);
      if (currentId) savePosition(source === "related" ? id : undefined);
      onOpenRule(id, "push");
    },
    [currentId, onOpenRule, savePosition],
  );
  const page = useCallback(
    (direction: Direction, category = false) => {
      if (!currentId) return;
      panelReturn.current = null;
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
      const wall = sheet.current?.querySelector<HTMLElement>(".shell-wall");
      if (view === "gallery" && wall) onChrome(wall, true);
    },
    [onHome, onChrome, view],
  );

  /* Keyboard, from the shared table: bubble phase, so fields, widgets and dialogs go first. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // A dialog owns the keyboard while it is open: nothing pages or exits behind it.
      if (modalOpen()) return;
      // Esc from a segmented control leaves the rule: a radio group owns no keys
      // beyond the ones it moves by (keyboard.ts). A field keeps it, to leave the field first.
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
          // Phones keep the deep dive in the page and list no I key: it must not flip the desktop preference.
          if (!inRule || phone) return;
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
  }, [view, singleKeys, page, toggleInspector, exit, modalOpen, phone]);

  const api = useMemo<ShellApi>(
    () => ({
      view,
      ruleId: currentId,
      deck,
      openRule,
      restorePanel,
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
      openPalette,
      openShortcuts,
      openMenu,
    }),
    [view, currentId, deck, openRule, restorePanel, page, exit, home, onClearDeck, hrefFor, phone, scrolled, modKey, inspectorOpen, toggleInspector, singleKeys, inputOrigin, openPalette, openShortcuts, openMenu],
  );

  /* The phone menu's list: the rail's sidebar, with the gallery's search dimming what it leaves out. */
  const menuMatches = useMemo(() => (view === "gallery" && deck.kind !== "catalog" ? new Set(deck.rules.map((item) => item.id)) : null), [view, deck]);
  const openFromMenu = useCallback(
    (id: string) => {
      returnInstead(sheet.current);
      closeModal();
      openRule(id);
    },
    [returnInstead, closeModal, openRule],
  );
  /*
   * The skills dialog, from the phone menu. The menu closes at once and its
   * final close puts focus back on the menu's opener (a microtask after the
   * commit); the dialog opens a task later, from there, so that is where it
   * returns focus when it closes.
   */
  const [skillsDialog, openSkills] = useSkillsDialog();
  const installFromMenu = useCallback((dialog: SkillsDialogComponent) => {
    closeModal();
    window.setTimeout(() => openSkills(dialog), 0);
  }, [closeModal, openSkills]);
  const homeFromMenu = useCallback(
    (category: string | null, from: InputOrigin) => {
      returnInstead(sheet.current);
      closeModal();
      home(category, from);
    },
    [returnInstead, closeModal, home],
  );

  return (
    <ShellContext.Provider value={api}>
      <div ref={root} className="shell" data-view={view} data-modal={modal.kind ?? undefined} style={shellVars() as CSSProperties}>
        <Rail covered={modal.kind !== null} />
        {/* Phones: the top bar. CSS shows it only in the phone layout. */}
        <PhoneBar routes={routes} menuOpen={modal.kind === "menu"} onMenu={openMenu} />
        {/* The sheet's query container while the rail moves it on the wall (shell.css). */}
        <div className="shell-landing">
          <main ref={sheet} id="main-content" className="shell-sheet" data-view={view} tabIndex={-1} onScrollCapture={onScroll}>
            {children}
          </main>
        </div>
        {/* Phones, on a rule: the strip in the thumb zone. In the server HTML everywhere (CSS hides it on wide screens), then only where it shows. */}
        {rule && (phone || !hydrated) ? <BottomStrip ruleId={rule.id} routes={routes} onContents={openMenu} /> : null}

        {/* Modals: one at a time, through the session. */}
        {modal.kind === "menu" ? (
          <PhoneMenu
            session={modal}
            routes={routes}
            ruleId={currentId}
            onRule={openFromMenu}
            onHome={homeFromMenu}
            onClose={closeModal}
            foot={
              <>
                <InstallMenuRow onOpen={installFromMenu} />
                <ThemeRow expanded keyboard={keyboardOrigin} />
              </>
            }
          >
            <SidebarList ruleId={currentId} currentCat={currentId ? railCategoryOf(currentId) : null} matches={menuMatches} touch routes={routes} onOpen={openFromMenu} />
          </PhoneMenu>
        ) : null}
        <Overlays session={modal} />
        {skillsDialog}

        <p aria-live="polite" className="sr-only">
          {message}
        </p>
      </div>
    </ShellContext.Provider>
  );
}
