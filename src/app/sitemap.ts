import { MetadataRoute } from "next";
import { rules } from "@/data/ui-logic";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://axiom.design";

    // Main page
    const mainPage = {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1,
    };

    // Individual rule pages (for future implementation)
    const rulePages = rules.map((rule) => ({
        url: `${baseUrl}/rules/${rule.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [mainPage, ...rulePages];
}
