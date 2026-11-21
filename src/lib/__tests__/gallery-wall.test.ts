import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { WallContext, wallDefaults, type WallApi } from "@/components/gallery/wall-context";
import { ShellContext, type ShellApi } from "@/components/shell/shell-context";
import { accessibilityCollection, railCategories, railCategoryIds, railOrder } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { catalogDeck, collectionDeck, searchDeck } from "@/lib/navigation/deck";

/**
 * The wall as the server renders it, read like a browser without script
 * would: one h1, seven h2s, one tile link per rule whose names are their titles,
 * section ids that are the bare category ids, and every motion pane inside
 * its island. The filter's gates are checked with a search applied.
 */

const noop = () => {};
const shell: ShellApi = {
  view: "gallery",
  ruleId: null,
  deck: catalogDeck,
  openRule: noop,
  restorePanel: noop,
  page: noop,
  exit: noop,
  home: noop,
  clearDeck: noop,
  hrefFor: (id) => `/docs/rules/${id}`,
  peek: { current: null },
  sheet: { current: null },
  phone: false,
  scrolled: false,
  modKey: "⌘",
  inspectorOpen: true,
  toggleInspector: noop,
  singleKeys: true,
  inputOrigin: () => "pointer",
  openPalette: noop,
  openShortcuts: noop,
};

function render(wall: Partial<WallApi> = {}): string {
  const tree: ReactElement = createElement(
    ShellContext.Provider,
    { value: shell },
    createElement(WallContext.Provider, { value: { ...wallDefaults, ...wall } }, createElement(GalleryWall, { base: "/docs" }) as ReactNode),
  );
  return renderToStaticMarkup(tree);
}

// ── A small reader for the rendered markup ───────────────────────────

type Node = { tag: string; attrs: Record<string, string>; children: (Node | string)[]; parent: Node | null };
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const decode = (text: string) =>
  text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

function parse(html: string): Node {
  const root: Node = { tag: "#root", attrs: {}, children: [], parent: null };
  let at = root;
  for (const [, close, tag, rest, text] of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (text !== undefined) {
      at.children.push(decode(text));
    } else if (close) {
      if (at.parent) at = at.parent;
    } else {
      const attrs: Record<string, string> = {};
      for (const [, name, value] of rest.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[name] = decode(value ?? "");
      const node: Node = { tag: tag.toLowerCase(), attrs, children: [], parent: at };
      at.children.push(node);
      if (!VOID.has(node.tag) && !rest.trimEnd().endsWith("/")) at = node;
    }
  }
  return root;
}

function all(node: Node, match: (node: Node) => boolean, out: Node[] = []): Node[] {
  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (match(child)) out.push(child);
    all(child, match, out);
  }
  return out;
}

/** The text a screen reader takes for a link's name: aria-hidden subtrees and hidden elements excluded. */
function accessibleName(node: Node): string {
  const walk = (n: Node | string): string => {
    if (typeof n === "string") return n;
    if (n.attrs["aria-hidden"] === "true" || "hidden" in n.attrs) return "";
    return n.children.map(walk).join("");
  };
  return walk(node).replace(/\s+/g, " ").trim();
}

const hiddenUp = (node: Node | null): boolean => (node ? "hidden" in node.attrs || hiddenUp(node.parent) : false);

describe("the gallery wall, server-rendered", () => {
  const html = render();
  const doc = parse(html);
  const tiles = all(doc, (n) => n.tag === "a" && "data-rule-link" in n.attrs);

  it("renders a unique tile link per rule, in wall order", () => {
    expect(tiles).toHaveLength(rules.length);
    expect(tiles.map((tile) => tile.attrs["data-rule"])).toEqual(railOrder.map((rule) => rule.id));
    expect(new Set(tiles.map((tile) => tile.attrs.href)).size).toBe(rules.length);
    for (const tile of tiles) {
      const id = tile.attrs["data-rule"];
      expect(tile.attrs.href).toBe(`/docs/rules/${id}`);
      expect(tile.attrs.id).toBe(`rule-${id}`);
    }
  });

  it("has one h1 and seven h2s", () => {
    expect(all(doc, (n) => n.tag === "h1")).toHaveLength(1);
    const headings = all(doc, (n) => n.tag === "h2");
    expect(headings.map(accessibleName)).toEqual(railCategories.map((category) => category.name));
  });

  it("gives sections the bare category ids, and #accessibility a target", () => {
    const sections = all(doc, (n) => n.tag === "section");
    expect(sections.map((section) => section.attrs.id)).toEqual([...railCategoryIds]);
    const target = all(doc, (n) => n.attrs.id === accessibilityCollection.id);
    expect(target).toHaveLength(1);
    expect(all(target[0], (n) => n.tag === "a")[0].attrs.href).toBe("/docs?collection=accessibility");
  });

  it("names each tile by its title alone: the preview frame is aria-hidden", () => {
    for (const tile of tiles) {
      const rule = railOrder.find((entry) => entry.id === tile.attrs["data-rule"])!;
      expect(accessibleName(tile), rule.id).toBe(rule.title);
    }
  });

  it("gives tiles no handlers and the morph hooks the catalog app looks for", () => {
    expect(html).not.toMatch(/\son[a-z]+=/i);
    for (const tile of tiles) {
      expect(all(tile, (n) => "data-tile-frame" in n.attrs)).toHaveLength(1);
      expect(all(tile, (n) => "data-tile-title" in n.attrs)).toHaveLength(1);
    }
  });

  it("wraps every tile in a gate, and sits each motion pane in its island", () => {
    const gates = all(doc, (n) => "data-gate" in n.attrs);
    expect(gates.map((gate) => gate.attrs["data-gate"])).toEqual(railOrder.map((rule) => rule.id));
    for (const gate of gates) expect(all(gate, (n) => "data-rule-link" in n.attrs)).toHaveLength(1);
    for (const tile of tiles) {
      const id = tile.attrs["data-rule"];
      const panes = all(tile, (n) => n.attrs["data-motion"] !== undefined);
      if (id in showcaseSpecs) {
        expect(panes.map((pane) => pane.attrs["data-motion"]), id).toEqual([id, id]);
        // Held hidden until the island has set its rest frame.
        for (const pane of panes) expect(pane.attrs["data-ready"], id).toBeUndefined();
      } else {
        expect(panes, id).toHaveLength(0);
      }
    }
  });

  it("marks only the motion tiles that replay", () => {
    for (const tile of tiles) {
      const spec = showcaseSpecs[tile.attrs["data-rule"]];
      const marked = all(tile, (n) => n.attrs.class === "gw-marker").length === 1;
      expect(marked, tile.attrs["data-rule"]).toBe(Boolean(spec) && spec.trigger !== "drag");
    }
  });

  it("passes no function-valued props across to the client", () => {
    // A function prop on a client island would fail the server render outright;
    // a stray one on a DOM element would print as text.
    expect(html).not.toMatch(/=>|function\s*\(/);
  });

  it("hides what a search leaves out, and keeps the rest in wall order", () => {
    const deck = searchDeck("border");
    const filtered = parse(render({ q: "border", visible: new Set(deck.rules.map((rule) => rule.id)) }));
    const shown = all(filtered, (n) => "data-rule-link" in n.attrs && !hiddenUp(n)).map((tile) => tile.attrs["data-rule"]);
    expect(shown).toEqual(["layout-7", "a11y-2", "color-6", "color-12", "motion-8"]);
    const sections = all(filtered, (n) => n.tag === "section" && !("hidden" in n.attrs)).map((section) => section.attrs.id);
    expect(sections).toEqual(["layout", "color", "motion"]);
  });

  it("shows a collection in its deck's order, in its own groups, each tile once", () => {
    const deck = collectionDeck(accessibilityCollection.id);
    const markup = parse(
      render({ collection: accessibilityCollection.id, visible: new Set(deck.rules.map((rule) => rule.id)) }),
    );
    const links = all(markup, (n) => "data-rule-link" in n.attrs);
    expect(links).toHaveLength(rules.length);
    const shown = links.filter((tile) => !hiddenUp(tile)).map((tile) => tile.attrs["data-rule"]);
    expect(shown).toEqual(deck.rules.map((rule) => rule.id));
    const sections = all(markup, (n) => n.tag === "section" && !("hidden" in n.attrs));
    expect(sections.map((section) => accessibleName(all(section, (n) => n.tag === "h2")[0]))).toEqual(
      accessibilityCollection.groups.map((group) => group.label),
    );
  });
});

describe("gallery stylesheet", () => {
  const dir = path.join(process.cwd(), "src/components/gallery");
  const css = readFileSync(path.join(dir, "gallery.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("hides evidence annotations on tiles, except the ones a pane needs", () => {
    expect(css).toMatch(/\.gw-tile \[data-annotation\]:not\(\[data-keep\]\)\s*\{\s*display: none;/);
  });

  it("never puts content-visibility on a section, only on the aria-hidden frame", () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => /content-visibility/.test(m[2]));
    expect(rules.map((m) => m[1].trim())).toEqual([".gw-frame"]);
  });

  it("is the only stylesheet in the gallery", () => {
    expect(readdirSync(dir).filter((file) => file.endsWith(".css"))).toEqual(["gallery.css"]);
  });
});
