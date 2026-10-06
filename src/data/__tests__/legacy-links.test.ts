import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { resolveRuleId, ruleAliases, rules } from "@/data/ui-logic";

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
