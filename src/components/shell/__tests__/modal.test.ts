import { afterEach, describe, expect, it, vi } from "vitest";
import { trapTab } from "@/components/shell/modal";

function element({ tabIndex = 0, inert = false, hidden = false } = {}) {
  const ancestor = {};
  return {
    tabIndex,
    closest: (selector: string) => selector === "[inert]" && inert ? ancestor : null,
    getClientRects: () => hidden ? [] : [{}],
    focus: vi.fn(),
  };
}

function fixture(empty = false) {
  const first = element();
  const skipped = element({ tabIndex: -1 });
  const second = element();
  const inert = element({ inert: true });
  const hidden = element({ hidden: true });
  const third = element();
  const elements = [first, skipped, second, inert, hidden, third];
  const candidates = empty ? [] : elements;
  const root = {
    querySelectorAll: () => candidates,
    contains: (value: unknown) => candidates.includes(value as typeof first),
  } as unknown as HTMLElement;
  return { root, elements, controls: [first, second, third], skipped };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("dialog Tab trap", () => {
  it.each([
    { name: "advances from the first to the second control", active: 0, shiftKey: false, next: 1 },
    { name: "advances from the second to the third control", active: 1, shiftKey: false, next: 2 },
    { name: "wraps forward from the third to the first control", active: 2, shiftKey: false, next: 0 },
    { name: "moves back from the third to the second control", active: 2, shiftKey: true, next: 1 },
    { name: "moves back from the second to the first control", active: 1, shiftKey: true, next: 0 },
    { name: "wraps back from the first to the third control", active: 0, shiftKey: true, next: 2 },
  ])("$name, skipping negative tabIndex, inert and hidden elements", ({ active, shiftKey, next }) => {
    const f = fixture();
    vi.stubGlobal("document", { activeElement: f.controls[active] });
    const preventDefault = vi.fn();

    trapTab({ key: "Tab", shiftKey, preventDefault }, f.root);

    expect(preventDefault).toHaveBeenCalledOnce();
    for (const node of f.elements) {
      expect(node.focus).toHaveBeenCalledTimes(node === f.controls[next] ? 1 : 0);
    }
  });

  it.each([
    { shiftKey: false, next: 0 },
    { shiftKey: true, next: 2 },
  ])("focuses control $next when active focus is outside the list (shiftKey=$shiftKey)", ({ shiftKey, next }) => {
    const f = fixture();
    vi.stubGlobal("document", { activeElement: f.skipped });
    const preventDefault = vi.fn();

    trapTab({ key: "Tab", shiftKey, preventDefault }, f.root);

    expect(preventDefault).toHaveBeenCalledOnce();
    for (const node of f.elements) {
      expect(node.focus).toHaveBeenCalledTimes(node === f.controls[next] ? 1 : 0);
    }
  });

  it.each([false, true])("prevents Tab without focusing anything in an empty list (shiftKey=%s)", (shiftKey) => {
    const f = fixture(true);
    vi.stubGlobal("document", { activeElement: element() });
    const preventDefault = vi.fn();

    trapTab({ key: "Tab", shiftKey, preventDefault }, f.root);

    expect(preventDefault).toHaveBeenCalledOnce();
    for (const node of f.elements) expect(node.focus).not.toHaveBeenCalled();
  });
});
