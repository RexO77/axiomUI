// design-system: strict
"use client";

/*
 * One modal at a time: the phone menu, the palette, the shortcuts sheet.
 *
 * A session starts when the first modal opens and ends when the last one
 * closes. The opener is captured only when a session starts, so one modal
 * handing over to another (the palette to the shortcuts sheet) still returns
 * focus to the control that began it, and focus moves back only on the final
 * close. Opening a modal closes every tooltip first: a description left on
 * screen would float over an inert page.
 *
 * While a dialog is mounted everything outside it is `inert`, every ancestor's
 * siblings up to <body>, so the skip link and the page behind can neither
 * take focus nor be read. Its scrim (data-scrim) stays live, so a tap on it
 * still closes the dialog; it is aria-hidden and never focusable. Tab wraps
 * inside the dialog (`trapTab`), Esc is the dialog's own, and on the final
 * close focus goes back once `inert` has been lifted, so it never falls to
 * <body>.
 */

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";

import { closeAllTooltips } from "@/components/ui/tooltip";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * The session's own dialogs carry `data-shell-modal`. Only they own the shell's
 * keys while focused; any other modal dialog (the skills dialog) blocks them.
 */
export const SHELL_MODAL_SELECTOR = '[aria-modal="true"][data-shell-modal]';

export type ModalKind = "menu" | "palette" | "shortcuts";

export type ModalSession = {
  /** The open modal, or null. */
  kind: ModalKind | null;
  open: (kind: ModalKind) => void;
  close: () => void;
  /** Read at any time, outside render: a modal is open. */
  isOpen: () => boolean;
  /** Send the final close's focus here instead of to the opener (a rule opened from the menu goes to the sheet). */
  returnInstead: (target: HTMLElement | null) => void;
  /** Where the final close sends focus: the override, else the opener while it is still on the page, else the fallback. */
  returnTo: () => HTMLElement | null;
};

/** The shell's one modal session. `fallback` receives focus when the opener has gone. */
export function useModalSession(fallback: RefObject<HTMLElement | null>): ModalSession {
  const [kind, setKind] = useState<ModalKind | null>(null);
  const current = useRef<ModalKind | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const override = useRef<HTMLElement | null>(null);

  const open = useCallback((next: ModalKind) => {
    if (!current.current) {
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
      override.current = null;
    }
    closeAllTooltips();
    current.current = next;
    setKind(next);
  }, []);
  const close = useCallback(() => {
    current.current = null;
    setKind(null);
  }, []);
  const isOpen = useCallback(() => current.current !== null, []);
  const returnInstead = useCallback((target: HTMLElement | null) => {
    override.current = target;
  }, []);
  const returnTo = useCallback(
    () => override.current ?? (opener.current?.isConnected ? opener.current : null) ?? fallback.current,
    [fallback],
  );

  return useMemo(() => ({ kind, open, close, isOpen, returnInstead, returnTo }), [kind, open, close, isOpen, returnInstead, returnTo]);
}

/**
 * Make everything outside `el` inert, up to <body>. Returns the undo. A
 * sibling that is already inert is left to whatever made it so: the rail
 * keeps its own `inert` for as long as a shell modal is open (rail.tsx), so a
 * layout change under the dialog cannot lift it.
 */
function inertOutside(el: HTMLElement): () => void {
  const touched: HTMLElement[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      if (sibling.tagName === "SCRIPT" || sibling.tagName === "STYLE") continue;
      // The dialog's own scrim stays live: a tap on it closes the dialog.
      if (sibling.hasAttribute("data-scrim")) continue;
      sibling.inert = true;
      touched.push(sibling);
    }
    node = node.parentElement;
  }
  return () => touched.forEach((sibling) => (sibling.inert = false));
}

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length > 0);
}

/** Tab and Shift+Tab wrap inside `root`. Call from the dialog's onKeyDown. */
export function trapTab(event: { key: string; shiftKey: boolean; preventDefault: () => void }, root: HTMLElement) {
  if (event.key !== "Tab") return;
  const list = focusables(root);
  if (list.length === 0) {
    event.preventDefault();
    return;
  }
  const index = list.findIndex((el) => el === document.activeElement);
  const next = index < 0 ? (event.shiftKey ? list.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + list.length) % list.length;
  // Safari's keyboard preference may skip controls during native Tab navigation.
  event.preventDefault();
  list[next].focus();
}

/**
 * While mounted, the rest of the document is inert. On unmount `inert` is
 * lifted first; then, if this was the session's last modal, focus goes to
 * `session.returnTo()`, falling back to the main sheet, never <body>.
 */
export function useModal(ref: RefObject<HTMLElement | null>, session: Pick<ModalSession, "isOpen" | "returnTo">) {
  const latest = useRef(session);
  useLayoutEffect(() => {
    latest.current = session;
  });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const undo = inertOutside(el);
    return () => {
      undo();
      const ok = (target: HTMLElement | null | undefined): target is HTMLElement =>
        Boolean(target && target.isConnected && !target.closest("[inert]"));
      // After the commit: the opener may sit in a subtree whose own `inert` prop clears in it,
      // and a modal taking over mounts in it too.
      queueMicrotask(() => {
        if (latest.current.isOpen()) return;
        const target = latest.current.returnTo();
        // Something already put focus inside the target (a rule opened from the menu focuses its title): keep it.
        if (ok(target) && !target.contains(document.activeElement)) target.focus({ preventScroll: true });
        if (document.activeElement === document.body || !document.activeElement) {
          const main = document.getElementById("main-content");
          if (ok(main)) main.focus({ preventScroll: true });
        }
      });
    };
  }, [ref]);
}
