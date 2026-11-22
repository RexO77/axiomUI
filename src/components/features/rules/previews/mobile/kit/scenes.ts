// The one routing table for the Mobile rules: which phone scene demonstrates
// each rule. The rule view (comparison.tsx) and the wall's stills (index.tsx)
// both read it, so a rule never gets a scene in one and not the other.
// Pure data: safe on the server.

const scenes = {
  screen: ["mobile-1", "mobile-2"],
  touch: ["mobile-3", "mobile-4", "mobile-5", "mobile-6"],
  navigation: ["mobile-7", "mobile-8", "mobile-9", "mobile-10", "mobile-11"],
  gestures: ["mobile-12", "mobile-13", "mobile-14", "mobile-15"],
  sheets: ["mobile-16", "mobile-17", "mobile-18", "mobile-19"],
  keyboard: ["mobile-20", "mobile-21"],
  textSize: ["mobile-22", "mobile-23"],
  feedback: ["mobile-24", "mobile-25", "mobile-26"],
} as const;

export type MobileScene = keyof typeof scenes;
export type GestureId = (typeof scenes.gestures)[number];

const sceneOf = new Map<string, MobileScene>(
  (Object.keys(scenes) as MobileScene[]).flatMap((scene) => scenes[scene].map((id) => [id, scene] as const)),
);

/** The scene for a Mobile rule, or null for an id outside the table. */
export const mobileScene = (id: string): MobileScene | null => sceneOf.get(id) ?? null;
export const sceneIds = (scene: MobileScene): readonly string[] => scenes[scene];
export const isGestureRule = (id: string): id is GestureId => sceneOf.get(id) === "gestures";
