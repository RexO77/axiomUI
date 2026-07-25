import type { DeepDiveSection } from "@/data/ui-logic";

export function findTextSection(
  sections: DeepDiveSection[],
  title: string,
): string | null {
  const section = sections.find((item) => item.type === "text" && item.title === title);
  return section?.type === "text" ? section.content : null;
}

export function findListSection(
  sections: DeepDiveSection[],
  title: string,
): string[] {
  const section = sections.find((item) => item.type === "list" && item.title === title);
  return section?.type === "list" ? section.items : [];
}

export function findCodeSection(
  sections: DeepDiveSection[],
  title: string,
): string | null {
  const section = sections.find((item) => item.type === "code" && item.title === title);
  return section?.type === "code" ? section.code : null;
}
