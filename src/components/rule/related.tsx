// design-system: strict
"use client";

/*
 * Related, at the foot of the deep dive: one to three rules from the shared-tag
 * scorer (`relatedRules`), as real links that open in a new tab when
 * asked. A plain click opens the rule in place (a push). Each row carries its
 * rail category, so a re-homed Accessibility rule reads as System or Color, as
 * it does everywhere else in the shell.
 *
 * Hover and keyboard focus request a preview through the shell's peek handle
 * and warm the rule's prose. Preview requests do nothing while the handle is null.
 */

import { ChevronRight } from "lucide-react";
import { useId, type FocusEvent, type MouseEvent, type PointerEvent } from "react";

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
  const related = relatedRules(ruleId);
  if (related.length === 0) return null;

  const hover = (id: string, rect: DOMRect) => {
    proseLoader.prefetch(id);
    shell.peek.current?.hover(id, rect.top + rect.height / 2, { rect });
  };

  return (
    <section className="rv-related" aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`}>Related</h2>
      <ul>
        {related.map((rule) => {
          const category = railCategory(railCategoryOf(rule));
          return (
            <li key={rule.id}>
              <a
                className="rv-rrow"
                href={shell.hrefFor(rule.id)}
                aria-describedby={`${uid}-${rule.id}`}
                onClick={(event) => {
                  if (!plainClick(event)) return;
                  event.preventDefault();
                  shell.peek.current?.close();
                  shell.openRule(rule.id);
                }}
                onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
                  if (event.pointerType === "mouse") hover(rule.id, event.currentTarget.getBoundingClientRect());
                }}
                onPointerLeave={() => shell.peek.current?.leave()}
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
