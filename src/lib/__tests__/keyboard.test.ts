import { describe, expect, it, vi } from "vitest";
import { handleShortcut, KEYBOARD_TARGET_SELECTOR, MODAL_SELECTOR, shortcutAction, shortcuts, shouldHandle, TILE_LINK_SELECTOR, type KeyEvent } from "@/lib/navigation/keyboard";

const event = (patch: Partial<KeyEvent> = {}): KeyEvent => ({ key: "j", ...patch });
const target = (selector: string, result: unknown = {}) => ({ closest: (query: string) => query === selector ? result : null });
/** A minimal element: `closest` answers for the selectors the element (or an ancestor) matches. */
const element = (...matches: string[]) => ({
  closest: (query: string) => query.split(",").some((part) => matches.includes(part.trim())) ? {} : null,
});

describe("shell keyboard ownership", () => {
  it("describes the visible search, rule and section actions consistently", () => {
    const row = (label: string) => shortcuts.find((shortcut) => shortcut.label === label);
    for (const label of ["⌘K / Ctrl+K", "/"]) {
      expect(row(label)).toMatchObject({ gallery: "Search", rule: "Search" });
    }
    for (const [label, description] of [["J", "Next rule"], ["K", "Previous rule"], ["⇧J", "Next section"], ["⇧K", "Previous section"]]) {
      expect(row(label)).toMatchObject({ gallery: description, rule: description });
    }
    expect(row("Enter")?.gallery).toBe("Open rule");
    expect(row("D")?.gallery).toBe("Switch between Do and Don’t");
    expect(row("I")?.rule).toBe("Toggle deep dive");
    expect(row("F")?.rule).toBe("Cycle through Both, Do and Don’t (static comparisons)");
    expect(row("Esc")).toMatchObject({ gallery: "Clear search or collection filter", rule: "Close an overlay, exit Measure, or return to the rule list" });
  });

  it("omits native gallery arrow navigation from the sheet while keeping rule bindings", () => {
    const galleryRows = shortcuts.filter((shortcut) => shortcut.gallery);
    expect(galleryRows.some((shortcut) => shortcut.keys.includes("ArrowLeft") || shortcut.keys.includes("ArrowRight"))).toBe(false);
    expect(shortcuts.some((shortcut) => /Tab moves between tiles/.test(shortcut.gallery))).toBe(false);
    expect(shortcutAction(event({ key: "ArrowLeft" }), { view: "rule" })).toBe("previous");
    expect(shortcutAction(event({ key: "ArrowRight" }), { view: "rule" })).toBe("next");
  });

  it("leaves consumed, composing, capture-phase and modified keys alone", () => {
    for (const patch of [{ defaultPrevented: true }, { isComposing: true }, { eventPhase: 1 }, { altKey: true }, { ctrlKey: true }, { metaKey: true }]) {
      expect(shouldHandle(event(patch))).toBe(false);
    }
    expect(shouldHandle(event({ shiftKey: true }))).toBe(true);
    expect(shouldHandle(event({ target: {} }))).toBe(true);
    expect(shouldHandle(event({ target: null }))).toBe(true);
  });

  it("recognises all editable and composite widget ancestors without relying on DOM globals", () => {
    expect(KEYBOARD_TARGET_SELECTOR).toBe('input, textarea, select, [contenteditable], [role="slider"], [role="listbox"], [role="combobox"], [role="menu"]');
    const closest = vi.fn((selector: string) => selector === KEYBOARD_TARGET_SELECTOR ? {} : null);
    expect(shouldHandle(event({ target: { closest } }))).toBe(false);
    expect(closest).toHaveBeenCalledWith(KEYBOARD_TARGET_SELECTOR);
    // A field keeps Esc, to leave the field first.
    expect(shouldHandle(event({ key: "Escape", target: target(KEYBOARD_TARGET_SELECTOR) }))).toBe(false);
  });

  it("lets single keys through from a focused radio group, which consumes only the keys it moves by", () => {
    const radio = element('[role="radiogroup"]');
    for (const key of ["j", "k", "d", "f", "i"]) expect(shouldHandle(event({ key, target: radio })), key).toBe(true);
    expect(shortcutAction(event({ key: "j", target: radio }), { view: "rule" })).toBe("next");
    expect(shortcutAction(event({ key: "i", target: radio }), { view: "rule" })).toBe("inspector");
    expect(shortcutAction(event({ key: "ArrowRight", target: radio, defaultPrevented: true }), { view: "rule" })).toBeNull();
    // Esc from a segmented control leaves the rule, with no special case in the shell.
    expect(shortcutAction(event({ key: "Escape", target: radio }), { view: "rule" })).toBe("escape");
  });

  it("allows command-K in a field, but does not steal it from a foreign modal", () => {
    expect(shouldHandle(event({ key: "k", ctrlKey: true, target: target(KEYBOARD_TARGET_SELECTOR) }))).toBe(true);
    expect(shouldHandle(event({ key: "k", metaKey: true, shiftKey: true }))).toBe(false);
    const modal = {};
    const inside = event({ key: "k", metaKey: true, target: target(MODAL_SELECTOR, modal) });
    expect(shouldHandle(inside)).toBe(false);
    expect(shouldHandle(inside, { ownerModal: modal })).toBe(true);
  });

  it("ignores repeated toggles while permitting held paging keys", () => {
    for (const key of ["d", "D", "f", "z", "i", "[", "?", "/"]) expect(shouldHandle(event({ key, repeat: true }))).toBe(false);
    expect(shouldHandle(event({ repeat: true }))).toBe(true);
    expect(shouldHandle(event({ key: "ArrowLeft", repeat: true }))).toBe(true);
  });

  it("offers Measure only on rules with single-key shortcuts enabled", () => {
    expect(shortcuts.find(({ label }) => label === "M")?.rule).toBe("Toggle Measure (static comparisons)");
    expect(shortcutAction(event({ key: "m" }), { view: "rule" })).toBe("measure");
    expect(shortcutAction(event({ key: "m" }), { view: "gallery" })).toBeNull();
    expect(shortcutAction(event({ key: "m" }), { view: "rule", singleKeys: false })).toBeNull();
    expect(shortcutAction(event({ key: "m", repeat: true }), { view: "rule" })).toBeNull();
    expect(shortcutAction(event({ key: "m", target: element("input") }), { view: "rule" })).toBeNull();
  });

  it("disables single character shortcuts, including shifted letters and punctuation", () => {
    for (const key of ["j", "J", "D", "[", "/", "?"]) expect(shouldHandle(event({ key }), { singleKeys: false })).toBe(false);
    expect(shortcutAction(event({ key: "k", ctrlKey: true }), { view: "gallery", singleKeys: false })).toBe("palette");
    expect(shortcutAction(event({ key: "k", ctrlKey: true }), { view: "rule", singleKeys: false })).toBe("palette");
    expect(shortcutAction(event({ key: "ArrowLeft" }), { view: "rule", singleKeys: false })).toBe("previous");
  });

  it("keeps section jumps, native scrolling and gallery arrows distinct", () => {
    expect(shortcutAction(event({ key: "J", shiftKey: true }), { view: "rule" })).toBe("nextSection");
    expect(shortcutAction(event({ key: "K", shiftKey: true }), { view: "gallery" })).toBe("previousSection");
    for (const view of ["gallery", "rule"] as const) {
      expect(shortcutAction(event({ key: "ArrowDown" }), { view })).toBeNull();
      expect(shortcutAction(event({ key: "ArrowUp" }), { view })).toBeNull();
    }
    expect(shortcutAction(event({ key: "ArrowRight" }), { view: "gallery" })).toBeNull();
    expect(shortcuts.find((shortcut) => shortcut.label === "?")?.rule).toBe("Shortcuts");
  });

  it("consumes slash before focusing the field, preserving the first typed search character", () => {
    const order: string[] = [];
    const preventDefault = vi.fn(() => order.push("consume"));
    expect(handleShortcut({ key: "/", preventDefault }, { view: "gallery" }, (action) => order.push(action))).toBe(true);
    expect(order).toEqual(["consume", "filter"]);
    expect(handleShortcut({ key: "/", preventDefault }, { view: "rule" }, (action) => order.push(action))).toBe(true);
    expect(order.at(-1)).toBe("palette");
    expect(handleShortcut({ key: "ArrowDown", preventDefault }, { view: "rule" }, vi.fn())).toBe(false);
    expect(preventDefault).toHaveBeenCalledTimes(2);
  });

  it("opens a rule on Enter only from a tile link; other buttons and links keep native activation", () => {
    expect(TILE_LINK_SELECTOR).toBe("a[data-rule-link]");
    const preventDefault = vi.fn();
    for (const focused of [element("button"), element("a"), element(), null]) {
      expect(shortcutAction(event({ key: "Enter", target: focused }), { view: "gallery" })).toBeNull();
      expect(handleShortcut({ key: "Enter", target: focused, preventDefault }, { view: "gallery" }, vi.fn())).toBe(false);
    }
    expect(preventDefault).not.toHaveBeenCalled();
    expect(shortcutAction(event({ key: "Enter", target: element(TILE_LINK_SELECTOR) }), { view: "gallery" })).toBe("openTile");
    expect(shortcutAction(event({ key: "Enter", target: element(TILE_LINK_SELECTOR) }), { view: "rule" })).toBeNull();
  });

  it("leaves arrows and J/K to a menu, so a copy-menu item never pages the rule", () => {
    const item = element('[role="menu"]');
    for (const key of ["ArrowLeft", "ArrowRight", "j", "k", "Home"]) {
      expect(shortcutAction(event({ key, target: item }), { view: "rule" }), key).toBeNull();
    }
    expect(shortcutAction(event({ key: "ArrowLeft", target: element("button") }), { view: "rule" })).toBe("previous");
  });

  it("opens the shortcuts sheet on ⌘/ and Ctrl+/ from the shared table, with single keys off and inside fields", () => {
    const row = shortcuts.find((shortcut) => shortcut.command && shortcut.keys.includes("/"));
    expect(row).toMatchObject({ label: "⌘/ / Ctrl+/", gallery: "Shortcuts", rule: "Shortcuts", action: { gallery: "shortcuts", rule: "shortcuts" } });
    for (const modifier of [{ metaKey: true }, { ctrlKey: true }]) {
      for (const view of ["gallery", "rule"] as const) {
        expect(shortcutAction(event({ key: "/", ...modifier }), { view, singleKeys: false })).toBe("shortcuts");
      }
      expect(shortcutAction(event({ key: "/", ...modifier, target: element("input") }), { view: "rule" })).toBe("shortcuts");
      expect(shortcutAction(event({ key: "/", ...modifier, repeat: true }), { view: "rule" })).toBeNull();
    }
    expect(shortcutAction(event({ key: "/" }), { view: "gallery", singleKeys: false })).toBeNull();
    expect(shortcutAction(event({ key: "/" }), { view: "gallery" })).toBe("filter");
  });

  it("rejects composition and every contenteditable form, plaintext-only included", () => {
    expect(shortcutAction(event({ key: "j", isComposing: true }), { view: "rule" })).toBeNull();
    expect(shortcutAction(event({ key: "Process", isComposing: true }), { view: "rule" })).toBeNull();
    const editable = { closest: (query: string) => query === KEYBOARD_TARGET_SELECTOR ? { contentEditable: "plaintext-only" } : null };
    expect(KEYBOARD_TARGET_SELECTOR.split(", ")).toContain("[contenteditable]");
    expect(shortcutAction(event({ key: "j", target: editable }), { view: "rule" })).toBeNull();
    expect(shortcutAction(event({ key: "f" }), { view: "rule" })).toBe("flip");
    expect(shortcutAction(event({ key: "z" }), { view: "rule" })).toBe("zoom");
  });
});
