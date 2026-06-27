import { MetadataRoute } from "next";
import { rules } from "@/data/ui-logic";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const mainPage = {
        url: absoluteUrl("/"),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1,
    };

    const rulePages = rules.map((rule) => ({
        url: absoluteUrl(`/rules/${rule.id}`),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [mainPage, ...rulePages];
}
