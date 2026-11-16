import { describe, expect, it } from "vitest";
import { stagingEnabled } from "@/lib/staging";

describe("stagingEnabled", () => {
  it("is off when nothing is set", () => {
    expect(stagingEnabled({})).toBe(false);
  });

  it("is off for a production build alone", () => {
    expect(stagingEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(stagingEnabled({ VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(false);
  });

  it("is on for a preview deployment", () => {
    expect(stagingEnabled({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(true);
  });

  it("is on with the explicit flag, and only for exactly 1", () => {
    expect(stagingEnabled({ AXIOM_STAGING: "1", NODE_ENV: "production" })).toBe(true);
    for (const value of ["", "0", "true", "yes", " 1"]) {
      expect(stagingEnabled({ AXIOM_STAGING: value, NODE_ENV: "production" }), value).toBe(false);
    }
  });

  it("is on for the development server", () => {
    expect(stagingEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("stays closed on a production deployment, whatever else is set", () => {
    expect(stagingEnabled({ VERCEL_ENV: "production", AXIOM_STAGING: "1" })).toBe(false);
    expect(stagingEnabled({ VERCEL_ENV: "production", NODE_ENV: "development" })).toBe(false);
  });

  it("ignores other deployment names", () => {
    expect(stagingEnabled({ VERCEL_ENV: "development", NODE_ENV: "production" })).toBe(false);
    expect(stagingEnabled({ VERCEL_ENV: "Preview", NODE_ENV: "production" })).toBe(false);
  });
});
