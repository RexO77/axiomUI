// Gesture geometry the stills share with the demos. Pure: safe on the server.
export const anchors = { do: 48, dont: 4 };
export const detents = { Peek: 120, Half: 422, Full: 785 };
export const photoActions = ["Share", "Favorite", "Delete"] as const;
export const holdTime = 500;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
