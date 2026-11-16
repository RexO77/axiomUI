// design-system: strict
import { notFound } from "next/navigation";

import { railCategory, railCategoryIds } from "@/data/taxonomy";
import { createRoutes } from "@/lib/navigation/routes";
import { STAGING_BASE, stagingEnabled } from "@/lib/staging";

const routes = createRoutes(STAGING_BASE);

/**
 * A temporary wall for staging, until the full gallery replaces it:
 * the 105 rules as real links in the seven rail sections, server-rendered at
 * the gallery URL only. Each section's id is its bare category id, so
 * `/staging#typography` works without script; each tile's id is `rule-<id>`,
 * the hash an exit returns to. CatalogApp's one delegated listener opens them.
 */
export default function StagingWall() {
  // A slot renders beside the layout, so the layout's guard does not stop it.
  if (!stagingEnabled()) notFound();
  return (
    <div data-wall className="px-6 pt-6 pb-16">
      <h1 className="font-serif text-[28px]/9 font-semibold tracking-[-0.02em] text-ink">All rules</h1>
      <p className="mt-1 text-sm text-ink-muted">Staging placeholder for the gallery wall.</p>
      {railCategoryIds.map((id) => {
        const category = railCategory(id);
        return (
          <section key={id} id={id} aria-labelledby={`${id}-heading`} className="mt-10">
            <h2 id={`${id}-heading`} className="font-sans text-sm font-semibold text-ink">
              {category.name} <span className="font-normal text-ink-muted tabular-nums">{category.rules.length}</span>
            </h2>
            <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {category.rules.map((rule) => (
                <li key={rule.id}>
                  <a
                    id={`rule-${rule.id}`}
                    href={routes.ruleHref(rule.id)}
                    data-rule-link
                    className="block rounded-control p-2 transition-colors hover:bg-hover"
                  >
                    <span data-tile-frame aria-hidden="true" className="block aspect-[4/3] rounded-frame bg-sunken ring-1 ring-line ring-inset" />
                    <span data-tile-title className="mt-2.5 block text-[13px] leading-5 font-medium text-ink">
                      {rule.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
