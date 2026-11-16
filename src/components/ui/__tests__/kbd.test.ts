// design-system: strict
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Kbd } from "@/components/ui/kbd";

const render = (props = {}) => renderToStaticMarkup(createElement(Kbd, props, "J"));

describe("keycap", () => {
  it("renders an 18px semantic keycap in 12px medium sans with a token ring", () => {
    const html = render();
    expect(html).toMatch(/^<kbd.*>J<\/kbd>$/);
    expect(html).toContain("min-h-4.5 min-w-4.5");
    expect(html).toContain("font-sans text-xs leading-4 font-medium");
    expect(html).toContain("rounded-kbd");
    expect(html).toContain("shadow-keycap");
    expect(html).toContain("text-ink-muted");
    expect(html).not.toMatch(/font-mono|tabular-nums|border|data-off=/);
  });

  it("renders the 22px shortcuts-sheet size in secondary ink", () => {
    const html = render({ size: "lg" });
    expect(html).toContain("min-h-5.5 min-w-5.5 text-ink-secondary");
    expect(html).not.toMatch(/min-h-4.5|size="lg"/);
  });

  it("switches to the off ring without a border", () => {
    const html = render({ "data-off": true });
    expect(html).toContain('data-off="true"');
    expect(html).toContain("shadow-keycap-off");
    expect(html).not.toMatch(/shadow-keycap[ "]|border/);
    expect(render({ "data-off": false })).not.toContain("shadow-keycap-off");
  });

  it("preserves spoken names and caller attributes", () => {
    const html = renderToStaticMarkup(createElement(Kbd, { className: "shrink-0", id: "shortcut" },
      createElement("span", { "aria-hidden": true }, "⌘"),
      createElement("span", { className: "sr-only" }, "Command"),
    ));
    expect(html).toContain('<span aria-hidden="true">⌘</span><span class="sr-only">Command</span>');
    expect(html).toContain('id="shortcut"');
    expect(html).toContain("shrink-0");
  });
});
