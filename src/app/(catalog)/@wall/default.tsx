// design-system: strict

/**
 * Every catalog URL but the gallery: no wall in the HTML. A rule loaded
 * directly fills the slot on its first exit, with one router replace to the
 * gallery URL. Never delete this file: a named slot without a default can
 * fail the build.
 */
export default function NoWall() {
  return null;
}
