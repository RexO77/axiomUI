export const siteConfig = {
  name: "Axiom UI",
  origin: "https://axiomui.nischal.fyi",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.origin).toString();
}
