// design-system: strict
"use client";

/*
 * The shell's overlays: the peek card, the ⌘K palette and the shortcuts
 * sheet, with the keys that open them. The modal session itself is the
 * shell's (modal.ts); this mounts the two modals that belong to it here and
 * routes their keys.
 *
 * Keys, from the shared table:
 * - ⌘K / Ctrl+K opens the palette in either view, or closes it. `/` opens it
 *   on a rule and focuses the wall's own search field on the wall; on phones,
 *   where the wall shows no field, `/` opens the palette in either view.
 * - `?` opens the shortcuts sheet; ⌘/ / Ctrl+/ opens it even with single
 *   keys off.
 * - While a modal is open only those two command keys act: each hands the
 *   session over without losing its opener. A dialog outside the session
 *   (the skills dialog) blocks them.
 */

import { useEffect, useMemo, useRef } from "react";

import { useWall, wallDefaults } from "@/components/gallery/wall-context";
import { railOrder } from "@/data/taxonomy";
import { MODAL_SELECTOR, shortcutAction, shouldHandle } from "@/lib/navigation/keyboard";
import { createRoutes } from "@/lib/navigation/routes";

import { SHELL_MODAL_SELECTOR, type ModalSession } from "./modal";
import { Palette } from "./palette";
import { Peek } from "./peek";
import { useShell } from "./shell-context";
import { ShortcutsSheet } from "./shortcuts-sheet";
import "./overlays.css";

export function Overlays({ session }: { session: ModalSession }) {
  const { view, ruleId, peek, sheet, phone, singleKeys, modKey, openRule, exit, hrefFor } = useShell();
  const wall = useWall();
  // hrefFor is bound to the shell's base; the wall's own URL shares it.
  const routes = useMemo(() => createRoutes(hrefFor(railOrder[0].id).split("/rules/")[0]), [hrefFor]);

  const { open, close, isOpen, returnInstead } = session;
  const kind = session.kind;
  const kindRef = useRef(kind);
  useEffect(() => {
    kindRef.current = kind;
  }, [kind]);

  /* The opening keys: bubble phase, so fields and widgets go first. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Only the session's own dialogs hand their keys over; a foreign one (the skills dialog) keeps them.
      const owner = event.target instanceof Element ? event.target.closest(SHELL_MODAL_SELECTOR) : null;
      const action = shortcutAction(event, { view, singleKeys, ownerModal: owner ?? undefined });
      if (action !== "palette" && action !== "shortcuts") return;
      if (isOpen() && !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      if (action === "shortcuts") {
        if (kindRef.current !== "shortcuts") open("shortcuts");
      } else if (kindRef.current === "palette") close();
      else open("palette");
    };
    /* Phones: `/` opens search in either view, ahead of the wall's own `/`. */
    const onSlash = (event: KeyboardEvent) => {
      if (!phone) return;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || isOpen()) return;
      const gate = {
        key: event.key,
        target: event.target,
        defaultPrevented: event.defaultPrevented,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        repeat: event.repeat,
        isComposing: event.isComposing,
        eventPhase: Event.BUBBLING_PHASE,
      };
      if (!shouldHandle(gate, { singleKeys })) return;
      event.preventDefault();
      open("palette");
    };
    /* Esc with a modal open but focus outside it (only <body> can be: the rest is inert). */
    const onStrayEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen()) return;
      if (event.target instanceof Element && event.target.closest(MODAL_SELECTOR)) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("keydown", onSlash, true);
    document.addEventListener("keydown", onStrayEscape, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onSlash, true);
      document.removeEventListener("keydown", onStrayEscape, true);
    };
  }, [view, singleKeys, phone, open, close, isOpen]);

  /* A modal never shares the screen with the peek. */
  useEffect(() => {
    if (kind) peek.current?.close();
  }, [kind, peek]);

  /*
   * Opening a rule commits at 0ms (the keyboard path), so its title is on the
   * page as soon as `openRule` returns: the session's final close lands there,
   * where the shell would put focus for a rule entered from the wall.
   */
  const onOpen = (id: string) => {
    close();
    openRule(id);
    returnInstead(sheet.current?.querySelector<HTMLElement>("[data-rule-title]") ?? sheet.current);
  };

  /*
   * Shift+Enter: the wall, filtered in place. On a rule, leave for the wall
   * first and filter once it is there. Without a wall to ask (a test render),
   * load the filtered wall instead.
   */
  const onSearch = (query: string) => {
    returnInstead(sheet.current);
    close();
    if (wall.setFilter === wallDefaults.setFilter) {
      window.location.assign(routes.galleryHref({ q: query }));
      return;
    }
    if (view === "gallery") {
      wall.setFilter({ q: query, collection: null });
      return;
    }
    wall.queueFilter({ q: query, collection: null });
    exit("keyboard");
  };

  return (
    <>
      <Peek handle={peek} />
      {kind === "palette" ? <Palette session={session} currentId={ruleId} onClose={close} onOpen={onOpen} onSearch={onSearch} /> : null}
      {kind === "shortcuts" ? <ShortcutsSheet session={session} view={view} modKey={modKey} phone={phone} onClose={close} /> : null}
    </>
  );
}
