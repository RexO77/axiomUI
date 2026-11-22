// design-system: strict
"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { useWall } from "@/components/gallery/wall-context";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Check, ChevronDown, LayoutGrid } from "@/components/ui/icons";
import { railCategories, railCategoryOf, railOrder } from "@/data/taxonomy";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { trapTab, useModal, type ModalSession } from "./modal";

type PhoneMenuProps = {
  session: Pick<ModalSession, "isOpen" | "returnTo">;
  routes: CatalogRoutes;
  ruleId: string | null;
  onRule: (id: string) => void;
  onHome: (category: string | null, origin: "pointer" | "keyboard") => void;
  onClose: () => void;
  children: ReactNode;
  foot: ReactNode;
};

/** The jump sheet shares the rail's full rule list, filters and settings. */
export function PhoneMenu({ session, routes, ruleId, onRule, onHome, onClose, children, foot }: PhoneMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [browse, setBrowse] = useState(false);
  const wall = useWall();
  const filtered = Boolean(wall.q.trim() || wall.collection);
  const current = ruleId ? railCategoryOf(ruleId) : null;
  useModal(panel, session);
  useLayoutEffect(() => {
    panel.current?.querySelector<HTMLElement>(".phone-jump")?.focus({ preventScroll: true });
  }, []);

  function jump(event: MouseEvent<HTMLAnchorElement>, category: string | null, firstRule?: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // A filtered wall can lack this destination entirely. The canonical link
    // loads the complete catalog and lands on the requested section or rule.
    if (filtered && (ruleId || category)) return;
    event.preventDefault();
    if (filtered) wall.setFilter({ q: "", collection: null });
    if (ruleId && firstRule) onRule(firstRule);
    else onHome(category, event.detail === 0 ? "keyboard" : "pointer");
  }

  return (
    <>
      <div data-scrim="" className="phone-scrim" aria-hidden="true" onClick={onClose} />
      <div ref={panel} className="phone-menu" role="dialog" aria-modal="true" data-shell-modal="" aria-label="Rules menu"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const rows = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>(".phone-jump")];
            const index = rows.indexOf(document.activeElement as HTMLAnchorElement);
            if (index < 0) return;
            event.preventDefault();
            rows[(index + rows.length + (event.key === "ArrowDown" ? 1 : -1)) % rows.length].focus();
          } else trapTab(event, event.currentTarget);
        }}>
        <nav aria-label="Jump to">
          <a href={routes.galleryHref({ show: wall.show })} className="phone-jump"
            aria-current={!ruleId && !filtered ? "page" : undefined} onClick={(event) => jump(event, null)}>
            <LayoutGrid aria-hidden="true" />
            <span>All rules</span>
            <span className="phone-jump-count">{railOrder.length}</span>
          </a>
          <div className="phone-menu-divider" />
          {railCategories.map((category) => (
            <a key={category.id} className="phone-jump"
              href={ruleId ? routes.ruleHref(category.rules[0].id) : routes.galleryHref({ show: wall.show, hash: category.id })}
              onClick={(event) => jump(event, category.id, category.rules[0].id)}>
              <CategoryIcon categoryId={category.id} className="size-5" />
              <span>{category.short}</span>
              {current === category.id ? <Check aria-label="Current category" className="phone-jump-check" /> : null}
              <span className="phone-jump-count">{category.rules.length}</span>
            </a>
          ))}
        </nav>
        <div className="phone-menu-divider" />
        <button type="button" className="phone-browse" aria-expanded={browse} onClick={() => setBrowse(!browse)}>
          Browse rules and filters <ChevronDown aria-hidden="true" />
        </button>
        {browse ? children : null}
        <div className="phone-menu-foot">{foot}</div>
        <button type="button" className="phone-browse" onClick={onClose}>Close menu</button>
      </div>
    </>
  );
}
