import type { Variant } from "@/components/features/rules/preview-primitives";
import { intersection, keyboardViewport, windows } from "./geometry";

export const fieldSizes = { do: 16, dont: 14 } as const;
export const focusScale = (side: Variant, focused: boolean) => focused ? fieldSizes.do / fieldSizes[side] : 1;
export type ResizePolicy = Parameters<typeof keyboardViewport>[1];
export type KeyboardShape = "Docked" | "Floating" | "Hardware";

export function composerGeometry(side: Variant, raised: boolean, policy: ResizePolicy, shape: KeyboardShape) {
  const { width, height } = windows.portrait;
  const floating = shape === "Floating";
  const bounds = keyboardViewport(height, floating ? "overlay" : policy, raised && shape !== "Hardware");
  const keyboard = floating && raised
    ? { x: 98, y: height - 256, width: 280, height: 220 }
    : { x: 0, y: bounds.keyboardTop, width, height: bounds.keyboardHeight };
  const heightOfComposer = 108;
  const anchor = side === "do" ? bounds.offset + bounds.visualHeight : bounds.layoutHeight;
  const composer = { x: 16, y: anchor - heightOfComposer, width: width - 32, height: heightOfComposer };
  if (side === "do" && intersection(composer, keyboard)) composer.y = keyboard.y - composer.height;
  return { bounds, keyboard, composer, covered: !!intersection(composer, keyboard) };
}
