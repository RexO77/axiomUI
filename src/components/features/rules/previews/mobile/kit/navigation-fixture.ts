import { navigate, startHistory, type HistoryState, type RouteEntry } from "./navigation";
import { windows, type Size } from "./geometry";
import { mobileScene } from "./scenes";

export const destinations = ["Home", "Saved", "Orders", "Account"] as const;
export type Destination = typeof destinations[number];
export const product = { id: 18, name: "Pocket atlas", price: "$24", path: "/shop/products/18" };
export const shopTabs = ["Shop", "Bag"] as const;

export function tabHistories<T extends string>(tabs: readonly T[]) {
  return Object.fromEntries(tabs.map(tab => [tab, startHistory({ path: "/" + tab.toLowerCase() })])) as Record<T, HistoryState>;
}

export const windowSizes = [windows.split, windows.compact, windows.medium, windows.large, windows.short];
export function navigationSurface(size: Size, useWindow: boolean, tabletop: boolean) {
  const bounds = useWindow ? size : windows.large;
  return bounds.width < 600 || bounds.height < 480 || tabletop ? "Bottom bar" : "Side rail";
}

export function current(history: HistoryState) { return history.entries[history.index]; }
export const cafe: RouteEntry = { path: "/map", anchor: "Fern café" };
export const details: RouteEntry = { path: "/map/fern-cafe" };
export const inbox: RouteEntry = { path: "/inbox", anchor: "Row 18" };
export const draft: RouteEntry = { path: "/inbox/18/reply", draft: "See you at the station.", caret: 7 };

export function draftHistory() {
  return navigate(startHistory(inbox), { type: "push", entry: { ...draft } });
}

/** The faulty version spends its one pop when preview begins. */
export function backGesture(history: HistoryState, event: "preview" | "cancel" | "back", deferred: boolean, progress = 0) {
  if (event === "preview") {
    const initial = !deferred && history.progress === null ? navigate(history, { type: "back" }) : history;
    return navigate(initial, { type: "preview", progress });
  }
  return navigate(history, { type: event === "back" && !deferred ? "cancel" : event });
}

export const isNavigation = (id: string) => mobileScene(id) === "navigation";
