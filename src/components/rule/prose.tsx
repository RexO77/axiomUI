// design-system: strict

// Rule prose (the summary, the deep dive, Before you ship) with its code-like
// tokens (`scale(0)`, `--swipe-amount`, `element.animate()`) set in mono
// (prose-code.ts). No hooks, so it renders the same on the server and in the
// rule view.

import { codeTokens } from "./prose-code";

export function Prose({ text }: { text: string }) {
  return (
    <>
      {codeTokens(text).map((piece, index) =>
        typeof piece === "string" ? (
          piece
        ) : (
          <code key={index} className="rv-code">
            {piece.code}
          </code>
        ),
      )}
    </>
  );
}
