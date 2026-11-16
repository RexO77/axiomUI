// design-system: strict
"use client";

import { memo, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { accessibilityCollection, railCategories, type RailCategory } from "@/data/taxonomy";
import { useVisited } from "@/lib/catalog/stores";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import type { PeekHandle } from "./shell-context";

const RUN_PITCH = 6;

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

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    const category = target.closest<HTMLLIElement>("li[data-category]");
    const button = category?.querySelector<HTMLButtonElement>(".rail-catrow");
    const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(".rail-catrow, .rail-rulerow")];
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
                  <div key={group.label ?? "all"}>
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
                            <span className="rail-rowdot" aria-hidden="true" />{rule.title}
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
        <li className="rail-collection">
          <a className="rail-catrow" href={routes.galleryHref({ collection: accessibilityCollection.id })}>
            <CategoryIcon categoryId="accessibility" />
            <span>{accessibilityCollection.name} · {accessibilityCollection.ruleIds.length}</span>
          </a>
        </li>
      </ul>
    </div>
  );
}, skipWhileHidden);
