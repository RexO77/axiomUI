import { MetadataRoute } from "next";
import { rules } from "@/data/ui-logic";
import { absoluteUrl } from "@/lib/site";

// Bump this manually when rule content meaningfully changes. A fresh
// Date() here would re-stamp all 107 URLs on every deploy, which tells
// crawlers everything changed weekly when nothing did.
const lastModified = new Date("2026-07-19");

export default function sitemap(): MetadataRoute.Sitemap {
    const mainPage = {
        url: absoluteUrl("/"),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 1,
    };

    const rulePages = rules.map((rule) => ({
        url: absoluteUrl(`/rules/${rule.id}`),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [mainPage, ...rulePages];
}
