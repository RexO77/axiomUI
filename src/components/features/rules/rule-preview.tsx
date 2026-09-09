import type { Rule } from "@/data/ui-logic";
import {
    MiniButton,
    MiniLine,
    MiniPill,
    PreviewFrame,
    type PreviewRenderer,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";
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
    size?: PreviewSize;
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

export function getStaticRulePreview(
    ruleId: string,
    variant: Variant,
    size: PreviewSize
) {
    const prefix = ruleId.split("-")[0];
    return renderers[prefix]?.(ruleId, variant, size) ?? null;
}

export function RulePreview({ rule, variant, size = "sm" }: RulePreviewProps) {
    // Rules with a motion showcase render its pane preview here (grid cards).
    // The lg deep-dive renders <MotionShowcase> directly — see rule-drawer /
    // rules/[id]/page, which skip RulePreview for showcase rules.
    if (hasShowcase(rule.id)) {
        return <PanePreview ruleId={rule.id} variant={variant} size={size} />;
    }

    const preview = getStaticRulePreview(rule.id, variant, size);
    if (preview) {
        return preview;
    }

    return (
        <GenericPreview
            label={variant === "do" ? rule.do : rule.dont}
            size={size}
        />
    );
}

function GenericPreview({ label, size }: { label: string; size: PreviewSize }) {
    return (
        <PreviewFrame size={size}>
            <div className="flex items-center justify-between">
                <MiniLine widthClass="w-16" />
                <MiniPill label="UI" size={size} />
            </div>
            <div className="mt-2 space-y-1">
                <MiniLine widthClass="w-full" />
                <MiniLine widthClass="w-5/6" />
            </div>
            <div className="mt-2">
                <MiniButton label={label} variant="secondary" size={size} className="max-w-full" />
            </div>
        </PreviewFrame>
    );
}
