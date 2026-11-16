// design-system: strict
// Code-like tokens in rule prose (summaries, the deep dive, Before you ship):
// the copy names CSS and DOM APIs inline, and set in Manrope they read as
// words ("scale(0)", "--swipe-amount", "element.animate()"). This finds them
// so Stage can set them in Plex Mono. Conservative on purpose: a miss is
// prose that stays prose; a false hit puts a normal word in mono.
//
// Recognised, in priority order:
//   `anything`                  backticks (the marks are dropped)
//   --custom-property           CSS custom properties
//   @keyframes, @media, …       a fixed list of at-rules
//   name(), obj.method(args)    calls with empty args, args that start like a
//                               value (digit, sign, #, quote), a name with a
//                               dot, dash or capital, or a known CSS function
//   element.style.transform     member chains (2+ char segments, not a domain)
//   setInterval, useEffect, …   set/use/on/request… + Capital identifiers
//   (bg-blue-500/10, gap-4)     Tailwind-style utilities inside parentheses
//                               (each token is marked, not the parentheses)

export type CodePiece = string | { code: string };

const AT_RULES = "keyframes|media|starting-style|supports|container|layer|font-face|property|import";
const CSS_FNS = new Set(["var", "env", "calc", "clamp", "min", "max", "url", "attr", "color-mix"]);
const NOT_MEMBER_TAIL = new Set(["com", "org", "net", "io", "dev", "app", "co", "pdf", "png", "jpg", "jpeg", "gif", "svg", "webp", "zip", "txt", "md", "html", "htm"]);
const UTILITY_PREFIX = new Set([
  "bg", "text", "border", "ring", "outline", "shadow", "rounded", "gap", "space", "p", "px", "py", "pt", "pr", "pb", "pl",
  "m", "mx", "my", "mt", "mr", "mb", "ml", "w", "h", "min", "max", "size", "overflow", "font", "leading", "tracking",
  "flex", "grid", "col", "row", "items", "justify", "self", "place", "inset", "top", "right", "bottom", "left", "z",
  "opacity", "transition", "duration", "ease", "delay", "scale", "translate", "rotate", "line", "truncate", "whitespace",
  "break", "aspect", "object", "fill", "stroke", "divide", "focus", "hover", "active", "disabled", "sr", "not",
]);

// One utility token: optional variant prefixes (hover:, md:), an optional
// leading minus, then dash-joined segments, an optional /opacity.
const UTILITY = /^(?:[a-z0-9-]+:)*-?[a-z]+(?:-[a-z0-9.]+)+(?:\/\d+)?$/;

function isUtility(token: string) {
  if (!UTILITY.test(token)) return false;
  if (/\d/.test(token) || token.includes("/")) return true;
  const base = token.replace(/^(?:[a-z0-9-]+:)*-?/, "");
  return UTILITY_PREFIX.has(base.split("-")[0]);
}

function looksLikeCall(name: string, args: string) {
  if (args.trim() === "") return true;
  // "item(s)", "follow-up(s)": a plural, not a call.
  if (/^(?:s|es)$/i.test(args)) return false;
  if (/^\s*[-+\d.#'"]/.test(args)) return true;
  if (name.includes(".") || name.includes("-") || /[a-z][A-Z]/.test(name)) return true;
  return CSS_FNS.has(name);
}

const TOKEN = new RegExp(
  [
    "`(?<tick>[^`\\n]+)`",
    "(?<![\\w-])(?<prop>--[a-z0-9]+(?:-[a-z0-9]+)*)",
    `(?<![\\w@])(?<at>@(?:${AT_RULES}))(?![\\w-])`,
    "(?<![\\w.@$-])(?<call>(?<cname>[A-Za-z_$][\\w$]*(?:[.-][A-Za-z_$][\\w$]*)*)\\((?<cargs>[^()\\n]{0,80})\\))",
    "(?<![\\w.@/$-])(?<member>[a-z][A-Za-z0-9]+(?:\\.[a-z][A-Za-z0-9]+)+)(?![\\w(.-])",
    "(?<![\\w.$-])(?<api>(?:set|use|on|request|get|add|remove|query|create)[A-Z][A-Za-z0-9]*)(?![\\w(])",
    "(?<paren>\\((?<pinner>[^()\\n]{1,80})\\))",
  ].join("|"),
  "g",
);

/** Split prose into text and code pieces. Joining the pieces (code as its
 *  text) gives back the input, except that backticks are dropped. */
export function codeTokens(text: string): CodePiece[] {
  const out: CodePiece[] = [];
  let last = 0;
  const push = (s: string) => {
    if (!s) return;
    const prev = out[out.length - 1];
    if (typeof prev === "string") out[out.length - 1] = prev + s;
    else out.push(s);
  };
  const re = new RegExp(TOKEN.source, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const g = m.groups!;
    const start = m.index;
    let pieces: CodePiece[] | null = null;
    if (g.tick !== undefined) pieces = [{ code: g.tick }];
    else if (g.prop || g.at || g.api) pieces = [{ code: m[0] }];
    else if (g.call !== undefined) {
      if (looksLikeCall(g.cname, g.cargs)) pieces = [{ code: g.call }];
    } else if (g.member !== undefined) {
      const segs = g.member.split(".");
      if (segs.every((s) => s.length >= 2) && !NOT_MEMBER_TAIL.has(segs[segs.length - 1].toLowerCase())) pieces = [{ code: g.member }];
    } else if (g.paren !== undefined) {
      const parts = g.pinner.split(/(,\s*)/);
      const tokens = parts.filter((_, i) => i % 2 === 0);
      if (tokens.length > 0 && tokens.every(isUtility)) {
        pieces = ["("];
        parts.forEach((p, i) => pieces!.push(i % 2 === 0 ? { code: p } : p));
        pieces.push(")");
      }
    }
    if (!pieces) {
      // Rejected: rescan from the next character, so a code token inside
      // rejected parentheses ("(see element.animate)") is still found.
      re.lastIndex = start + 1;
      continue;
    }
    push(text.slice(last, start));
    for (const p of pieces) {
      if (typeof p === "string") push(p);
      else out.push(p);
    }
    last = start + m[0].length;
  }
  push(text.slice(last));
  return out;
}
