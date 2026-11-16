// design-system: strict
"use client";

/*
 * The `?` sheet: every shortcut for the view you are in, rendered from the
 * same table the shell dispatches from (src/lib/navigation/keyboard.ts), so
 * the two never disagree. Single-key shortcuts have an off switch (WCAG
 * 2.1.4); ⌘/ (Ctrl+/ elsewhere) always opens this sheet, so the switch can be
 * turned back on without a single-key shortcut.
 *
 * It is one of the shell's modals (modal.ts). Opened from the palette, it
 * takes over the palette's session, and closing it returns focus to whatever
 * opened the palette.
 */

import { X } from "lucide-react";
import { useId, useRef } from "react";

import { Kbd } from "@/components/ui/kbd";
import { shortcuts, type Shortcut } from "@/lib/navigation/keyboard";
import { memoryStore, useMemory } from "@/lib/navigation/memory";
import type { ShellView } from "@/lib/navigation/routes";

import { trapTab, useModal, type ModalSession } from "./modal";

/**
 * What the off switch turns off, read from the table rather than the label
 * (labels are glyphs, like ⇧J): no ⌘ or Ctrl, and every key one character.
 * It is the dispatcher's own test, so J, ⇧J, /, [, D, F, Z, I and ? go off,
 * and ⌘K, the arrows, Enter and Esc stay.
 */
export const isSingleKey = (shortcut: Shortcut) => !shortcut.command && shortcut.keys.length > 0 && shortcut.keys.every((key) => key.length === 1);

/** The keycaps for a row. Command rows name this platform's modifier only: ⌘K on a Mac, Ctrl+K elsewhere. */
export function keycaps(shortcut: Shortcut, modKey: string): string[] {
  if (shortcut.command) {
    const key = shortcut.keys[0].toUpperCase();
    return [modKey.trim() === "⌘" ? `⌘${key}` : `Ctrl+${key}`];
  }
  return shortcut.label.split(" / ");
}

const SPOKEN: Readonly<Record<string, string>> = { "←": "Left arrow", "→": "Right arrow", "↑": "Up arrow", "↓": "Down arrow", "⌘": "Command ", "⇧": "Shift " };

/** A keycap whose glyphs a screen reader says as words: <kbd> takes no aria-label. */
function Keycap({ text, off }: { text: string; off: boolean }) {
  const spoken = text.replace(/[←→↑↓⌘⇧]/g, (glyph) => SPOKEN[glyph]).trim();
  return (
    <Kbd size="lg" data-off={off}>
      {spoken === text ? (
        text
      ) : (
        <>
          <span aria-hidden="true">{text}</span>
          <span className="sr-only">{spoken}</span>
        </>
      )}
    </Kbd>
  );
}

export type ShortcutsSheetProps = {
  session: Pick<ModalSession, "isOpen" | "returnTo">;
  view: ShellView;
  modKey: string;
  /** Phones have no rail, so no sidebar key. */
  phone: boolean;
  onClose: () => void;
};

export function ShortcutsSheet({ session, view, modKey, phone, onClose }: ShortcutsSheetProps) {
  const uid = useId();
  const dialog = useRef<HTMLDivElement>(null);
  useModal(dialog, session);
  const { prefs } = useMemory();
  const on = prefs.singleKeys;
  const rows = shortcuts.filter((shortcut) => shortcut[view] && !(phone && shortcut.action[view] === "sidebar"));
  const mod = modKey.trim() === "⌘" ? "⌘" : "Ctrl+";

  return (
    <>
      <div data-scrim="" className="overlay-scrim" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        data-shell-modal=""
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        className="keys-sheet"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
            return;
          }
          trapTab(event, event.currentTarget);
        }}
      >
        <div className="keys-head">
          <h2 id={`${uid}-title`}>Keyboard shortcuts</h2>
          <button type="button" className="keys-close" aria-label="Close" onClick={onClose} autoFocus>
            <X aria-hidden="true" />
          </button>
        </div>
        <table className="keys-table">
          <caption className="sr-only">{view === "rule" ? "On a rule" : "On all rules"}</caption>
          <tbody>
            {rows.map((shortcut) => {
              const off = !on && isSingleKey(shortcut);
              return (
                <tr key={`${shortcut.label}-${shortcut[view]}`} data-off={off ? "" : undefined}>
                  <th scope="row">
                    {keycaps(shortcut, modKey).map((cap) => (
                      <Keycap key={cap} text={cap} off={off} />
                    ))}
                  </th>
                  <td>
                    {shortcut[view]}
                    {off ? <span className="keys-off"> · off</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="keys-foot">
          <div className="keys-switch">
            <span>
              <label htmlFor={`${uid}-switch`} className="keys-switch-title">
                Single-key shortcuts
              </label>
              <span id={`${uid}-help`} className="keys-switch-help">
                Letters and punctuation without a modifier. {mod}/ always opens this sheet.
              </span>
            </span>
            <button
              id={`${uid}-switch`}
              type="button"
              role="switch"
              aria-checked={on}
              aria-describedby={`${uid}-help`}
              className="keys-switch-track"
              onClick={() => memoryStore.setPrefs({ singleKeys: !on })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
