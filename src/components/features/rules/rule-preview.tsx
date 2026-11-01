import type { Rule } from "@/data/ui-logic";
import { type PreviewRenderer, type Variant } from "@/components/features/rules/preview-primitives";
import { hasShowcase, PanePreview } from "@/components/features/rules/demos/registry";
import { accessibilityPreviews } from "@/components/features/rules/previews/accessibility";
import { colorPreviews } from "@/components/features/rules/previews/color";
import { componentPreviews } from "@/components/features/rules/previews/components";
import { formPreviews } from "@/components/features/rules/previews/forms";
import { layoutPreviews } from "@/components/features/rules/previews/layout";
import { systemPreviews } from "@/components/features/rules/previews/system";
import { typographyPreviews } from "@/components/features/rules/previews/typography";

interface RulePreviewProps {
    rule: Rule;
    variant: Variant;
}

// Static previews live in one module per rule category, keyed by id prefix.
const renderers: Record<string, PreviewRenderer> = {
    typo: typographyPreviews,
    layout: layoutPreviews,
    color: colorPreviews,
    comp: componentPreviews,
    form: formPreviews,
    sys: systemPreviews,
    a11y: accessibilityPreviews,
};

export function getStaticRulePreview(ruleId: string, variant: Variant) {
    const prefix = ruleId.split("-")[0];
    return renderers[prefix]?.(ruleId, variant) ?? null;
}

/**
 * One pane of a rule's do/don't comparison. Showcase rules render their
 * pane preview (the grid cards); the drawer and the rule page render
 * <MotionShowcase> for those instead. Every other rule has an authored
 * static pane, which rule-previews.test.ts enforces, so there is no
 * generic fallback.
 */
export function RulePreview({ rule, variant }: RulePreviewProps) {
    if (hasShowcase(rule.id)) {
        return <PanePreview ruleId={rule.id} variant={variant} />;
    }
    return getStaticRulePreview(rule.id, variant);
}
