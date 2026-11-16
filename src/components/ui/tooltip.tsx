// design-system: strict
"use client";

import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const OPEN_DELAY_MS = 300;
const CLOSE_DELAY_MS = 150;
const WARM_MS = 300;
let warmUntil = 0;
let closeActive: (() => void) | null = null;
const dismissAll = new Set<() => void>();

/** Modal sessions cancel visible descriptions and pending opens before becoming inert. */
export function closeAllTooltips() {
  dismissAll.forEach((dismiss) => dismiss());
  closeActive = null;
  warmUntil = 0;
}

export type TooltipProps = {
  content: ReactNode;
  /** A single control or radio group; its existing description is preserved. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "right" | "left" | "top" | "bottom";
  disabled?: boolean;
  /** Flex-row layout (for example shrink-0 or ml-auto) belongs on this wrapper. */
  className?: string;
};

/** Noninteractive description with a portal and a continuous pointer bridge to its trigger. */
export function Tooltip({ content, children, side = "right", disabled = false, className }: TooltipProps) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false);
  const tipHovered = useRef(false);
  const focused = useRef(false);
  const dismissed = useRef(false);
  const isOpen = useRef(false);
  const [state, setState] = useState({ open: false, disabled });
  if (state.disabled !== disabled) setState({ open: false, disabled });
  const open = state.open;

  const close = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    if (isOpen.current) warmUntil = Date.now() + WARM_MS;
    isOpen.current = false;
    // A removed portal cannot send pointerleave; don't keep its hover latched.
    tipHovered.current = false;
    if (!hovered.current && !focused.current) dismissed.current = false;
    setState((current) => ({ ...current, open: false }));
  }, []);

  useEffect(() => {
    const dismiss = () => {
      dismissed.current = hovered.current || tipHovered.current || focused.current;
      close();
    };
    dismissAll.add(dismiss);
    return () => { dismissAll.delete(dismiss); };
  }, [close]);

  useEffect(() => {
    if (!disabled) return;
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    if (isOpen.current) warmUntil = Date.now() + WARM_MS;
    isOpen.current = false;
    if (closeActive === close) closeActive = null;
  }, [disabled, close]);

  const show = () => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    if (disabled || dismissed.current || isOpen.current) return;
    const commit = () => {
      closeActive?.();
      closeActive = close;
      isOpen.current = true;
      setState({ open: true, disabled });
    };
    if ((closeActive && closeActive !== close) || Date.now() < warmUntil) commit();
    else openTimer.current = setTimeout(commit, OPEN_DELAY_MS);
  };

  const leave = () => {
    clearTimeout(openTimer.current);
    if (hovered.current || tipHovered.current || focused.current) return;
    dismissed.current = false;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      close();
      if (closeActive === close) closeActive = null;
    }, CLOSE_DELAY_MS);
  };

  useLayoutEffect(() => {
    if (!open || disabled) return;
    const place = () => {
      const control = anchor.current?.getBoundingClientRect();
      const element = tip.current;
      if (!control || !element) return;
      const bounds = element.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      let left = side === "left" ? control.left - bounds.width : side === "right" ? control.right : control.left + (control.width - bounds.width) / 2;
      let top = side === "top" ? control.top - bounds.height : side === "bottom" ? control.bottom : control.top + (control.height - bounds.height) / 2;
      left = Math.max(8, Math.min(left, viewportWidth - bounds.width - 8));
      top = Math.max(8, Math.min(top, viewportHeight - bounds.height - 8));
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.visibility = "visible";
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    if (tip.current) observer?.observe(tip.current);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      observer?.disconnect();
    };
  }, [open, disabled, side, content]);

  useEffect(() => {
    if (!open || disabled) return;
    const dismiss = () => {
      dismissed.current = true;
      close();
      if (closeActive === close) closeActive = null;
    };
    /** Keyboard focus opened this tip and Esc was pressed on its own trigger. */
    const ownsEscape = (event: KeyboardEvent) =>
      focused.current && event.target instanceof Node && Boolean(anchor.current?.contains(event.target));
    // That Esc belongs to the tip: consumed at the trigger's wrapper, before
    // the shell's document handler can also act on it.
    const onTriggerKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !ownsEscape(event)) return;
      if (!event.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
      }
      dismiss();
    };
    // Any other Esc (a pointer-opened tip, focus in a field) closes the tip
    // and still reaches whatever has focus.
    const onAnyKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !ownsEscape(event)) dismiss();
    };
    const trigger = anchor.current;
    trigger?.addEventListener("keydown", onTriggerKey);
    document.addEventListener("keydown", onAnyKey, true);
    return () => {
      trigger?.removeEventListener("keydown", onTriggerKey);
      document.removeEventListener("keydown", onAnyKey, true);
    };
  }, [open, disabled, close]);

  useEffect(() => () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    if (isOpen.current) warmUntil = Date.now() + WARM_MS;
    if (closeActive === close) closeActive = null;
  }, [close]);

  const visible = open && !disabled;
  const describedBy = [children.props["aria-describedby"], visible ? id : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <>
      <span
        ref={anchor}
        className={cn("inline-flex", className)}
        onPointerEnter={(event) => {
          if (event.pointerType === "touch") return;
          hovered.current = true;
          show();
        }}
        onPointerLeave={() => { hovered.current = false; leave(); }}
        // A click closes the tip and its focus doesn't reopen it: only keyboard
        // focus (:focus-visible) shows a tip, so one click never pins it open.
        onPointerDown={() => { focused.current = false; close(); }}
        onFocus={(event) => {
          if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
          focused.current = true;
          show();
        }}
        onBlur={(event) => {
          if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
          focused.current = false;
          leave();
        }}
      >
        {cloneElement(children, { "aria-describedby": describedBy })}
      </span>
      {visible && typeof document !== "undefined" ? createPortal(
        <div
          ref={tip}
          id={id}
          role="tooltip"
          className={cn(
            "fixed z-50 max-w-[calc(100vw-16px)] transition-[opacity,translate] duration-fast ease-out-strong motion-safe:starting:-translate-x-1 starting:opacity-0 motion-reduce:transition-opacity",
            side === "right" ? "pl-2" : side === "left" ? "pr-2" : side === "top" ? "pb-2" : "pt-2",
          )}
          style={{ left: 0, top: 0, visibility: "hidden" }}
          onPointerEnter={() => {
            tipHovered.current = true;
            clearTimeout(closeTimer.current);
          }}
          onPointerLeave={() => { tipHovered.current = false; leave(); }}
        >
          <div className="rounded-tip bg-inverse px-2 py-1 text-xs leading-4 font-medium text-on-inverse [overflow-wrap:anywhere] forced-colors:outline">
            {content}
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
