import type { PreviewRenderer } from "@/components/features/rules/preview-primitives";
import { FeedbackStill } from "./feedback-still";
import { GestureStill } from "./gestures-still";
import { KeyboardStill } from "./keyboard-still";
import { mobileScene, type GestureId } from "./kit/scenes";
import { NavigationStill } from "./navigation-still";
import { ScreenStill } from "./screen-still";
import { SheetsStill } from "./sheets-still";
import { TextSizeStill } from "./text-size-still";
import { TouchStill } from "./touch-still";

// Every import here is server-safe, so the wall's Mobile tiles stay server-rendered.
export const mobilePreviews: PreviewRenderer = (id, variant) => {
  switch (mobileScene(id)) {
    case "screen": return <ScreenStill safe={id === "mobile-1"} variant={variant} />;
    case "touch": return <TouchStill id={id} variant={variant} />;
    case "navigation": return <NavigationStill id={id} variant={variant} />;
    case "gestures": return <GestureStill id={id as GestureId} variant={variant} />;
    case "sheets": return <SheetsStill id={id} variant={variant} />;
    case "keyboard": return <KeyboardStill id={id} variant={variant} />;
    case "textSize": return <TextSizeStill id={id} variant={variant} />;
    case "feedback": return <FeedbackStill id={id} variant={variant} />;
    default: return null;
  }
};
