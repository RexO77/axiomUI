// design-system: strict
"use client";

import type { CSSProperties, MouseEvent, ReactNode, TransitionEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Download, LoaderCircle, X } from "@/components/ui/icons";

import { skillsCliCommand } from "@/lib/skills/catalog";
import { SkillsBrowser } from "./skills-browser";
import "./skills-browser.css";
import { IconButton } from "@/components/ui/icon-button";
import { prefersReducedMotion, useReducedMotion } from "@/lib/media";
import { createViewSwap, type SwapPhase } from "@/lib/view-swap";

const skillPath = "/skills/axiomui-website-upgrade/SKILL.md";
const skillLoadTimeoutMs = 8000;
const modalOpenDurationMs = 220; // --motion-medium
const modalCloseDurationMs = 180;
// The portal needs document.body, which exists only on the client: false while
// rendering on the server and hydrating, true from then on.
const subscribeNever = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNever, () => true, () => false);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), select:not([disabled]), input[type="radio"]:checked, summary, [tabindex]:not([tabindex="-1"])';

type LoadState = "idle" | "loading" | "ready" | "error";
type ModalState = "closed" | "mounted" | "open" | "closing";
type ModalView = "install" | "preview";

type PreviewNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] };

export type SkillDialogSource = {
  bounds: DOMRect;
  card: HTMLElement;
  anchor: HTMLElement;
  anchorBounds: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
};

function visibleBounds(element: HTMLElement | null | undefined) {
  if (!element?.isConnected || !element.getClientRects().length || getComputedStyle(element).visibility === "hidden") return null;
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0
    && box.top < window.innerHeight && box.left < window.innerWidth ? box : null;
}

function measureReturnTarget(panel: HTMLElement, anchor: HTMLElement) {
  const trigger = visibleBounds(anchor);
  panel.dataset.railMotion = trigger ? "anchored" : "local";
  if (!trigger) return null;
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  // The compact card is gone. Return to the button at its current position.
  panel.style.setProperty("--skill-return-transform",
    `translate3d(${trigger.left - panel.offsetLeft}px, ${trigger.top - panel.offsetTop}px, 0)`);
  panel.style.setProperty("--skill-return-scale", `scale(${trigger.width / width}, ${trigger.height / height})`);
  panel.style.setProperty("--skill-return-clip",
    `inset(0 ${Math.max(0, width - trigger.width)}px ${Math.max(0, height - trigger.height)}px 0 round var(--radius-control))`);
  return trigger;
}

const instantDialog = () => prefersReducedMotion() || (typeof document !== "undefined" && document.documentElement.dataset.input === "keyboard");

export type SkillBonusProps = {
  /**
   * Opens the dialog from outside, such as the rail's install row. Leave it
   * unset to render the built-in trigger instead.
   */
  open?: boolean;
  /** Viewport bounds of the rail popover just before it yields to the dialog. */
  source?: SkillDialogSource | null;
  /** Called with `false` when the dialog closes itself: Esc, the scrim or its close button. */
  onOpenChange?: (open: boolean) => void;
};

export function SkillBonus({ open, source, onOpenChange }: SkillBonusProps = {}) {
  const controlled = open !== undefined;
  const pathname = usePathname();
  const isMounted = useIsClient();
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [view, setView] = useState<ModalView>("install");
  const [swapPhase, setSwapPhase] = useState<SwapPhase>("idle");
  const [viewSwap] = useState(() => createViewSwap<ModalView>("install", setView, setSwapPhase));
  const [skillText, setSkillText] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [announcement, setAnnouncement] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const reducedMotion = useReducedMotion();
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const announcementTimerRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const viewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusViewHeadingRef = useRef(false);
  const isModalVisible = modalState !== "closed";
  const isPreviewing = isModalVisible && modalState !== "closing" && view === "preview";
  // A ref, so closeModal stays stable: the focus-trap effect depends on it and
  // must not re-run while the dialog is open.
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  const closeModal = useCallback((input?: "keyboard" | { detail: number }) => {
    onOpenChangeRef.current?.(false);
    viewSwap.cancel();
    focusViewHeadingRef.current = false;
    if (announcementTimerRef.current !== null) {
      window.clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = null;
    }
    setAnnouncement("");
    if (input === "keyboard" || input?.detail === 0 || instantDialog()) {
      setModalState("closed");
      viewSwap.reset("install");
      return;
    }
    setModalState((current) => current === "closed" || current === "closing" ? current : "closing");
  }, [viewSwap]);

  useEffect(() => () => {
    viewSwap.cancel(false);
    if (announcementTimerRef.current !== null) window.clearTimeout(announcementTimerRef.current);
  }, [viewSwap]);

  // The playbook is fetched only when Preview is chosen, so opening the
  // dialog does no network work.
  useEffect(() => {
    if (!isPreviewing || skillText) return;

    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, skillLoadTimeoutMs);

    async function loadSkill() {
      setLoadState("loading");

      try {
        const response = await fetch(skillPath, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load skill file");
        }

        const text = await response.text();
        if (!stripFrontmatter(text).trim()) throw new Error("The playbook is empty");

        if (!active) {
          return;
        }

        setSkillText(text);
        setLoadState("ready");
      } catch {
        if (!active) {
          return;
        }

        setLoadState("error");
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadSkill();

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isPreviewing, skillText, loadAttempt]);

  useLayoutEffect(() => {
    if (!isModalVisible) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0;

    if (!returnFocusRef.current?.isConnected) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    const previousInert = new Map<HTMLElement, boolean>();
    function lockBackground() {
      const root = modalRootRef.current;
      for (const element of Array.from(document.body.children)) {
        if (!(element instanceof HTMLElement) || element === root) continue;
        if (!previousInert.has(element)) previousInert.set(element, element.inert);
        element.inert = true;
      }
    }
    lockBackground();
    const observer = new MutationObserver(lockBackground);
    observer.observe(document.body, { childList: true });

    function containFocus(event: FocusEvent) {
      const panel = panelRef.current;
      if (panel && event.target instanceof Node && !panel.contains(event.target)) {
        panel.focus({ preventScroll: true });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // A native picker owns its first Escape while its option list is open.
        if (event.isComposing || (event.target instanceof HTMLSelectElement &&
          CSS.supports("selector(select:open)") && event.target.matches(":open"))) return;
        event.preventDefault();
        event.stopPropagation();
        closeModal("keyboard");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const stops = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
        if (element.offsetParent === null || element.closest("[inert]")) return false;
        const closed = element.closest("details:not([open])");
        return !closed || element === closed.querySelector(":scope > summary");
      });
      // Safari's default Tab policy can skip buttons and leave the document
      // from a middle control. Walk the visible controls for every modal Tab.
      if (event.shiftKey) stops.reverse();
      const active = document.activeElement;
      const direction = event.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
      const next = active && panel.contains(active)
        ? stops.find((element) => active.compareDocumentPosition(element) & direction)
        : undefined;
      event.preventDefault();
      (next ?? stops[0] ?? panel).focus();
    }

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) document.body.style.paddingRight = `${bodyPaddingRight + scrollbarGap}px`;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", containFocus);
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", containFocus);
      observer.disconnect();
      if (announcementTimerRef.current !== null) {
        window.clearTimeout(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
      for (const [element, inert] of previousInert) element.inert = inert;
      const focusTargets = [
        returnFocusRef.current,
        ...document.querySelectorAll<HTMLElement>(
          '.phone-bar a[aria-haspopup="dialog"], .install-row .rail-row, button[aria-controls="mobile-menu"], button[aria-controls="desktop-sidebar"]'
        ),
      ];
      const returnTarget = focusTargets.find((element) => element && !element.closest("[inert]") && visibleBounds(element));
      returnTarget?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    };
  }, [isModalVisible, closeModal]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !source || !isModalVisible || instantDialog()) return;
    // Carry the actual compact card through the first frames. Its controls
    // are only a picture here; the modal owns interaction from its first paint.
    const picture = source.card.cloneNode(true) as HTMLElement;
    picture.classList.add("skill-origin-copy");
    picture.inert = true;
    picture.setAttribute("aria-hidden", "true");
    picture.removeAttribute("role");
    picture.removeAttribute("aria-labelledby");
    picture.removeAttribute("id");
    picture.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    picture.style.width = `${source.bounds.width}px`;
    picture.style.translate = "none";
    const discard = (event: globalThis.TransitionEvent) => {
      if (event.target === picture && event.propertyName === "opacity") picture.remove();
    };
    picture.addEventListener("transitionend", discard);
    panel.appendChild(picture);
    return () => {
      picture.removeEventListener("transitionend", discard);
      picture.remove();
    };
  }, [source, isModalVisible]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !source || !isModalVisible || reducedMotion) return;
    const measure = () => {
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      if (!width || !height) return;
      const { bounds } = source;
      const trigger = measureReturnTarget(panel, source.anchor);
      const fits = trigger && source.viewportWidth === window.innerWidth && source.viewportHeight === window.innerHeight
        && (["x", "y", "width", "height"] as const).every((side) => Math.abs(trigger[side] - source.anchorBounds[side]) < 1);
      panel.style.setProperty("--skill-source-transform", fits
        ? `translate3d(${bounds.left - panel.offsetLeft}px, ${bounds.top - panel.offsetTop}px, 0)` : "none");
      // Only the visual surface scales. Text and icons move at their native size inside the reveal.
      panel.style.setProperty("--skill-surface-scale", fits ? `scale(${bounds.width / width}, ${bounds.height / height})` : "none");
      panel.style.setProperty("--skill-source-clip", fits
        ? `inset(0 ${Math.max(0, width - bounds.width)}px ${Math.max(0, height - bounds.height)}px 0 round var(--radius-sheet))`
        : "inset(0 round var(--radius-bezel))");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(source.anchor);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      delete panel.dataset.railMotion;
      panel.style.removeProperty("--skill-source-transform");
      panel.style.removeProperty("--skill-surface-scale");
      panel.style.removeProperty("--skill-source-clip");
      panel.style.removeProperty("--skill-return-transform");
      panel.style.removeProperty("--skill-return-scale");
      panel.style.removeProperty("--skill-return-clip");
    };
  }, [source, isModalVisible, reducedMotion]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (modalState === "closing" && source && panel) measureReturnTarget(panel, source.anchor);
  }, [modalState, source]);

  useEffect(() => {
    if (modalState !== "mounted") {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setModalState((current) => (current === "mounted" ? "open" : current));
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [modalState]);

  useEffect(() => {
    if (modalState !== "closing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setModalState("closed");
      viewSwap.reset("install");
    }, reducedMotion ? 0 : modalCloseDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [modalState, reducedMotion, viewSwap]);

  useEffect(() => {
    if (reducedMotion) viewSwap.reduceMotion();
  }, [reducedMotion, viewSwap]);

  // Switching views unmounts the focused control, so move focus to the new
  // view's heading rather than letting it fall back to <body>.
  useEffect(() => {
    if (focusViewHeadingRef.current) {
      focusViewHeadingRef.current = false;
      viewHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [view]);

  const previewNodes = useMemo(() => parsePreviewNodes(skillText), [skillText]);
  // Once the playbook has loaded it stays loaded, whatever an earlier attempt left behind.
  const previewState: LoadState = skillText ? "ready" : loadState;

  const startOpening = useCallback((returnTo: HTMLElement | null) => {
    returnFocusRef.current = returnTo;
    setAnnouncement("");
    setLoadState((current) => (current === "error" || (current === "loading" && !skillText) ? "idle" : current));
    viewSwap.reset("install");
    setModalState(instantDialog() ? "open" : "mounted");
  }, [skillText, viewSwap]);

  // Controlled: follow `open`, adjusting the dialog's state in the same render
  // as the prop. The opener is whatever held focus, which the focus trap
  // records as the dialog mounts, and focus returns there on close.
  if (controlled && open && modalState === "closed") {
    setAnnouncement("");
    setLoadState((current) => (current === "error" || (current === "loading" && !skillText) ? "idle" : current));
    setModalState(reducedMotion || instantDialog() ? "open" : "mounted");
  } else if (controlled && !open && (modalState === "mounted" || modalState === "open")) {
    setAnnouncement("");
    setModalState(reducedMotion ? "closed" : "closing");
  }

  // However the dialog closes, a view swap in flight stops and the next open
  // starts on the install view.
  useEffect(() => {
    if (modalState === "closing") viewSwap.cancel();
    else if (modalState === "closed") viewSwap.reset("install");
  }, [modalState, viewSwap]);

  function openModal(event: MouseEvent<HTMLButtonElement>) {
    // Read the URL at click time rather than through useSearchParams, which
    // would push the whole sidebar behind a Suspense boundary at prerender.
    const nextParams = new URLSearchParams(window.location.search);

    if (nextParams.has("rule")) {
      nextParams.delete("rule");
      const next = nextParams.toString();
      const nextUrl = `${pathname}${next ? `?${next}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
    }

    startOpening(event.currentTarget);
  }

  function showView(next: ModalView) {
    if (modalState === "closing" || !viewSwap.request(next, prefersReducedMotion())) return;
    if (next === "preview" && previewState === "error") setLoadState("idle");
    focusViewHeadingRef.current = true;
  }

  function handleSwapEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.propertyName === "opacity") viewSwap.finishFade();
  }

  const announce = (message: string) => {
    // Clear first so the same message twice in a row is still announced.
    if (announcementTimerRef.current !== null) window.clearTimeout(announcementTimerRef.current);
    setAnnouncement("");
    announcementTimerRef.current = window.setTimeout(() => {
      announcementTimerRef.current = null;
      setAnnouncement(message);
    }, 50);
  };

  const closeButton = (
    <IconButton size="md" className="skill-close" label="Close agent skills" onClick={closeModal}>
      <X aria-hidden="true" />
    </IconButton>
  );

  const installView = (
    <div className="skill-index-view" hidden={view !== "install"}>
      <SkillsBrowser closeButton={closeButton} headingRef={view === "install" ? viewHeadingRef : null}
        onPreview={() => showView("preview")} announce={announce} skillPath={skillPath} />
    </div>
  );

  const previewView = (
    <>
      <div className="skill-toolbar skill-preview-toolbar">
        <button type="button" onClick={() => showView("install")} className="skill-action">
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          All skills
        </button>
        <div className="ml-auto flex items-center gap-2">
          <a href={skillPath} download="SKILL.md" className="skill-action">
            <Download aria-hidden="true" className="size-3.5" />
            <span className="hidden min-[400px]:inline">Download</span>
            <span className="sr-only min-[400px]:hidden">Download SKILL.md</span>
          </a>
          {closeButton}
        </div>
      </div>

      <div role="region" aria-labelledby="skill-dialog-title" tabIndex={0}
        className="skill-preview-body min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:-outline-offset-2">
        <article className="skill-playbook mx-auto max-w-[72ch] px-5 py-5 sm:px-7 sm:py-6">
          <header>
            <p className="text-sm font-medium text-ink-muted">
              <code>SKILL.md</code>
            </p>
            <h2
              id="skill-dialog-title"
              ref={view === "preview" ? viewHeadingRef : undefined}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl md:text-4xl"
            >
              Website upgrade playbook
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-ink-secondary sm:mt-4 sm:text-base sm:leading-[26px]">
              Five steps to review a website, fix problems in code and verify the changes.
            </p>
          </header>

          {previewState === "loading" || previewState === "idle" ? (
            <div
              role="status"
              className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-sm text-ink-muted"
            >
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" />
              <p>Loading preview…</p>
            </div>
          ) : null}

          {previewState === "error" ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-sm text-ink-muted">
              <p role="status">Couldn’t load the playbook preview.</p>
              <button type="button" className="skill-action" onClick={() => {
                // Retrying removes this button. Give the reader a stable focus target.
                viewHeadingRef.current?.focus({ preventScroll: true });
                setLoadAttempt((attempt) => attempt + 1);
              }}>
                Try again
              </button>
              <a href={skillPath} target="_blank" rel="noreferrer" className="skill-action">
                <ArrowUpRight aria-hidden="true" className="size-4" />
                Open raw file
              </a>
            </div>
          ) : null}

          {previewState === "ready" ? (
            <div className="skill-playbook-copy mt-5">
              {previewNodes.map((node, index) => renderPreviewNode(node, index))}
            </div>
          ) : null}
        </article>
      </div>
    </>
  );

  const modal = isMounted && isModalVisible
    ? createPortal(
        <div
          ref={modalRootRef}
          data-state={modalState}
          style={{ "--skill-dock-left": source ? String(source.bounds.left) + "px" : undefined, "--skill-modal-open-duration": `${reducedMotion ? 0 : modalOpenDurationMs}ms`, "--skill-modal-close-duration": `${reducedMotion ? 0 : modalCloseDurationMs}ms` } as CSSProperties}
          className="skill-modal-root skill-dock fixed inset-0 z-[500]"
        >
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeModal}
            className="skill-modal-scrim absolute inset-0 cursor-default bg-scrim"
          />

          <div
            ref={panelRef}
            data-swap={swapPhase}
            onTransitionEnd={handleSwapEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby={view === "install" ? "skills-index-title" : "skill-dialog-title"}
            tabIndex={-1}
            className="skill-modal-panel skill-workspace"
          >
            <span className="skill-modal-surface" aria-hidden="true" />
            <div className="skill-modal-content flex h-full min-h-0 flex-col">
              {installView}
              {view === "preview" ? previewView : null}
              <p aria-live="polite" className="sr-only">
                {announcement}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  if (controlled) return modal;

  return (
    <>
      <div className="pt-3">
        <button
          type="button"
          onClick={openModal}
          className="pressable group flex min-h-11 w-full items-center justify-between gap-3 rounded-well px-2 py-1.5 text-left text-xs font-medium text-ink-secondary hover:bg-fill hover:text-ink"
        >
          <span className="min-w-0">
            <span className="block text-xs font-normal text-ink-muted group-hover:text-ink-secondary">Agent skills</span>
            <span className="mt-0.5 block">Install Axiom UI in your agent</span>
            <code className="mt-1 block truncate text-xs font-normal text-ink-muted group-hover:text-ink-secondary">
              {skillsCliCommand}
            </code>
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </button>
      </div>

      {modal}
    </>
  );
}

/** Inline `code` spans as <code>; everything else as plain text. */
function renderInline(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code key={index} className="break-words text-sm text-ink sm:text-base">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  );
}

function renderPreviewNode(node: PreviewNode, index: number) {
  if (node.type === "table") {
    return (
      <div key={`table-${index}`} className="overflow-x-auto">
        <table className="w-full text-left text-sm leading-6 sm:text-base sm:leading-[26px]">
          <thead className="bg-sunken text-xs text-ink-muted">
            <tr>
              {node.header.map((cell, cellIndex) => (
                <th key={cellIndex} scope="col" className="px-4 py-2.5 font-medium">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-ink-secondary">
            {node.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2.5 tabular-nums">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (node.type === "heading") {
    if (node.level === 1) {
      return null;
    }

    if (node.level === 2) {
      return (
        <h3 key={`heading-${index}`} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{node.text}</h3>
      );
    }

    return (
      <h4 key={`heading-${index}`} className="text-base font-semibold text-ink">{node.text}</h4>
    );
  }

  if (node.type === "paragraph") {
    return (
      <p key={`paragraph-${index}`} className="text-pretty text-sm leading-6 text-ink-secondary sm:text-base sm:leading-[26px]">
        {renderInline(node.text)}
      </p>
    );
  }

  if (node.type === "unordered-list") {
    return (
      <ul key={`unordered-${index}`} className="space-y-2.5 pl-5 text-sm leading-6 text-ink-secondary sm:space-y-3 sm:text-base sm:leading-[26px]">
        {node.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`} className="list-disc pl-2 marker:text-ink-muted">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol key={`ordered-${index}`} className="space-y-3 pl-5 text-sm leading-6 text-ink-secondary sm:space-y-4 sm:text-base sm:leading-[26px]">
      {node.items.map((item, itemIndex) => (
        <li key={`${item}-${itemIndex}`} className="list-decimal pl-2 marker:font-medium marker:text-ink-muted">
          {renderInline(item)}
        </li>
      ))}
    </ol>
  );
}

function parsePreviewNodes(source: string): PreviewNode[] {
  const lines = stripFrontmatter(source).replaceAll("\r\n", "\n").split("\n");
  const nodes: PreviewNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const cells = (line: string) =>
        line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      const [header = "", ...body] = tableLines;
      nodes.push({
        type: "table",
        header: cells(header),
        rows: body.filter((line) => !/^\|[\s|:-]+\|$/.test(line)).map(cells),
      });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);

    if (headingMatch) {
      nodes.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();

        if (!/^-\s+/.test(current)) {
          break;
        }

        let item = current.replace(/^-\s+/, "").trim();
        const continuation = collectContinuation(lines, index + 1);

        if (continuation.text) {
          item = `${item} ${continuation.text}`;
        }

        items.push(item);
        index = continuation.nextIndex;
      }

      nodes.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();

        if (!/^\d+\.\s+/.test(current)) {
          break;
        }

        let item = current.replace(/^\d+\.\s+/, "").trim();
        const continuation = collectContinuation(lines, index + 1);

        if (continuation.text) {
          item = `${item} ${continuation.text}`;
        }

        items.push(item);
        index = continuation.nextIndex;
      }

      nodes.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const current = lines[index].trim();

      if (!current) {
        break;
      }

      if (/^(#{1,3})\s+/.test(current) || /^-\s+/.test(current) || /^\d+\.\s+/.test(current) || current.startsWith("|")) {
        break;
      }

      paragraphLines.push(current);
      index += 1;
    }

    nodes.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return nodes;
}

function collectContinuation(lines: string[], startIndex: number) {
  const parts: string[] = [];
  let nextIndex = startIndex;

  while (nextIndex < lines.length) {
    const raw = lines[nextIndex];
    const trimmed = raw.trim();

    if (!trimmed) {
      nextIndex += 1;
      break;
    }

    if (/^(#{1,3})\s+/.test(trimmed) || /^-\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed) || trimmed.startsWith("|")) {
      break;
    }

    parts.push(trimmed);
    nextIndex += 1;
  }

  return {
    text: parts.join(" "),
    nextIndex,
  };
}

function stripFrontmatter(source: string) {
  if (!source.startsWith("---")) {
    return source;
  }

  const lines = source.replaceAll("\r\n", "\n").split("\n");

  if (lines[0] !== "---") {
    return source;
  }

  let endIndex = 1;

  while (endIndex < lines.length && lines[endIndex] !== "---") {
    endIndex += 1;
  }

  if (endIndex >= lines.length) {
    return source;
  }

  return lines.slice(endIndex + 1).join("\n");
}
