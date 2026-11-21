/**
 * Every rule with motion now renders through the WAAPI showcase system:
 * - Grid cards: `PanePreview` (autoplay once on view, replay on hover).
 * - Deep dives (drawer + /rules/[id]): `MotionShowcase` — one control or
 *   gesture drives the Do and Don't panes side by side, in sync.
 * - motion-18/19/20 render real drag prototypes (drag-showcases.tsx).
 *
 * `hasShowcase` is re-exported from showcase-specs (a shared module) so
 * server components can call it — client-module functions cannot run on
 * the server.
 */
export { hasShowcase, showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
export { MotionShowcase, PanePreview } from "@/components/features/rules/demos/motion-showcase";
