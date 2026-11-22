// design-system: strict
"use client";

/*
 * Related, at the foot of the deep dive: one to three editorially selected
 * rules, as real links that open in a new tab when
 * asked. A plain click opens the rule in place (a push). Each row carries its
 * rail category, so a re-homed Accessibility rule reads as System or Color, as
 * it does everywhere else in the shell.
 *
 * Hover and keyboard focus request a preview through the shell's peek handle
 * and warm the rule's prose. Preview requests do nothing while the handle is null.
 */

import { ChevronRight } from "@/components/ui/icons";
import { useId, useRef, type FocusEvent, type MouseEvent, type PointerEvent } from "react";

import { useShell } from "@/components/shell/shell-context";
import { CategoryIcon } from "@/components/ui/category-icon";
import { railCategory, railCategoryOf } from "@/data/taxonomy";
import { proseLoader } from "@/lib/prose-loader";
import { relatedRules } from "@/lib/related";

/** A plain left click: anything with a modifier keeps the browser's own link behaviour. */
export const plainClick = (event: MouseEvent) =>
  !(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

export function Related({ ruleId }: { ruleId: string }) {
  const shell = useShell();
  const uid = useId();
  const group = useRef<HTMLElement>(null);
  const hoveredRow = useRef<HTMLAnchorElement | null>(null);
  const related = relatedRules(ruleId);
  if (related.length === 0) return null;

  const hover = (id: string, rect: DOMRect) => {
    proseLoader.prefetch(id);
    if (group.current) shell.peek.current?.hover(id, rect.top + rect.height / 2, { group: group.current });
  };

  return (
    <section ref={group} className="rv-related" aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`}>Related rules</h2>
      <ul>
        {related.map((rule) => {
          const category = railCategory(railCategoryOf(rule));
          return (
            <li key={rule.id}>
              <a
                className="rv-rrow"
                data-related-rule={rule.id}
                href={shell.hrefFor(rule.id)}
                aria-label={rule.title}
                aria-describedby={`${uid}-${rule.id}`}
                onClick={(event) => {
                  if (!plainClick(event)) return;
                  event.preventDefault();
                  shell.peek.current?.close();
                  shell.openRule(rule.id, "related");
                }}
                onPointerMove={(event: PointerEvent<HTMLAnchorElement>) => {
                  // Paging can put another row under a stationary cursor. Only
                  // an actual pointer move should open a peek on the new rule.
                  if (event.pointerType !== "mouse" || hoveredRow.current === event.currentTarget) return;
                  hoveredRow.current = event.currentTarget;
                  hover(rule.id, event.currentTarget.getBoundingClientRect());
                }}
                onPointerLeave={() => {
                  hoveredRow.current = null;
                  shell.peek.current?.leave();
                }}
                onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
                  if (event.currentTarget.matches(":focus-visible")) hover(rule.id, event.currentTarget.getBoundingClientRect());
                }}
                onBlur={() => shell.peek.current?.leave()}
              >
                <CategoryIcon categoryId={category.id} className="size-4" />
                <span className="rv-rrow-title">{rule.title}</span>
                <ChevronRight aria-hidden="true" className="rv-rrow-chev" />
                {/* The category and the summary the peek shows, for screen readers. */}
                <span className="sr-only" id={`${uid}-${rule.id}`}>
                  {category.short}. {rule.desc}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
