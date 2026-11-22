// design-system: strict
"use client";

import { memo, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { collections, railCategories, type RailCategory } from "@/data/taxonomy";
import { useVisited } from "@/lib/catalog/stores";
import { prefersReducedMotion } from "@/lib/media";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { useWall, wallDefaults } from "@/components/gallery/wall-context";
import { useShell, type InputOrigin, type PeekHandle } from "./shell-context";

const RUN_PITCH = 6;
/** --ease-out-strong; WAAPI cannot read a custom property. */
const EASE_OUT_STRONG = "cubic-bezier(0.23, 1, 0.32, 1)";

function MiniRun({ section, ruleId, visited, matches, peek, touch, routes, onOpen }: {
  section: RailCategory;
  ruleId: string | null;
  visited: ReadonlySet<string>;
  matches: ReadonlySet<string> | null;
  peek?: RefObject<PeekHandle | null>;
  touch: boolean;
  routes: CatalogRoutes;
  onOpen: (id: string) => void;
}) {
  const run = useRef<HTMLDivElement>(null);
  const hot = useRef(-1);
  const setHot = (index: number) => {
    const dots = run.current?.children;
    if (!dots || index === hot.current) return;
    if (hot.current >= 0) delete (dots[hot.current] as HTMLElement).dataset.hot;
    if (index >= 0) (dots[index] as HTMLElement).dataset.hot = "";
    hot.current = index;
  };
  return (
    <div
      ref={run}
      className="rail-minirun"
      style={{ width: section.rules.length * RUN_PITCH }}
      onPointerMove={touch ? undefined : (event) => {
        if (event.pointerType !== "mouse" || !run.current) return;
        const bounds = run.current.getBoundingClientRect();
        const index = Math.max(0, Math.min(section.rules.length - 1, Math.floor((event.clientX - bounds.left) / RUN_PITCH)));
        setHot(index);
        peek?.current?.hover(section.rules[index].id, bounds.top + bounds.height / 2);
      }}
      onPointerLeave={() => { setHot(-1); peek?.current?.leave(); }}
    >
      {section.rules.map((rule) => (
        <a
          key={rule.id}
          href={routes.ruleHref(rule.id)}
          tabIndex={-1}
          aria-label={rule.title}
          className="rail-minidot"
          data-current={rule.id === ruleId ? "" : undefined}
          data-visited={rule.id !== ruleId && visited.has(rule.id) ? "" : undefined}
          data-dim={matches && !matches.has(rule.id) ? "" : undefined}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            peek?.current?.close();
            onOpen(rule.id);
          }}
        />
      ))}
    </div>
  );
}

type ListProps = {
  ruleId: string | null;
  currentCat: string | null;
  matches?: ReadonlySet<string> | null;
  peek?: RefObject<PeekHandle | null>;
  hidden?: boolean;
  touch?: boolean;
  routes: CatalogRoutes;
  onOpen: (id: string) => void;
};

const skipWhileHidden = (a: ListProps, b: ListProps) => Boolean(a.hidden && b.hidden) ||
  (a.ruleId === b.ruleId && a.currentCat === b.currentCat && a.matches === b.matches &&
    a.peek === b.peek && a.hidden === b.hidden && a.touch === b.touch && a.routes === b.routes && a.onOpen === b.onOpen);

/*
 * Collections narrow the wall to a cross-category subset, so they are
 * settings, not sections: "Show only" switches under the categories, one per
 * collection (taxonomy.ts). One is on at a time (the wall holds one
 * collection), and switching one on from a rule goes back to the wall first
 * and filters it there, as search does.
 */
function ShowOnly({ prefix, routes }: { prefix: string; routes: CatalogRoutes }) {
  const wall = useWall();
  const { view, exit } = useShell();
  const apply = (collection: string | null, origin: InputOrigin) => {
    if (wall.setFilter === wallDefaults.setFilter) {
      window.location.assign(routes.galleryHref(collection ? { collection } : {}));
      return;
    }
    // Like the wall's own collection links: the wall starts at the top and announces the result.
    if (view === "gallery") {
      wall.setFilter({ q: "", collection }, { reveal: true });
      return;
    }
    wall.queueFilter({ q: "", collection }, { reveal: true });
    exit(origin);
  };
  return (
    <>
      <p className="rail-showonly-label" id={`${prefix}-showonly`}>Show only</p>
      <ul aria-labelledby={`${prefix}-showonly`}>
        {collections.map((collection) => {
          const on = wall.collection === collection.id && !wall.q.trim();
          return (
            <li key={collection.id}>
              <button type="button" role="switch" aria-checked={on} className="rail-switchrow"
                aria-label={`${collection.name}, ${collection.ruleIds.length} rules`}
                onClick={(event) => apply(on ? null : collection.id, event.detail === 0 ? "keyboard" : "pointer")}>
                <CategoryIcon categoryId={collection.id} />
                <span>{collection.name}</span>
                <span className="rail-count" aria-hidden="true">{collection.ruleIds.length}</span>
                <span className="rail-switch" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The expanded rail and the phone menu. */
export const SidebarList = memo(function SidebarList({
  ruleId, currentCat, matches = null, peek, hidden, touch = false, routes, onOpen,
}: ListProps) {
  const visited = useVisited();
  const prefix = useId();
  const [openCat, setOpenCat] = useState(currentCat ?? "");
  const [lastCat, setLastCat] = useState(currentCat);
  if (lastCat !== currentCat) {
    setLastCat(currentCat);
    setOpenCat(currentCat ?? "");
  }
  const scroller = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  /** The row that last held focus here: a page turn across categories can unmount it. */
  const focused = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element || hidden) { shown.current = false; return; }
    const base = element.getBoundingClientRect().top - element.scrollTop;
    const y = (row: Element) => row.getBoundingClientRect().top - base;
    const current = element.querySelector<HTMLElement>('[aria-current="page"]');
    const category = element.querySelector<HTMLElement>('[aria-expanded="true"]');
    const opening = !shown.current;
    shown.current = true;
    const fold = element.clientHeight - 32;
    if (opening && category) {
      let top = y(category) - 8;
      if (current && y(current) + current.offsetHeight > top + fold) {
        const need = y(current) + current.offsetHeight - fold;
        for (const row of element.querySelectorAll<HTMLElement>(".rail-catrow, .rail-sublabel, .rail-rulerow")) {
          if (y(row) - 8 >= need) { top = y(row) - 8; break; }
        }
      }
      element.scrollTop = Math.max(0, top);
    } else {
      const row = current ?? category;
      if (!row) return;
      const top = y(row);
      if (top < element.scrollTop + 12) element.scrollTop = top - 48;
      else if (top + row.offsetHeight > element.scrollTop + fold) element.scrollTop = top + row.offsetHeight - fold + 24;
    }
    element.toggleAttribute("data-scrolled", element.scrollTop > 0);
  }, [ruleId, openCat, hidden]);

  /*
   * J/K across a category boundary closes the run the focused rule sat in.
   * Focus would fall to the document; it moves to the new current rule (or
   * its category) instead, so the reader keeps their place in the list.
   */
  useLayoutEffect(() => {
    const element = scroller.current;
    const lost = focused.current;
    if (!element || hidden || !lost || lost.isConnected) return;
    focused.current = null;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    const row = element.querySelector<HTMLElement>('[aria-current="page"]') ?? element.querySelector<HTMLElement>('[aria-expanded="true"]');
    row?.focus({ preventScroll: true });
  }, [ruleId, openCat, hidden]);

  /*
   * A category opening or closing: its block eases from the height it had to
   * its new one, so the categories under it glide rather than jump, and the
   * rules it now lists fade in down the list. Runs after the scroll effects,
   * which read the final layout. Heights are re-read on every render, so a
   * filter or a visit never leaves a stale starting height. Keyboard and
   * reduced-motion changes are instant.
   */
  const heights = useRef(new Map<string, number>());
  /** Height animations still running, by category, with the height each is heading for. */
  const easing = useRef(new Map<string, { animation: Animation; to: number }>());
  const lastOpen = useRef(openCat);
  useLayoutEffect(() => {
    const element = scroller.current;
    const previous = lastOpen.current;
    lastOpen.current = openCat;
    const blocks = element ? [...element.querySelectorAll<HTMLElement>("li[data-category] > div")] : [];
    const idOf = (block: HTMLElement) => block.parentElement?.dataset.category ?? "";
    const toggled = previous !== openCat;
    // A block still easing from the last toggle shows its animated height,
    // which is where a reversal starts. Read it, then cancel that animation
    // (instant toggles included) so the new content's natural height can be
    // measured rather than the animation's.
    const shown = new Map<string, number>();
    if (toggled) for (const block of blocks) {
      const live = easing.current.get(idOf(block));
      if (!live) continue;
      shown.set(idOf(block), block.getBoundingClientRect().height);
      live.animation.cancel();
      easing.current.delete(idOf(block));
    }
    const was = heights.current;
    // An animation still running on a re-render reports its frame, not where the block is going.
    heights.current = new Map(blocks.map((block) => [idOf(block), easing.current.get(idOf(block))?.to ?? block.offsetHeight]));
    if (hidden || !toggled || prefersReducedMotion() || document.documentElement.dataset.input === "keyboard") return;
    for (const block of blocks) {
      const id = idOf(block);
      if (id !== openCat && id !== previous) continue;
      const from = shown.get(id) ?? was.get(id);
      const to = heights.current.get(id);
      if (from === undefined || to === undefined || Math.abs(from - to) < 1) continue;
      const animation = block.animate([{ height: `${from}px`, overflow: "clip" }, { height: `${to}px`, overflow: "clip" }], { duration: 240, easing: EASE_OUT_STRONG });
      easing.current.set(id, { animation, to });
      animation.addEventListener("finish", () => {
        if (easing.current.get(id)?.animation === animation) easing.current.delete(id);
      });
      if (id !== openCat) continue;
      block.querySelectorAll<HTMLElement>(".rail-sublabel, .rail-rulerow").forEach((row, index) => {
        // Opacity only: each row draws its own piece of the trunk, which must stay in line.
        row.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200, delay: Math.min(index, 10) * 16, easing: EASE_OUT_STRONG, fill: "backwards",
        });
      });
    }
  });

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    const category = target.closest<HTMLLIElement>("li[data-category]");
    const button = category?.querySelector<HTMLButtonElement>(".rail-catrow");
    const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(".rail-catrow, .rail-rulerow, .rail-switchrow")];
    const at = rows.indexOf(target);
    if (at < 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : Math.max(0, Math.min(rows.length - 1, at + (event.key === "ArrowDown" ? 1 : -1)));
      rows[next].focus();
    } else if (event.key === "ArrowRight" && button) {
      if (button.getAttribute("aria-expanded") === "true") category?.querySelector<HTMLElement>(".rail-rulerow")?.focus();
      else setOpenCat(category?.dataset.category ?? "");
    } else if (event.key === "ArrowLeft" && button) {
      // Hand off before the focused rule is removed by the disclosure.
      button.focus({ preventScroll: true });
      setOpenCat("");
    } else return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div ref={scroller} className="rail-list" inert={hidden} onKeyDown={onKey}
      onFocus={(event) => { focused.current = event.target as HTMLElement; }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        // A row removed while focused blurs too, still connected; only one still
        // in the list afterwards was left by the reader.
        const left = event.target as HTMLElement;
        queueMicrotask(() => { if (left.isConnected && focused.current === left) focused.current = null; });
      }}
      onScroll={(event) => event.currentTarget.toggleAttribute("data-scrolled", event.currentTarget.scrollTop > 0)}>
      <ul>
        {railCategories.map((section) => {
          const listed = openCat === section.id;
          const count = matches ? section.rules.filter((rule) => matches.has(rule.id)).length : section.rules.length;
          return (
            <li key={section.id} data-category={section.id}>
              <button type="button" className="rail-catrow" aria-expanded={listed}
                aria-controls={`${prefix}-${section.id}`} data-active={currentCat === section.id ? "" : undefined}
                data-dim={matches && count === 0 ? "" : undefined}
                aria-label={matches ? `${section.short}, ${count} of ${section.rules.length} rules match` : `${section.short}, ${count} rules`}
                onClick={() => setOpenCat(listed ? "" : section.id)}>
                <CategoryIcon categoryId={section.id} />
                <span>{section.short}</span>
                <span className="rail-count" aria-hidden="true">{count}</span>
              </button>
              <div id={`${prefix}-${section.id}`}>
                {listed ? section.groups.map((group, index) => (
                  <div key={group.label ?? "all"} className="rail-group">
                    {group.label ? <p className="rail-sublabel" id={`${prefix}-${section.id}-${index}`}>{group.label}</p> : null}
                    <ul aria-labelledby={group.label ? `${prefix}-${section.id}-${index}` : undefined}
                      aria-label={group.label ? undefined : `${section.short} rules`}>
                      {group.rules.map((rule) => (
                        <li key={rule.id}>
                          <a href={routes.ruleHref(rule.id)} className="rail-rulerow" aria-current={rule.id === ruleId ? "page" : undefined}
                            data-visited={rule.id !== ruleId && visited.has(rule.id) ? "" : undefined}
                            data-dim={matches && !matches.has(rule.id) ? "" : undefined}
                            onClick={(event) => {
                              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                              event.preventDefault();
                              peek?.current?.close();
                              onOpen(rule.id);
                            }}
                            onPointerEnter={(event) => {
                              if (touch || event.pointerType !== "mouse") return;
                              const bounds = event.currentTarget.getBoundingClientRect();
                              peek?.current?.hover(rule.id, bounds.top + bounds.height / 2);
                            }}
                            onPointerLeave={() => peek?.current?.leave()}
                            onFocus={(event) => {
                              if (touch || !event.currentTarget.matches(":focus-visible")) return;
                              const bounds = event.currentTarget.getBoundingClientRect();
                              peek?.current?.hover(rule.id, bounds.top + bounds.height / 2);
                            }} onBlur={() => peek?.current?.leave()}>
                            <span className="rail-rowtitle"><span className="rail-branch" aria-hidden="true" />{rule.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )) : <MiniRun section={section} ruleId={ruleId} visited={visited} matches={matches} peek={peek} touch={touch} routes={routes} onOpen={onOpen} />}
              </div>
            </li>
          );
        })}
        <li className="rail-showonly">
          <ShowOnly prefix={prefix} routes={routes} />
        </li>
      </ul>
    </div>
  );
}, skipWhileHidden);
