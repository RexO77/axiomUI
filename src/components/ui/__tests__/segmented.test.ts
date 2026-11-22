// design-system: strict
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Segmented, segmentIndex } from "@/components/ui/segmented";

// Inspect the rendered handlers in node without a DOM renderer. Layout
// effects are collected, not run, so a test can run one against stub elements.
const layoutEffects = vi.hoisted(() => [] as (() => void | (() => void))[]);
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useRef: (initial: unknown) => ({ current: initial }),
  useLayoutEffect: (effect: () => void | (() => void)) => { layoutEffects.push(effect); },
}));

describe("segmented radio keyboard logic", () => {
  const options = [{}, { disabled: true }, {}];

  it("wraps arrows through enabled radios and supports Home, End and RTL", () => {
    expect(segmentIndex(options, 0, "ArrowRight")).toBe(2);
    expect(segmentIndex(options, 2, "ArrowDown")).toBe(0);
    expect(segmentIndex(options, 0, "ArrowLeft")).toBe(2);
    expect(segmentIndex(options, 2, "Home")).toBe(0);
    expect(segmentIndex(options, 0, "End")).toBe(2);
    expect(segmentIndex([{}, {}, {}], 1, "ArrowRight", "rtl")).toBe(0);
    expect(segmentIndex([{}, {}, {}], 1, "ArrowDown", "rtl")).toBe(2);
    expect(segmentIndex(options, -1, "ArrowRight")).toBe(0);
    expect(segmentIndex([], 0, "ArrowRight")).toBeNull();
    expect(segmentIndex([{ disabled: true }], 0, "Home")).toBeNull();
    expect(segmentIndex(options, 0, "j")).toBeNull();
  });

  it("renders one tab stop, named radios and a labelled group on the server", () => {
    const html = renderToStaticMarkup(createElement(Segmented, {
      label: "Zoom", value: "2", onChange: vi.fn(),
      options: [{ value: "1", label: "1×", name: "100%" }, { value: "2", label: "2×", name: "200%" }],
    }));
    expect(html).toContain('role="radiogroup" aria-label="Zoom"');
    // The accessible name starts with the visible label (WCAG 2.5.3) and adds the spoken value.
    expect(html).toContain('aria-label="2×, 200%" tabindex="0"');
    expect(html).toContain('aria-label="1×, 100%" tabindex="-1"');
    expect(html).not.toContain('aria-label="200%"');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html.match(/role="radio"/g)).toHaveLength(2);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
  });

  it("gives an invalid or disabled selection an enabled entry point", () => {
    const html = renderToStaticMarkup(createElement(Segmented, {
      label: "Speed", value: "missing", onChange: vi.fn(),
      options: [{ value: "1", label: "1×", disabled: true }, { value: "2", label: "½×" }],
    }));
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('aria-checked="false" tabindex="0"');
  });
});

describe("segmented presentation", () => {
  const props = {
    label: "Compare", value: "do", onChange: vi.fn(),
    options: [{ value: "do", label: "Do", icon: createElement("svg") }, { value: "dont", label: "Don’t", icon: createElement("svg") }],
  };

  it("uses concentric token radii, raised selection and colour-only hover", () => {
    const html = renderToStaticMarkup(createElement(Segmented, props));
    expect(html).toContain("rounded-control");
    expect(html).toContain("p-0.75");
    expect(html).toContain("gap-0.5");
    expect(html.match(/rounded-item/g)).toHaveLength(2);
    expect(html).toContain("bg-raised text-ink shadow-item");
    expect(html).not.toMatch(/bg-surface|hover:bg-|rounded-md|rounded-lg/);
    expect(html).toContain("hover:text-ink");
    expect(html).toContain("focus-visible:outline-offset-0");
    expect(html).toContain("[&amp;_svg]:size-3.5");
    expect(html).toContain('aria-hidden="true" class="text-ink-secondary"');
    expect(html).toContain('aria-hidden="true" class="text-ink-muted"');
    expect(html).toContain("shrink-0");
    expect(html).toContain("whitespace-nowrap");
  });

  it("limits 44px targets to the phone layout and offers capsule radii", () => {
    const html = renderToStaticMarkup(createElement(Segmented, { ...props, variant: "capsule" }));
    expect(html.match(/rounded-full/g)).toHaveLength(3);
    expect(html).not.toMatch(/rounded-control|rounded-item|pointer:coarse/);
    expect(html).toContain("phone:min-h-11");
    expect(html).toContain("phone:min-h-9.5");
    expect(html).toContain("phone:before:h-11");
    // The item itself is 44px wide on phones; the hit area only grows
    // vertically, so it never reaches into the neighbouring item.
    expect(html).toContain("phone:min-w-11");
    expect(html).toContain("phone:before:inset-x-0");
    expect(html).not.toMatch(/phone:before:(min-)?w-|before:-translate-x/);
  });

  it("preserves a Tooltip description on the group", () => {
    expect(renderToStaticMarkup(createElement(Segmented, { ...props, "aria-describedby": "tip" })))
      .toContain('aria-describedby="tip"');
  });
});

describe("segmented change origin", () => {
  function group(disabled = false) {
    const onChange = vi.fn();
    const tree = Segmented({
      label: "Zoom", value: "1", onChange, disabled, dir: "ltr",
      options: [{ value: "1", label: "1×" }, { value: "skip", label: "Skip", disabled: true }, { value: "2", label: "2×" }],
    });
    const buttons = tree.props.children;
    const focus = vi.fn();
    const target = { focus: vi.fn() };
    buttons[0].props.ref(target);
    buttons[2].props.ref({ focus });
    return { onChange, tree, buttons, focus, target };
  }

  it("distinguishes pointer, keyboard and assistive clicks", () => {
    const { buttons, onChange } = group();
    buttons[2].props.onClick({ detail: 1 });
    buttons[0].props.onClick({ detail: 0 });
    expect(onChange.mock.calls).toEqual([["2", false], ["1", true]]);
  });

  it.each(["ArrowRight", "ArrowDown", "End"])("%s focuses the enabled radio and reports keyboard origin", (key) => {
    const { tree, onChange, target, focus } = group();
    const preventDefault = vi.fn();
    tree.props.onKeyDown({ key, target, preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("2", true);
  });

  it("Home selects the first radio and ignores modified or disabled key events", () => {
    const { tree, onChange, target } = group();
    tree.props.onKeyDown({ key: "Home", target, preventDefault: vi.fn() });
    expect(onChange).toHaveBeenCalledWith("1", true);
    onChange.mockClear();
    tree.props.onKeyDown({ key: "End", target, ctrlKey: true });
    expect(onChange).not.toHaveBeenCalled();
    const disabled = group(true);
    disabled.tree.props.onKeyDown({ key: "End", target: disabled.target });
    expect(disabled.onChange).not.toHaveBeenCalled();
    const html = renderToStaticMarkup(disabled.tree);
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('tabindex="0"');
  });
});

describe("segmented pill placement", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  type Box = { left: number; right: number; top: number; width: number; height: number };
  const box = (left: number, top: number, width: number, height: number): Box =>
    ({ left, right: left + width, top, width, height });

  /** Renders a group, attaches stub elements and runs its measuring effect. */
  function measure({ value = "2", direction = "ltr", track = box(100, 50, 200, 32), selected = box(203, 53, 94, 26) } = {}) {
    const style = new Map<string, string>();
    const element = {
      dataset: {} as Record<string, string>,
      clientLeft: 1,
      clientTop: 1,
      getBoundingClientRect: () => track,
      style: {
        getPropertyValue: (property: string) => style.get(property) ?? "",
        setProperty: (property: string, length: string) => { style.set(property, length); },
      },
    };
    let resized = () => {};
    vi.stubGlobal("getComputedStyle", () => ({ direction }));
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { resized = callback; }
      observe() {}
      disconnect() {}
    });
    layoutEffects.length = 0;
    const tree = Segmented({
      label: "Zoom", value, onChange: vi.fn(),
      options: [{ value: "1", label: "1×" }, { value: "2", label: "2×" }],
    });
    tree.props.ref.current = element;
    tree.props.children.forEach((button: { props: { ref: (el: unknown) => void } }, index: number) =>
      button.props.ref({ getBoundingClientRect: () => (index === 1 ? selected : box(103, 53, 94, 26)) }));
    layoutEffects.at(-1)!();
    return { element, style, resize: (next: Box) => { selected = next; resized(); } };
  }

  it("places the pill on the selected radio, inside the track's border", () => {
    const { element, style } = measure();
    expect(Object.fromEntries(style)).toEqual({
      "--segment-start": "102px",
      "--segment-top": "2px",
      "--segment-width": "94px",
      "--segment-height": "26px",
    });
    expect("measured" in element.dataset).toBe(true);
  });

  it("measures from the inline start in a right-to-left group", () => {
    // The selected radio sits at the left, so in RTL it is the far end.
    const { style } = measure({ direction: "rtl", selected: box(103, 53, 94, 26) });
    expect(style.get("--segment-start")).toBe("102px");
  });

  it("leaves the server's painted radio in place while the group is hidden", () => {
    const { element, style } = measure({ selected: box(0, 0, 0, 0) });
    expect(style.size).toBe(0);
    expect("measured" in element.dataset).toBe(false);
  });

  it("follows a resize without sliding the pill there", () => {
    const { element, style, resize } = measure();
    element.dataset.slide = "";
    resize(box(213, 53, 84, 26));
    expect(style.get("--segment-start")).toBe("112px");
    expect(style.get("--segment-width")).toBe("84px");
    expect("slide" in element.dataset).toBe(false);
  });
});
