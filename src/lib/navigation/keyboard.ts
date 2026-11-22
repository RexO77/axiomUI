import type { ShellView } from "./routes";

export type ShortcutAction =
  | "palette" | "filter" | "sidebar" | "next" | "previous"
  | "nextSection" | "previousSection" | "openTile" | "side"
  | "flip" | "zoom" | "measure" | "inspector" | "escape" | "shortcuts";

export type Shortcut = {
  keys: readonly string[];
  label: string;
  gallery: string;
  rule: string;
  action: Partial<Record<ShellView, ShortcutAction>>;
  shift?: boolean;
  command?: boolean;
  toggle?: boolean;
};

/** The shortcuts sheet and dispatcher share this table. Empty actions stay native. */
export const shortcuts: readonly Shortcut[] = [
  { keys: ["k"], label: "⌘K / Ctrl+K", gallery: "Search", rule: "Search", action: { gallery: "palette", rule: "palette" }, command: true, toggle: true },
  { keys: ["/"], label: "/", gallery: "Search", rule: "Search", action: { gallery: "filter", rule: "palette" }, toggle: true },
  { keys: ["["], label: "[", gallery: "Toggle sidebar", rule: "Toggle sidebar", action: { gallery: "sidebar", rule: "sidebar" }, toggle: true },
  { keys: ["j"], label: "J", gallery: "Next rule", rule: "Next rule", action: { gallery: "next", rule: "next" }, shift: false },
  { keys: ["k"], label: "K", gallery: "Previous rule", rule: "Previous rule", action: { gallery: "previous", rule: "previous" }, shift: false },
  { keys: ["j"], label: "⇧J", gallery: "Next section", rule: "Next section", action: { gallery: "nextSection", rule: "nextSection" }, shift: true },
  { keys: ["k"], label: "⇧K", gallery: "Previous section", rule: "Previous section", action: { gallery: "previousSection", rule: "previousSection" }, shift: true },
  { keys: ["ArrowLeft"], label: "←", gallery: "", rule: "Previous rule", action: { rule: "previous" } },
  { keys: ["ArrowRight"], label: "→", gallery: "", rule: "Next rule", action: { rule: "next" } },
  { keys: ["ArrowUp", "ArrowDown"], label: "↑ / ↓", gallery: "Scroll", rule: "Scroll", action: {} },
  { keys: ["Enter"], label: "Enter", gallery: "Open rule", rule: "", action: { gallery: "openTile" } },
  { keys: ["d"], label: "D", gallery: "Switch between Do and Don’t", rule: "", action: { gallery: "side" }, toggle: true },
  { keys: ["f"], label: "F", gallery: "", rule: "Cycle through Both, Do and Don’t (static comparisons)", action: { rule: "flip" }, toggle: true },
  { keys: ["z"], label: "Z", gallery: "", rule: "Toggle 2× zoom (static comparisons)", action: { rule: "zoom" }, toggle: true },
  { keys: ["m"], label: "M", gallery: "", rule: "Toggle Measure (static comparisons)", action: { rule: "measure" }, toggle: true },
  { keys: ["i"], label: "I", gallery: "", rule: "Toggle deep dive", action: { rule: "inspector" }, toggle: true },
  { keys: ["Escape"], label: "Esc", gallery: "Clear search or collection filter", rule: "Close an overlay, exit Measure, or return to the rule list", action: { gallery: "escape", rule: "escape" } },
  { keys: ["?"], label: "?", gallery: "Shortcuts", rule: "Shortcuts", action: { gallery: "shortcuts", rule: "shortcuts" }, toggle: true },
  { keys: ["/"], label: "⌘/ / Ctrl+/", gallery: "Shortcuts", rule: "Shortcuts", action: { gallery: "shortcuts", rule: "shortcuts" }, command: true, toggle: true },
];

/**
 * Fields and composite widgets own their keys: ←/→ and J/K from a menu item never page the rule.
 * A radio group is not one: it consumes (preventDefault) only the arrows, Home and End it moves
 * by, so J/K, D, F and I still reach the shell from a focused radio.
 */
export const KEYBOARD_TARGET_SELECTOR = 'input, textarea, select, [contenteditable], [role="slider"], [role="listbox"], [role="combobox"], [role="menu"]';
/**
 * An interactive demo's pane (a phone scene): its lists and controls keep ←/→ and J/K, so a
 * key meant for the demo never pages the rule and discards its state. F, Esc and the rest still
 * reach the shell, and the canvas itself, outside the panes, still pages.
 */
export const DEMO_REGION_SELECTOR = "[data-demo-keys]";
const PAGING: ReadonlySet<ShortcutAction> = new Set(["next", "previous", "nextSection", "previousSection"]);
/** Enter opens a rule only from a gallery tile's link. Every other button or link keeps native activation. */
export const TILE_LINK_SELECTOR = "a[data-rule-link]";
export const MODAL_SELECTOR = '[aria-modal="true"]';

export type KeyEvent = {
  key: string;
  target?: unknown;
  defaultPrevented?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  isComposing?: boolean;
  eventPhase?: number;
};

export type KeyboardOptions = {
  view?: ShellView;
  /** WCAG 2.1.4: disables every unmodified character shortcut, including punctuation. */
  singleKeys?: boolean;
  ownerModal?: unknown;
};

function closest(target: unknown, selector: string): unknown {
  if (!target || typeof target !== "object" || !("closest" in target) || typeof target.closest !== "function") return null;
  return target.closest(selector);
}

function bindingFor(event: KeyEvent): Shortcut | undefined {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const command = Boolean(event.metaKey || event.ctrlKey);
  return shortcuts.find((shortcut) =>
    shortcut.keys.includes(key) && Boolean(shortcut.command) === command &&
    (shortcut.shift === undefined || shortcut.shift === Boolean(event.shiftKey)),
  );
}

/** Use from a bubble-phase shell handler; widgets get the first chance to consume keys. */
export function shouldHandle(event: KeyEvent, options: KeyboardOptions = {}): boolean {
  if (event.defaultPrevented || event.isComposing || event.eventPhase === 1 || event.altKey) return false;
  const modal = closest(event.target, MODAL_SELECTOR);
  if (modal && modal !== options.ownerModal) return false;
  const binding = bindingFor(event);
  const command = Boolean(event.metaKey || event.ctrlKey);
  if (command && (!binding?.command || event.shiftKey)) return false;
  if (!command && event.key.length === 1 && options.singleKeys === false) return false;
  if (event.repeat && binding?.toggle) return false;
  if (closest(event.target, KEYBOARD_TARGET_SELECTOR)) {
    return Boolean(binding?.command);
  }
  return true;
}

export function shortcutAction(event: KeyEvent, options: KeyboardOptions & { view: ShellView }): ShortcutAction | null {
  if (!shouldHandle(event, options)) return null;
  const action = bindingFor(event)?.action[options.view] ?? null;
  if (action === "openTile" && !closest(event.target, TILE_LINK_SELECTOR)) return null;
  if (action && PAGING.has(action) && closest(event.target, DEMO_REGION_SELECTOR)) return null;
  return action;
}

/** Consume before focus changes, so `/` cannot be inserted into the newly focused input. */
export function handleShortcut(
  event: KeyEvent & { preventDefault: () => void },
  options: KeyboardOptions & { view: ShellView },
  handle: (action: ShortcutAction) => void,
): boolean {
  const action = shortcutAction(event, options);
  if (!action) return false;
  event.preventDefault();
  handle(action);
  return true;
}
