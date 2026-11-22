// design-system: strict
"use client";

/*
 * What a sheet's content, and the shell's own parts, can ask of the shell:
 * open a rule, page, leave for the wall, and a few facts. The rail, the
 * strip, the phone shell, the rule view and the overlays all read it through
 * `useShell()`.
 *
 * - `PeekHandle` lives here rather than in `./peek`, so the rail and the strip
 *   can hold the handle without importing the card. `peek.current` is null
 *   until the overlays mount the peek.
 * - `openPalette` and `openShortcuts` open the ⌘K palette and the shortcuts
 *   sheet through the shell's modal session, as their keys do.
 *
 * Anything the keyboard starts is 0ms: `inputOrigin()` says how the last
 * input arrived, and `exit` takes its origin explicitly, so a pointer close
 * morphs and a keyboard close cuts.
 */

import { createContext, useContext, type RefObject } from "react";

import type { Deck, Direction } from "@/lib/navigation/deck";
import type { ShellView } from "@/lib/navigation/routes";

export type InputOrigin = "pointer" | "keyboard";

/** The rule preview card beside the strip, the sidebar and Related links. */
export type PeekHandle = {
  /** The pointer or the lens is on a rule (null: a category icon). `y` is the mark's centre. */
  hover: (ruleId: string | null, y: number, options?: { instant?: boolean; group?: HTMLElement }) => void;
  leave: () => void;
  close: () => void;
  isOpen: () => boolean;
};

export type ShellApi = {
  view: ShellView;
  /** The rule on screen in the rule view; null on the wall. */
  ruleId: string | null;
  /**
   * What J/K, the pager, "n of N" and Shift+J/K page through: the wall's deck
   * when it holds the rule, else the catalog (`resolveEntryDeck`). In the
   * gallery, the wall's own deck.
   */
  deck: Deck;
  /** Open a rule from the strip, the sidebar, the palette or Related: one new history entry. */
  openRule: (id: string, source?: "related") => void;
  /** Reapply a popped entry after the deferred inspector for that rule has mounted its prose. */
  restorePanel: (id: string, panel: HTMLElement) => void;
  /** Page within the deck (replaces the entry). `category` jumps to a section's first rule. */
  page: (direction: Direction, category?: boolean) => void;
  /** Back to the wall at this rule's tile: Esc, the crumb, the phone's up button. */
  exit: (origin: InputOrigin) => void;
  /** The logo and the rail's category icons: the wall, at a category's section when given. */
  home: (categoryId: string | null, origin: InputOrigin) => void;
  /** Leave a search or collection deck for the catalog, in place. */
  clearDeck: () => void;
  /** A rule's real URL under the current base, for links that open in a new tab. */
  hrefFor: (id: string) => string;
  peek: RefObject<PeekHandle | null>;
  /** The sheet: the scroller a view should use as its IntersectionObserver root. */
  sheet: RefObject<HTMLElement | null>;
  /** Phone layout, for behaviour only. Layout itself switches in CSS. */
  phone: boolean;
  /** The sheet is scrolled: the header shows its hairline. */
  scrolled: boolean;
  /** "⌘" or "Ctrl ", for labels. */
  modKey: string;
  /** The deep dive: open until the reader hides it (axiom:deep-dive). `I` toggles it. */
  inspectorOpen: boolean;
  toggleInspector: (origin?: InputOrigin) => void;
  /** False when the reader turned single-key shortcuts off (WCAG 2.1.4). D, F and Z must check it. */
  singleKeys: boolean;
  inputOrigin: () => InputOrigin;
  /** `returnTo` takes focus when the palette closes, instead of whatever had it before. */
  openPalette: (returnTo?: HTMLElement | null) => void;
  openShortcuts: () => void;
};

export const ShellContext = createContext<ShellApi | null>(null);

export function useShell(): ShellApi {
  const api = useContext(ShellContext);
  if (!api) throw new Error("useShell() outside <Shell>");
  return api;
}
