export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | { [key: string]: boolean }

function toClassString(value: ClassValue, classes: string[]) {
  if (!value) return
  if (typeof value === "string" || typeof value === "number") {
    classes.push(String(value))
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => toClassString(item, classes))
    return
  }
  for (const [key, enabled] of Object.entries(value)) {
    if (enabled) classes.push(key)
  }
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []
  inputs.forEach((input) => toClassString(input, classes))
  return classes.join(" ")
}
