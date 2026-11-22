const ids = ["mobile-16", "mobile-17", "mobile-18", "mobile-19"];
export const isSheetRule = (id: string) => ids.includes(id);

export const sheetMetrics = {
  logHeight: 240, articleStart: 260, half: 320, expanded: 568,
  header: 56, inset: 16, row: 56, firstDeparture: 25, departures: 40,
} as const;

export const visitOptions = [
  "Guided tour", "Garden entry", "Audio guide", "Printed map", "Sketchbook",
  "Picnic table", "Bike parking", "Locker", "Quiet room", "Step-free route",
  "Hearing loop", "Wheelchair access",
] as const;

/** Project a flick in this fixture, retaining the starting owner through release. */
export function finishPull(start: number, travel: number, velocity: number, keepOwner: boolean) {
  const projected = travel + Math.max(-8, Math.min(8, velocity)) * 750;
  const dismiss = (start === 0 || !keepOwner) && projected - start >= 64 && travel >= 8;
  return { offset: Math.max(0, start - projected), dismiss, owner: dismiss || (start === 0 && travel > 0) ? "Sheet" : "List" };
}

export const filters = ["Size 9", "Size 11", "Black", "Under $120"] as const;
export type Filter = typeof filters[number];
const shoes = [
  { name: "Court low", color: "Black", sizes: [8, 9, 10], price: 95 },
  { name: "Track runner", color: "Chalk", sizes: [9, 11], price: 110 },
  { name: "Ridge boot", color: "Black", sizes: [9, 11], price: 165 },
  { name: "Canvas slip-on", color: "Sage", sizes: [8, 10], price: 68 },
  { name: "Road trainer", color: "Black", sizes: [9, 10], price: 115 },
];
export function toggleFilter(active: readonly Filter[], filter: Filter) {
  if (active.includes(filter)) return active.filter(value => value !== filter);
  return [...active.filter(value => !(filter.startsWith("Size ") && value.startsWith("Size "))), filter];
}
export function matchingShoes(active: readonly Filter[]) {
  return shoes.filter(shoe => active.every(filter => {
    if (filter === "Black") return shoe.color === filter;
    if (filter === "Under $120") return shoe.price < 120;
    return shoe.sizes.includes(Number(filter.slice(5)));
  }));
}
