// design-system: strict
"use client";

/*
 * The phone menu: the expanded sidebar as a full-height sheet from the left.
 * Below 352px the strip's one category button opens it too, as the contents.
 *
 * It is modal (modal.ts): the rest of the document is inert, Tab wraps
 * inside, Esc is handled here, and focus returns to the opener after `inert`
 * lifts. The scrim closes on a tap (a click), never on touch-down, and takes
 * no gestures of its own. The sheet follows a leftward drag 1:1; a flick or a
 * drag past 40% of its width dismisses it, anything less springs back.
 *
 * Motion: in at 220ms on --ease-drawer, out at 140ms on --ease-out-strong.
 * A keyboard close and reduced motion are 0ms.
 */

import { X } from "@/components/ui/icons";
import { useEffect, useRef, type ReactNode } from "react";

import { AxiomLogo } from "@/components/ui/axiom-logo";
import { prefersReducedMotion } from "@/lib/media";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { siteConfig } from "@/lib/site";
import { trapTab, useModal, type ModalSession } from "./modal";

const OUT_MS = 140;
const BACK_MS = 220;
/** Leftward speed, in px per ms, that reads as a flick. */
const FLICK = 0.35;
/** A drag decides its direction after this many px. */
const SLOP_PX = 8;

type Drag = { id: number; x0: number; y0: number; dx: number; active: boolean; samples: [number, number][] };

type PhoneMenuProps = {
  session: Pick<ModalSession, "isOpen" | "returnTo">;
  routes: CatalogRoutes;
  /** The wall is on screen: the home link is the current page. */
  atHome: boolean;
  onHome: (origin: "pointer" | "keyboard") => void;
  onClose: () => void;
  /** The sidebar list. */
  children: ReactNode;
  /** Rows under the list. */
  foot?: ReactNode;
};

export function PhoneMenu({ session, routes, atHome, onHome, onClose, children, foot }: PhoneMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const closing = useRef(false);
  const timer = useRef(0);
  useModal(panel, session);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Slide out from wherever the sheet is, then unmount. 0ms from the keyboard or under reduced motion. */
  const close = (animate: boolean) => {
    const el = panel.current;
    if (closing.current) return;
    if (!animate || !el || prefersReducedMotion()) {
      onClose();
      return;
    }
    closing.current = true;
    el.style.transition = `transform ${OUT_MS}ms var(--ease-out-strong)`;
    el.style.transform = "translateX(calc(-100% - 16px))";
    if (scrim.current) {
      scrim.current.style.transition = `opacity ${OUT_MS}ms var(--ease-out-strong)`;
      scrim.current.style.opacity = "0";
    }
    let done = false;
    const finish = () => {
      // The panel may already be gone: a route change or the phone layout ending closed it first.
      if (done || !panel.current) return;
      done = true;
      window.clearTimeout(timer.current);
      onClose();
    };
    el.addEventListener("transitionend", (event) => event.target === el && finish(), { once: true });
    timer.current = window.setTimeout(finish, OUT_MS + 60);
  };

  const springBack = () => {
    const el = panel.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    el.style.transition = reduced ? "none" : `transform ${BACK_MS}ms var(--ease-drawer)`;
    el.style.transform = "";
    if (scrim.current) {
      scrim.current.style.transition = reduced ? "none" : `opacity ${BACK_MS}ms var(--ease-drawer)`;
      scrim.current.style.opacity = "";
    }
  };

  return (
    <>
      <div ref={scrim} data-scrim="" className="phone-scrim" aria-hidden="true" onClick={(event) => close(event.detail !== 0)} />
      <div
        ref={panel}
        className="phone-menu"
        role="dialog"
        aria-modal="true"
        data-shell-modal=""
        aria-label="All rules"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close(false);
            return;
          }
          trapTab(event, event.currentTarget);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" || closing.current) return;
          drag.current = { id: event.pointerId, x0: event.clientX, y0: event.clientY, dx: 0, active: false, samples: [[event.timeStamp, event.clientX]] };
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          const el = panel.current;
          if (!d || d.id !== event.pointerId || !el) return;
          const dx = event.clientX - d.x0;
          const dy = event.clientY - d.y0;
          if (!d.active) {
            if (Math.abs(dx) < SLOP_PX && Math.abs(dy) < SLOP_PX) return;
            // Up, down or rightwards: the list scrolls; this is not a dismiss.
            if (Math.abs(dy) > Math.abs(dx) || dx > 0) {
              drag.current = null;
              return;
            }
            d.active = true;
            el.setPointerCapture(event.pointerId);
            el.style.transition = "none";
            if (scrim.current) scrim.current.style.transition = "none";
          }
          d.dx = Math.min(0, dx);
          el.style.transform = `translateX(${d.dx}px)`;
          if (scrim.current) scrim.current.style.opacity = String(Math.max(0, 1 + d.dx / el.offsetWidth));
          d.samples.push([event.timeStamp, event.clientX]);
          while (d.samples.length > 2 && event.timeStamp - d.samples[0][0] > 100) d.samples.shift();
        }}
        onPointerUp={(event) => {
          const d = drag.current;
          drag.current = null;
          const el = panel.current;
          if (!d || d.id !== event.pointerId || !d.active || !el) return;
          const [t0, x0] = d.samples[0];
          const speed = event.timeStamp > t0 ? (event.clientX - x0) / (event.timeStamp - t0) : 0;
          if (d.dx < -el.offsetWidth * 0.4 || (speed < -FLICK && d.dx < -16)) close(true);
          else springBack();
        }}
        onPointerCancel={() => {
          if (drag.current?.active) springBack();
          drag.current = null;
        }}
      >
        <div className="phone-menu-head">
          <a
            className="phone-menu-home"
            href={routes.galleryHref()}
            aria-label={`${siteConfig.name}, all rules`}
            aria-current={atHome ? "page" : undefined}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onHome(event.detail === 0 ? "keyboard" : "pointer");
            }}
          >
            <span className="rail-logo-tile">
              <AxiomLogo className="size-4" />
            </span>
            {siteConfig.name}
          </a>
          <button type="button" className="shell-ctl phone-ctl" aria-label="Close menu" autoFocus onClick={(event) => close(event.detail !== 0)}>
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
        {foot ? <div className="phone-menu-foot">{foot}</div> : null}
      </div>
    </>
  );
}
