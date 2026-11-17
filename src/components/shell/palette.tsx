// design-system: strict
"use client";

/*
 * ⌘K: search every rule. An ARIA 1.2 combobox: focus stays in the input and
 * `aria-activedescendant` moves through a grouped listbox.
 *
 * - Empty, it lists Recent, then all rules under the seven rail categories,
 *   opened on the current rule.
 * - Typing runs the site's ranked search (`searchRules`): the best match
 *   first, then the rest grouped by rail category, every group and row in
 *   relevance order.
 * - A preview beside the list follows the active row, a beat behind it, so
 *   arrowing through rows never waits on a still.
 * - Enter opens the rule; Shift+Enter or Show all matches filters the wall.
 *   While an input method is composing, Enter, the arrows and PageUp/PageDown
 *   belong to the composition.
 *
 * It opens and closes at 0ms. It is one of the shell's modals (modal.ts):
 * the rest of the page is inert, Tab wraps inside it, Esc is its own, and
 * the session returns focus. On phones it fills the screen, with a Cancel
 * button in place of the key hints.
 */

import { CornerDownLeft, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { StillPair } from "@/components/rule/still";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Kbd } from "@/components/ui/kbd";
import { railCategories, railCategory, railCategoryOf } from "@/data/taxonomy";
import { rules, type Rule } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { searchRules, type MatchReason } from "@/lib/rule-search";

import { trapTab, useModal, type ModalSession } from "./modal";

/** The preview trails the active row by this much. */
const PREVIEW_MS = 80;
/** PageUp and PageDown move this many rows. */
const PAGE_ROWS = 8;

type Option = { key: string; rule: Rule; note?: string };
type Group = { key: string; label: string; options: Option[] };

/** A note only where the row's own text doesn't explain the match. */
function noteFor(reasons: readonly MatchReason[]): string | undefined {
  const top = reasons[0];
  return top && (top.field === "synonym" || top.field === "id") ? top.label : undefined;
}

const option = (group: string, rule: Rule, note?: string): Option => ({ key: `${group}:${rule.id}`, rule, note });

export function paletteGroups(query: string, recent: readonly Rule[]): Group[] {
  if (!query.trim()) {
    const all = railCategories.map((category) => ({
      key: category.id,
      label: category.short,
      options: category.rules.map((rule) => option(category.id, rule)),
    }));
    return recent.length ? [{ key: "recent", label: "Recent", options: recent.map((rule) => option("recent", rule)) }, ...all] : all;
  }
  const [best, ...rest] = searchRules(query);
  if (!best) return [];
  // A Map keeps first-seen order: groups line up by their best hit, rows by their own rank.
  const byCategory = new Map<string, Group>();
  for (const hit of rest) {
    const category = railCategory(railCategoryOf(hit.rule));
    const group = byCategory.get(category.id) ?? { key: category.id, label: category.short, options: [] };
    group.options.push(option(category.id, hit.rule, noteFor(hit.reasons)));
    byCategory.set(category.id, group);
  }
  const bestNote = noteFor(best.reasons) ?? railCategory(railCategoryOf(best.rule)).short;
  return [{ key: "best", label: "Best match", options: [option("best", best.rule, bestNote)] }, ...byCategory.values()];
}

/** A keycap whose glyph is read aloud as words: <kbd> takes no aria-label. */
function Key({ glyph, spoken, off = false, children }: { glyph?: string; spoken: string; off?: boolean; children?: ReactNode }) {
  return (
    <Kbd data-off={off}>
      <span aria-hidden="true">{children ?? glyph}</span>
      <span className="sr-only">{spoken}</span>
    </Kbd>
  );
}

export type PaletteProps = {
  session: Pick<ModalSession, "isOpen" | "returnTo">;
  currentId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  /** Shift+Enter: show this query's matches on the wall. */
  onSearch: (query: string) => void;
};

export function Palette({ session, currentId, onClose, onOpen, onSearch }: PaletteProps) {
  const uid = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useModal(dialog, session);

  const [recent] = useState(catalogStores.readRecent);
  const [query, setQuery] = useState("");
  const groups = useMemo(() => paletteGroups(query, recent), [query, recent]);
  const flat = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const [active, setActive] = useState<string | null>(() => {
    const current = currentId ? flat.find((entry) => entry.rule.id === currentId && !entry.key.startsWith("recent:")) : null;
    return current?.key ?? flat[0]?.key ?? null;
  });
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActive(flat[0]?.key ?? null);
  }
  const activeRule = flat.find((entry) => entry.key === active)?.rule ?? null;
  const optionId = (key: string) => `${uid}-${key.replace(":", "-")}`;

  const [preview, setPreview] = useState<Rule | null>(activeRule);
  useEffect(() => {
    const timer = setTimeout(() => setPreview(activeRule), PREVIEW_MS);
    return () => clearTimeout(timer);
  }, [activeRule]);

  /* Opening, the current row comes to the middle of the list; after that, the least scroll. */
  const scrolled = useRef(false);
  useEffect(() => {
    if (!active) return;
    const row = list.current?.querySelector<HTMLElement>(`[id="${CSS.escape(optionId(active))}"]`);
    row?.scrollIntoView({ block: scrolled.current ? "nearest" : "center" });
    scrolled.current = true;
    // optionId is derived from uid, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const move = (step: number) => {
    if (!flat.length) return;
    const at = flat.findIndex((entry) => entry.key === active);
    const next = Math.max(0, Math.min(flat.length - 1, (at < 0 ? 0 : at) + step));
    setActive(flat[next].key);
  };
  const q = query.trim();
  const count = flat.length;
  const status = q ? (count ? `${count} ${count === 1 ? "rule" : "rules"}` : `No rules match “${q}”`) : "";

  return (
    <>
      <div data-scrim="" className="overlay-scrim" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        data-shell-modal=""
        aria-label="Search rules"
        tabIndex={-1}
        className="palette"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            onClose();
            return;
          }
          trapTab(event, event.currentTarget);
        }}
      >
        <div className="palette-input">
          <Search aria-hidden="true" />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={active ? optionId(active) : undefined}
            aria-autocomplete="list"
            aria-label={`Search ${rules.length} rules`}
            aria-describedby={`${uid}-keys`}
            placeholder={`Search ${rules.length} rules`}
            value={query}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="go"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Every key belongs to the composition while an input method is composing.
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                move(event.key === "ArrowDown" ? 1 : -1);
              } else if (event.key === "PageDown" || event.key === "PageUp") {
                event.preventDefault();
                move(event.key === "PageDown" ? PAGE_ROWS : -PAGE_ROWS);
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (event.shiftKey) {
                  if (q) onSearch(q);
                } else if (activeRule) onOpen(activeRule.id);
              }
            }}
          />
          <button type="button" className="palette-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
        {q && count > 0 ? (
          <div className="palette-search-actions">
            <button type="button" className="palette-show-matches" onClick={() => onSearch(q)}>
              Show all {count} {count === 1 ? "match" : "matches"}
            </button>
          </div>
        ) : null}
        <div className="palette-body" data-empty={count ? undefined : ""}>
          <div ref={list} id={`${uid}-list`} role="listbox" aria-label="Rules" className="palette-list">
            {groups.map((group) => (
              <div key={group.key} role="group" aria-labelledby={`${uid}-${group.key}`}>
                <div id={`${uid}-${group.key}`} role="presentation" className="palette-group">
                  {group.label}
                </div>
                {group.options.map(({ key, rule, note }) => (
                  <div
                    key={key}
                    id={optionId(key)}
                    role="option"
                    aria-selected={key === active}
                    className="palette-option"
                    onPointerMove={() => key !== active && setActive(key)}
                    // Focus stays in the input.
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => onOpen(rule.id)}
                  >
                    <CategoryIcon categoryId={railCategoryOf(rule)} className="size-4" />
                    <span className="palette-option-title">{rule.title}</span>
                    {rule.id === currentId ? <small>Current</small> : note ? <small>{note}</small> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {count === 0 ? (
            <p className="palette-empty">
              No rules match “{q}”. Try one word, like “tracking”.
            </p>
          ) : (
            <div className="palette-preview" aria-hidden="true">
              {activeRule ? (
                <>
                  <div className="palette-preview-head">
                    <p className="palette-preview-category">{railCategory(railCategoryOf(activeRule)).name}</p>
                    <p className="palette-preview-title">{activeRule.title}</p>
                    <p className="palette-preview-summary">{activeRule.desc}</p>
                  </div>
                  {preview ? <StillPair key={preview.id} rule={preview} /> : null}
                </>
              ) : null}
            </div>
          )}
        </div>
        <div className="palette-foot" id={`${uid}-keys`}>
          <span>
            <Key glyph="↑" spoken="Up arrow" />
            <Key glyph="↓" spoken="Down arrow" /> Move
          </span>
          <span>
            <Key spoken="Enter">
              <CornerDownLeft className="size-3" />
            </Key>{" "}
            Open
          </span>
          <span data-off={q ? undefined : ""}>
            <Key glyph="⇧" spoken="Shift" off={!q} />
            <Key spoken="Enter" off={!q}>
              <CornerDownLeft className="size-3" />
            </Key>{" "}
            Show all matches
            {q ? null : <span className="sr-only">, after you type a search</span>}
          </span>
          <span className="palette-foot-end">
            <Kbd>Esc</Kbd> Close
          </span>
        </div>
        <p role="status" className="sr-only">
          {status}
        </p>
      </div>
    </>
  );
}
