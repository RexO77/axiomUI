import { describe, expect, it, vi } from "vitest";

import { createProseLoader, proseUrl } from "@/lib/prose-loader";
import type { RuleProse } from "@/lib/rule-prose-types";

const prose = (id: string): RuleProse => ({ id, how: [`${id} step`], why: `${id} why`, breaks: `${id} breaks`, review: [`${id} review`] });

/** A fetcher whose replies the test releases one by one, in any order. */
function controlledFetcher() {
  const calls: string[] = [];
  const waiting = new Map<string, { resolve: (value: unknown) => void; reject: (error: unknown) => void }[]>();
  const fetcher = vi.fn((id: string) => {
    calls.push(id);
    return new Promise<unknown>((resolve, reject) => {
      waiting.set(id, [...(waiting.get(id) ?? []), { resolve, reject }]);
    });
  });
  const settle = async (id: string, value: unknown, fail = false) => {
    const next = waiting.get(id)?.shift();
    if (!next) throw new Error(`no request for ${id}`);
    if (fail) next.reject(new Error("offline"));
    else next.resolve(value);
    // Let the loader's promise chain run.
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  };
  return { fetcher, calls, settle };
}

describe("prose loader", () => {
  it("shows B when A's reply arrives after B's, and never announces A", async () => {
    const { fetcher, settle } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    const heard: string[] = [];
    loader.subscribe(() => heard.push(loader.get("b").status));

    loader.show("a");
    loader.show("b");
    await settle("b", prose("b"));
    await settle("a", prose("a"));

    expect(loader.get("b")).toEqual({ status: "ready", prose: prose("b") });
    // A's late reply is kept for later, but the rule on screen never heard about it.
    expect(heard).toEqual(["ready"]);
  });

  it("treats a reply that names another rule as a failure", async () => {
    const { fetcher, settle } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    loader.show("a");
    await settle("a", prose("b"));
    expect(loader.get("a").status).toBe("error");
    expect(loader.get("b").status).toBe("loading");
  });

  it("shows the retry state on a failure, and a retry succeeds", async () => {
    const { fetcher, settle, calls } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    const listener = vi.fn();
    loader.subscribe(listener);

    loader.show("a");
    expect(loader.get("a").status).toBe("loading");
    await settle("a", null, true);
    expect(loader.get("a").status).toBe("error");
    expect(listener).toHaveBeenCalledTimes(1);

    const retried = loader.retry("a");
    expect(loader.get("a").status).toBe("loading");
    await settle("a", prose("a"));
    await retried;
    expect(loader.get("a")).toEqual({ status: "ready", prose: prose("a") });
    expect(calls).toEqual(["a", "a"]);
  });

  it("does not fetch a cached rule again, and shares one request per rule", async () => {
    const { fetcher, settle, calls } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    loader.prefetch("a");
    loader.prefetch("a");
    loader.show("a");
    await settle("a", prose("a"));
    loader.show("b");
    loader.show("a");
    loader.prefetch("a");
    expect(calls).toEqual(["a", "b"]);
    // The snapshot is stable while nothing changes.
    expect(loader.get("a")).toBe(loader.get("a"));
  });

  it("never retries a failed prefetch on its own", async () => {
    const { fetcher, settle, calls } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    loader.prefetch("a");
    await settle("a", null, true);
    loader.prefetch("a");
    expect(calls).toEqual(["a"]);
    // Showing it does try again.
    loader.show("a");
    expect(calls).toEqual(["a", "a"]);
  });

  it("uses the seed for its own id only", () => {
    const { fetcher, calls } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    loader.seed(prose("a"));
    loader.show("a");
    expect(loader.get("a")).toEqual({ status: "ready", prose: prose("a") });
    expect(calls).toEqual([]);
    loader.show("b");
    expect(loader.get("b").status).toBe("loading");
    expect(calls).toEqual(["b"]);
  });

  it("ignores a malformed seed", () => {
    const { fetcher } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    loader.seed({ id: "a" } as unknown as RuleProse);
    expect(loader.get("a").status).toBe("loading");
  });

  it("preserves source links on the requested rule and rejects malformed link payloads", async () => {
    const { fetcher, settle } = controlledFetcher();
    const loader = createProseLoader(fetcher);
    const valid = { ...prose("a"), sources: [{ title: "Capitalization", href: "https://learn.microsoft.com/en-us/style-guide/capitalization" }] };
    loader.show("a");
    await settle("a", valid);
    expect(loader.get("a")).toEqual({ status: "ready", prose: valid });
    loader.show("b");
    await settle("b", { ...prose("b"), sources: [{ title: "Capitalization", href: "/unknown" }] });
    expect(loader.get("b").status).toBe("error");
  });

  it("fetches each rule's own file at the site root", () => {
    expect(proseUrl("typo-1")).toBe("/deep-dives/typo-1");
    expect(proseUrl("a b")).toBe("/deep-dives/a%20b");
  });
});
