export type RouteEntry = { path: string; anchor?: string; draft?: string; caret?: number };
export type HistoryState = { entries: RouteEntry[]; index: number; progress: number | null };
export function startHistory(entry: RouteEntry): HistoryState {
  return { entries: [entry], index: 0, progress: null };
}
export type NavigationEvent =
  | { type: "push" | "replace"; entry: RouteEntry }
  | { type: "preview"; progress: number }
  | { type: "back" | "cancel" | "forward" };
/** Each tab keeps its own history. A progress update never mutates the current entry. */
export function navigate(history: HistoryState, event: NavigationEvent): HistoryState {
  switch (event.type) {
    case "push": return { entries: [...history.entries.slice(0, history.index + 1), event.entry], index: history.index + 1, progress: null };
    case "replace": return { ...history, entries: history.entries.map((entry, i) => i === history.index ? event.entry : entry) };
    case "preview": return { ...history, progress: Math.max(0, Math.min(1, event.progress)) };
    case "cancel": return { ...history, progress: null };
    case "back": return { ...history, index: Math.max(0, history.index - 1), progress: null };
    case "forward": return { ...history, index: Math.min(history.entries.length - 1, history.index + 1), progress: null };
  }
}
