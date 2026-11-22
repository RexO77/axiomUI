import { rules } from "@/data/ui-logic";
import type { PreviewRenderer } from "@/components/features/rules/preview-primitives";
import { KeyboardStill } from "./keyboard";
import { TextSizeStill } from "./text-size";
import { SheetsStill } from "./sheets";
import { isSheetRule } from "./kit/sheets-fixtures";
import { TouchStill } from "./touch";
import { touchIds } from "./touch-ids";
import { isNavigation } from "./kit/navigation-fixture";
import { NavigationStill } from "./navigation";
import { GestureStill } from "./gestures";
import { FeedbackStill } from "./feedback";
import { ScreenStill } from "./screen";

// TODO: Replace each remaining caption pair with the matching group's scene.
export const mobilePreviews: PreviewRenderer = (id, variant) => {
  if (touchIds.includes(id)) return <TouchStill id={id} variant={variant} />;
  if (isNavigation(id)) return <NavigationStill id={id} variant={variant} />;
  if (id === "mobile-12" || id === "mobile-13" || id === "mobile-14" || id === "mobile-15") return <GestureStill id={id} variant={variant} />;
  if (id === "mobile-1" || id === "mobile-2") return <ScreenStill safe={id === "mobile-1"} variant={variant} />;
  if (id === "mobile-20" || id === "mobile-21") return <KeyboardStill id={id} variant={variant} />;
  if (id === "mobile-22" || id === "mobile-23") return <TextSizeStill id={id} variant={variant} />;
  if (isSheetRule(id)) return <SheetsStill id={id} variant={variant} />;
  if (["mobile-24", "mobile-25", "mobile-26"].includes(id)) return <FeedbackStill id={id} variant={variant} />;
  const rule = rules.find(entry => entry.id === id && entry.category === "mobile");
  return rule ? <span className="max-w-52 text-sm text-ink-secondary">{rule[variant]}</span> : null;
};
