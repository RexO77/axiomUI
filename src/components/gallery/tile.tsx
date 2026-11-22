// design-system: strict

/*
 * One rule on the wall: its Do and Don't previews at 1:1 in a fixed window,
 * and its title. Server markup only: no handlers, nothing for the client to
 * render. CatalogApp's one delegated listener opens the rule; a modified or
 * middle click follows the real href.
 *
 * - The frame is aria-hidden, so the link's name is the rule's title, not the
 *   text inside two previews.
 * - The link's id, `rule-<id>`, is where focus returns on the way back from
 *   the rule, and the hash an exit writes.
 * - Both sides render; gallery.css shows the one `data-side` on <html> asks for.
 * - A motion rule's panes are its showcase scenes, held at rest by MotionTile
 *   and replayed on hover or keyboard focus.
 */

import { Play } from "@/components/ui/icons";

import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { getStaticRulePreview } from "@/components/features/rules/rule-preview";
import { VerdictLabel } from "@/components/ui/verdict-label";
import type { Rule } from "@/data/ui-logic";

import { MotionTile } from "./motion-tile";

const SIDES: readonly Variant[] = ["do", "dont"];

/** Easing rules show only the curve on a tile; the rail, numbers and axis stay in the rule view. */
const EASING = new Set(["motion-4"]);

function Pane({ rule, variant }: { rule: Rule; variant: Variant }) {
  const spec = showcaseSpecs[rule.id];
  if (!spec) return getStaticRulePreview(rule.id, variant);
  const pane = spec[variant];
  return (
    <MotionTile id={rule.id} tracks={pane.tracks} still={spec.trigger === "drag"}>
      {pane.scene()}
    </MotionTile>
  );
}

export function Tile({ rule, href }: { rule: Rule; href: string }) {
  const spec = showcaseSpecs[rule.id];
  const plays = Boolean(spec) && spec.trigger !== "drag";
  return (
    <a
      href={href}
      id={`rule-${rule.id}`}
      className="gw-tile"
      data-rule-link=""
      data-rule={rule.id}
      data-easing={EASING.has(rule.id) ? "" : undefined}
    >
      <span className="gw-frame" data-tile-frame="" aria-hidden="true">
        {SIDES.map((variant) => (
          <span key={variant} className="gw-fit" data-v={variant}>
            <Pane rule={rule} variant={variant} />
          </span>
        ))}
        {plays ? (
          <span className="gw-marker">
            <Play />
          </span>
        ) : null}
        {/* The Don't side in words as well as the ring's colour (WCAG 1.4.1). */}
        <span className="gw-verdict">
          <VerdictLabel verdict="dont" />
        </span>
      </span>
      <span className="gw-title">
        {rule.title}
      </span>
    </a>
  );
}
