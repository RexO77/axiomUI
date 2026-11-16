import { describe, expect, it } from "vitest";

import { railCategoryIds } from "@/data/taxonomy";
import { categories } from "@/data/ui-logic";
import { readFragment, resolveHash } from "@/lib/navigation/hash";

describe("wall fragments", () => {
  it("maps a bare category id to its section", () => {
    expect(resolveHash("#typography")).toEqual({ kind: "section", id: "typography" });
    expect(resolveHash("motion")).toEqual({ kind: "section", id: "motion" });
  });

  it("maps the earlier gallery's gw- ids to the same targets", () => {
    expect(resolveHash("#gw-layout")).toEqual({ kind: "section", id: "layout" });
    expect(resolveHash("#gw-rule-form-3")).toEqual({ kind: "tile", id: "form-3" });
  });

  it("maps rule-<id> to its tile", () => {
    expect(resolveHash("#rule-typo-1")).toEqual({ kind: "tile", id: "typo-1" });
    expect(resolveHash("#rule-a11y-2")).toEqual({ kind: "tile", id: "a11y-2" });
  });

  it("resolves a retired rule id through its alias", () => {
    expect(resolveHash("#rule-sys-12")).toEqual({ kind: "tile", id: "motion-3" });
  });

  it("opens the Accessibility collection, which has no section of its own", () => {
    expect(resolveHash("#accessibility")).toEqual({ kind: "collection", id: "accessibility" });
  });

  it("resolves every source category, so rule-page breadcrumbs (/#<category>) all land", () => {
    for (const category of categories) expect(resolveHash(`#${category.id}`), category.id).not.toBeNull();
    for (const id of railCategoryIds) expect(resolveHash(`#${id}`)).toEqual({ kind: "section", id });
  });

  it("leaves anything else to the browser", () => {
    for (const hash of ["", "#", "#main-content", "#rule-nope-0", "#rule-", "#gw-", "#Typography", "#%E0%A4%A"]) {
      expect(resolveHash(hash), hash).toBeNull();
    }
  });

  it("decodes percent escapes, and reads a malformed one as empty", () => {
    expect(readFragment("#rule%2Dtypo-1")).toBe("rule-typo-1");
    expect(resolveHash("#rule%2Dtypo-1")).toEqual({ kind: "tile", id: "typo-1" });
    expect(readFragment("#%E0%A4%A")).toBe("");
  });
});
