import { describe, expect, it } from "vitest";
// Next's own matcher for a redirect's `has` conditions, so these tests read
// `?rule=` exactly as the server will.
import { matchHas } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../../../next.config";
import { resolveRuleId, ruleAliases, rules } from "@/data/ui-logic";
import { routes } from "@/lib/navigation/routes";

const ruleIds = new Set(rules.map((rule) => rule.id));

describe("retired rule links", () => {
  it("resolves each alias to a rule that still exists", () => {
    for (const [from, to] of Object.entries(ruleAliases)) {
      expect(ruleIds.has(from), from).toBe(false);
      expect(ruleIds.has(to), to).toBe(true);
      expect(resolveRuleId(from)).toBe(to);
    }
  });

  it("leaves unknown ids, including inherited object keys, untouched", () => {
    expect(resolveRuleId(null)).toBeNull();
    expect(resolveRuleId("motion-3")).toBe("motion-3");
    expect(resolveRuleId("not-a-rule")).toBe("not-a-rule");

    for (const key of ["constructor", "valueOf", "toString", "__proto__", "hasOwnProperty"]) {
      const resolved = resolveRuleId(key);
      expect(resolved).toBe(key);
      expect(typeof resolved).toBe("string");
    }
  });

  it("permanently redirects each retired rule page to the rule that absorbed it", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];

    for (const [from, to] of Object.entries(ruleAliases)) {
      expect(redirects).toContainEqual({
        source: `/rules/${from}`,
        destination: `/rules/${to}`,
        permanent: true,
      });
      expect(redirects).toContainEqual({
        source: `/rules/${from}/:path*`,
        destination: `/rules/${to}/:path*`,
        permanent: true,
      });
    }
  });
});

describe("the legacy ?rule= link", () => {
  async function ruleRedirect() {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const found = redirects.filter((redirect) => redirect.source === "/" && redirect.has?.some((item) => item.type === "query" && item.key === "rule"));
    expect(found).toHaveLength(1);
    return found[0];
  }

  /** Where the server sends `/?<search>`, or null when it serves the homepage. */
  async function serverTarget(search: string): Promise<string | null> {
    const redirect = await ruleRedirect();
    const query: Record<string, string | string[]> = {};
    for (const [key, value] of new URLSearchParams(search)) {
      const prior = query[key];
      query[key] = prior === undefined ? value : [...(Array.isArray(prior) ? prior : [prior]), value];
    }
    const params = matchHas({ headers: {} } as never, query as never, redirect.has, redirect.missing);
    if (!params) return null;
    return redirect.destination.replace(/:(\w+)/g, (_, name: string) => {
      const value = params[name];
      return typeof value === "string" ? value : `:${name}`;
    });
  }

  it("is one permanent redirect from the homepage to the rule page", async () => {
    const redirect = await ruleRedirect();
    expect(redirect).toMatchObject({ source: "/", destination: "/rules/:rid", permanent: true });
    expect(redirect.has).toEqual([{ type: "query", key: "rule", value: "(?<rid>[a-z][a-z0-9]*-\\d+)" }]);
    expect(redirect.missing).toBeUndefined();
  });

  it("sends every rule id, and every retired id, to its own page", async () => {
    for (const id of [...rules.map((rule) => rule.id), ...Object.keys(ruleAliases)]) {
      expect(await serverTarget(`rule=${id}`), id).toBe(`/rules/${id}`);
    }
  });

  it("keeps the rest of the query out of the captured id", async () => {
    expect(await serverTarget("rule=motion-3&q=x")).toBe("/rules/motion-3");
    expect(await serverTarget("q=x&rule=typo-1&show=dont")).toBe("/rules/typo-1");
  });

  it("takes the last value when rule repeats, as the catalog does", async () => {
    expect(await serverTarget("rule=a&rule=motion-3")).toBe("/rules/motion-3");
    expect(await serverTarget("rule=typo-1&rule=motion-3")).toBe("/rules/motion-3");
    expect(routes.parseLocation("/", "?rule=a&rule=motion-3").ruleId).toBe("motion-3");
    expect(routes.parseLocation("/", "?rule=typo-1&rule=motion-3").ruleId).toBe("motion-3");
  });

  it("serves the homepage for an empty or malformed value, and the catalog ignores it", async () => {
    for (const value of ["", "motion", "Motion-3", "motion-3x", "motion-", "-3", "motion-3/../x", "motion--3", "motion 3", "typo-1%2F"]) {
      const search = `rule=${encodeURIComponent(value)}`;
      expect(await serverTarget(search), value).toBeNull();
      expect(routes.parseLocation("/", `?${search}`).ruleId, value).toBeNull();
    }
    expect(await serverTarget("q=x")).toBeNull();
  });

  it("agrees with the catalog on the shape of an id the server redirects", async () => {
    for (const value of ["nope-0", "a-1", "motion-3", "typo-10", "a11y-1", "1a-1", "a_1-1"]) {
      const redirected = (await serverTarget(`rule=${value}`)) !== null;
      expect(routes.parseLocation("/", `?rule=${value}`).ruleId !== null, value).toBe(redirected);
    }
  });
});
