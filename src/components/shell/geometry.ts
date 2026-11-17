// design-system: strict

/*
 * The shell's measured geometry, in one place.
 * Script reads the numbers; CSS reads the same numbers as custom properties
 * that the shell root emits from `shellVars()`, so the two never drift.
 *
 * Desktop: a 56px rail is the back layer, and one sheet floats over it, 8px
 * from the top, right and bottom. Expanding the rail moves the sheet's left
 * edge 184px (240 − 56), and its content reflows with the edge as it travels.
 * The sheet header is 52px under that 8px inset, so its centre, the logo
 * tile's centre and every 32px header control share y = 34.
 *
 * Phone (PHONE_QUERY): a 48px top bar over a full-width sheet, and on a rule
 * a 104px foot for the bottom strip (4 + 48 run + 44 icons + 4, on the 8
 * grid). Phones held sideways and very short screens get a 40px bar and the
 * 56px run alone.
 */

export const RAIL = 56;
export const RAIL_OPEN = 240;
/** How far the sheet's left edge travels when the rail expands. */
export const OPEN_SHIFT = RAIL_OPEN - RAIL;
/** The sheet's distance from the top, right and bottom of the viewport. */
export const SHEET_INSET = 8;
/** The sheet header's height, from the sheet's top edge. */
export const HEADER_HEIGHT = 52;
/** The one y every header row centres on: the logo tile, the sheet header, its controls. */
export const HEADER_CENTRE_Y = SHEET_INSET + HEADER_HEIGHT / 2;
/** One control height across headers. */
export const CONTROL = 32;

/** Rail expand and collapse (`--ease-drawer` open, `--ease-out-strong` close). */
export const OPEN_MS = 220;
export const CLOSE_MS = 140;

/** The strip region on the rail: under the logo row, over the three bottom rows. */
export const STRIP_TOP = 60;
export const STRIP_BOTTOM = 128;

export const PHONE_TOP = 48;
export const PHONE_FOOT = 104;
/** Sideways phones and very short screens. */
export const PHONE_TOP_SHORT = 40;
export const PHONE_FOOT_SHORT = 56;

/** The shell's reading-position save, this long after scrolling stops. */
export const SCROLL_SAVE_MS = 120;

const px = (value: number) => `${value}px`;
const ms = (value: number) => `${value}ms`;

/**
 * The custom properties `shell.css` reads, set as the shell root's style.
 * Keys are literal so the token guard and `geometry.test.ts` can see them.
 */
export function shellVars() {
  return {
    "--shell-rail": px(RAIL),
    "--shell-rail-open": px(RAIL_OPEN),
    "--shell-inset": px(SHEET_INSET),
    "--shell-open-ms": ms(OPEN_MS),
    "--shell-close-ms": ms(CLOSE_MS),
    "--shell-phone-top": px(PHONE_TOP),
    "--shell-phone-foot": px(PHONE_FOOT),
    "--shell-phone-top-short": px(PHONE_TOP_SHORT),
    "--shell-phone-foot-short": px(PHONE_FOOT_SHORT),
  } as const;
}
