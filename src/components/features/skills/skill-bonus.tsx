// design-system: strict
"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Download, LoaderCircle, X } from "lucide-react";

import {
  skillCatalog,
  skillRules,
  skillsCliCommand,
  skillsTreeUrl,
  type SkillSpec,
} from "@/lib/skills/catalog";
import { IconButton } from "@/components/ui/icon-button";
import { prefersReducedMotion, useReducedMotion } from "@/lib/media";
import { cn } from "@/lib/utils";

const skillPath = "/skills/axiomui-website-upgrade/SKILL.md";
const skillLoadTimeoutMs = 8000;
const modalOpenDurationMs = 280;
const modalCloseDurationMs = 180;
const copyResetMs = 1800;

const coreSkills = skillCatalog.filter((skill) => skill.group === "core");
const domainSkills = skillCatalog.filter((skill) => skill.group === "domain");

// Keep a full 44px target on touch screens at every viewport width. The
// global focus-visible treatment and pressable transition own their states.
const PILL_PRIMARY =
  "pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-inverse px-4 text-xs font-medium text-on-inverse hover:opacity-90 disabled:pointer-events-none disabled:opacity-50";
const PILL_SECONDARY =
  "pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong px-4 text-xs font-medium text-ink-secondary hover:bg-fill hover:text-ink";
const TEXT_LINK =
  "pressable inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type LoadState = "idle" | "loading" | "ready" | "error";
type CopyState = "idle" | "copied" | "error";
type ModalState = "closed" | "mounted" | "open" | "closing";
type ModalView = "install" | "preview";

const pillLabels: Record<CopyState, string> = { idle: "Copy", copied: "Copied", error: "Retry" };

type PreviewNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] };

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Some browsers deny clipboard access even in a secure context.
    }
  }

  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const textarea = document.createElement("textarea");
  try {
    textarea.value = text;
    textarea.readOnly = true;
    textarea.tabIndex = -1;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    // Keep fallback focus inside the active dialog's inert boundary.
    (previous?.closest('[role="dialog"]') ?? document.body).appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  }
}

/**
 * One copy control with its own idle/copied/error state, so pressing one
 * button never flips another. Announces the result through the dialog's
 * single live region.
 */
function CopyButton({
  text,
  label,
  announce,
  variant,
}: {
  text: string;
  label: string;
  announce: (message: string) => void;
  variant: "pill" | "icon";
}) {
  const [state, setState] = useState<CopyState>("idle");
  const attemptRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    attemptRef.current += 1;
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  async function handleClick() {
    const attempt = ++attemptRef.current;
    const ok = await copyText(text);
    if (attempt !== attemptRef.current) return;
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    setState(ok ? "copied" : "error");
    announce(ok ? `Copied: ${text}` : "Copy failed. Try again.");
    resetTimerRef.current = window.setTimeout(() => {
      resetTimerRef.current = null;
      setState("idle");
    }, copyResetMs);
  }

  const actionLabel = state === "error" ? label.replace(/^Copy/, "Retry copying") : label;

  if (variant === "icon") {
    return (
      <IconButton
        size="md"
        label={actionLabel}
        title={state === "copied" ? "Copied" : state === "error" ? "Copy failed — try again" : text}
        onClick={() => void handleClick()}
      >
        <CopyGlyph copied={state === "copied"} failed={state === "error"} />
      </IconButton>
    );
  }

  return (
    <button type="button" aria-label={actionLabel} onClick={() => void handleClick()} className={PILL_PRIMARY}>
      <CopyGlyph copied={state === "copied"} failed={state === "error"} />
      <span aria-hidden="true" className="grid justify-items-center">
        {(["idle", "copied", "error"] as const).map((labelState) => (
          <span
            key={labelState}
            className={cn("col-start-1 row-start-1", labelState === state ? "visible" : "invisible")}
          >
            {pillLabels[labelState]}
          </span>
        ))}
      </span>
    </button>
  );
}

function CommandRow({ command, label, announce }: {
  command: string;
  label: string;
  announce: (message: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-field bg-sunken pl-4 pr-1.5 py-1.5">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 text-sm leading-6 text-ink">
        <span aria-hidden="true" className="select-none text-ink-muted">$ </span>
        {command}
      </code>
      <CopyButton text={command} label={label} announce={announce} variant="pill" />
    </div>
  );
}

function SkillRow({ skill, announce }: { skill: SkillSpec; announce: (message: string) => void }) {
  const ruleCount = skillRules(skill).length;
  return (
    <li className="flex items-start gap-2 py-2 pl-4 pr-1.5 sm:py-2.5">
      <div className="min-w-0 flex-1 py-1.5 sm:py-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <code className="text-sm font-medium text-ink">{skill.name}</code>
          <span className="text-xs tabular-nums text-ink-muted">
            {ruleCount} {ruleCount === 1 ? "rule" : "rules"}
          </span>
        </p>
        <p className="mt-1 text-pretty text-sm leading-6 text-ink-secondary">{skill.summary}</p>
      </div>
      <CopyButton
        text={`${skillsCliCommand} --skill ${skill.name}`}
        label={`Copy install command for ${skill.name}`}
        announce={announce}
        variant="icon"
      />
    </li>
  );
}

export function SkillBonus({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [view, setView] = useState<ModalView>("install");
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

  const closeModal = useCallback(() => {
    if (announcementTimerRef.current !== null) {
      window.clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = null;
    }
    setAnnouncement("");
    if (prefersReducedMotion()) {
      setModalState("closed");
      setView("install");
      return;
    }
    setModalState((current) => current === "closed" || current === "closing" ? current : "closing");
  }, []);

  useEffect(() => () => {
    if (announcementTimerRef.current !== null) window.clearTimeout(announcementTimerRef.current);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // The playbook is fetched only when Preview is chosen, so opening the
  // dialog does no network work.
  useEffect(() => {
    if (!isPreviewing || skillText) {
      if (skillText) {
        setLoadState("ready");
      }
      return;
    }

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

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

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
        event.preventDefault();
        event.stopPropagation();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const activeInPanel = active instanceof HTMLElement && panel.contains(active);

      // Focus can rest on something outside the tab order: the panel itself,
      // or a view heading after a view switch. Move from there in DOM order,
      // so Tab never escapes past the last control of the dialog.
      if (activeInPanel && !focusable.includes(active)) {
        event.preventDefault();
        const following = focusable.filter(
          (element) => active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
        );
        const preceding = focusable.filter(
          (element) => active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING
        );
        (event.shiftKey ? (preceding[preceding.length - 1] ?? last) : (following[0] ?? first)).focus();
        return;
      }

      if (event.shiftKey) {
        if (!activeInPanel || active === first) {
          event.preventDefault();
          last.focus();
        }

        return;
      }

      if (!activeInPanel || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", containFocus);
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
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
        ...document.querySelectorAll<HTMLButtonElement>(
          'button[aria-controls="mobile-menu"], button[aria-controls="desktop-sidebar"]'
        ),
      ];
      const returnTarget = focusTargets.find((element) => element?.isConnected
        && !element.closest("[inert]") && element.getClientRects().length > 0
        && getComputedStyle(element).visibility !== "hidden");
      returnTarget?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    };
  }, [isModalVisible, closeModal]);

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
      setView("install");
    }, reducedMotion ? 0 : modalCloseDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [modalState, reducedMotion]);

  // Switching views unmounts the focused control, so move focus to the new
  // view's heading rather than letting it fall back to <body>.
  useEffect(() => {
    if (focusViewHeadingRef.current) {
      focusViewHeadingRef.current = false;
      viewHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [view]);

  const previewNodes = useMemo(() => parsePreviewNodes(skillText), [skillText]);

  function openModal(event: MouseEvent<HTMLButtonElement>) {
    returnFocusRef.current = event.currentTarget;
    setAnnouncement("");
    if ((loadState === "loading" && !skillText) || loadState === "error") {
      setLoadState("idle");
    }

    // Read the URL at click time rather than through useSearchParams, which
    // would push the whole sidebar behind a Suspense boundary at prerender.
    const nextParams = new URLSearchParams(window.location.search);

    if (nextParams.has("rule")) {
      nextParams.delete("rule");
      const next = nextParams.toString();
      const nextUrl = `${pathname}${next ? `?${next}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
    }

    setView("install");
    setModalState(prefersReducedMotion() ? "open" : "mounted");
  }

  function showView(next: ModalView) {
    if (next === "preview" && loadState === "error") {
      setLoadState("idle");
    }
    focusViewHeadingRef.current = true;
    setView(next);
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
    <IconButton size="md" label="Close agent skills" onClick={closeModal}>
      <X aria-hidden="true" />
    </IconButton>
  );

  const installView = (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-3xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-10 sm:pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="skill-dialog-title"
              ref={view === "install" ? viewHeadingRef : undefined}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl"
            >
              Agent skills
            </h2>
            <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-ink-secondary sm:text-base sm:leading-[26px]">
              Install Axiom UI&apos;s rules as skills in your coding agent.
            </p>
          </div>
          {closeButton}
        </div>

        <section aria-labelledby="skill-install-heading" className="mt-6 sm:mt-8">
          <h3 id="skill-install-heading" className="sr-only">
            Install
          </h3>
          <CommandRow command={skillsCliCommand} label="Copy install command" announce={announce} />
          <p className="mt-3 text-pretty text-sm leading-6 text-ink-secondary">
            Choose which skills and agents to install. Run it in your project, or add{" "}
            <code className="text-sm text-ink">-g</code> for every project.
          </p>
        </section>

        <section aria-labelledby="skill-core-heading" className="mt-8 sm:mt-10">
          <h3 id="skill-core-heading" className="drawer-label text-xs font-semibold text-ink-muted">
            Core
          </h3>
          <p className="mt-1 text-sm leading-6 text-ink-secondary">
            Each core skill carries every rule. Copy a row&apos;s command to install just that skill.
          </p>
          <ul className="mt-3 space-y-2">
            {coreSkills.map((skill) => (
              <SkillRow key={skill.name} skill={skill} announce={announce} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="skill-domain-heading" className="mt-8">
          <h3 id="skill-domain-heading" className="drawer-label text-xs font-semibold text-ink-muted">
            Domains
          </h3>
          <p className="mt-1 text-sm leading-6 text-ink-secondary">
            Core skills already include these rules. Install one domain on its own for focused triggers.
          </p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {domainSkills.map((skill) => (
              <SkillRow key={skill.name} skill={skill} announce={announce} />
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-col items-start gap-y-1 text-sm text-ink-muted sm:flex-row sm:items-center sm:gap-x-5">
          <p className="mb-1 sm:mb-0 sm:mr-auto">Prefer a single file?</p>
          <button type="button" onClick={() => showView("preview")} className={TEXT_LINK}>
            Preview the playbook
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
          <a href={skillPath} download="SKILL.md" className={TEXT_LINK}>
            Download SKILL.md
            <Download aria-hidden="true" className="size-3.5" />
          </a>
          <a href={skillsTreeUrl} target="_blank" rel="noreferrer" className={TEXT_LINK}>
            View on GitHub
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );

  const previewView = (
    <>
      <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
        <button type="button" onClick={() => showView("install")} className={PILL_SECONDARY}>
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          All skills
        </button>
        <div className="ml-auto flex items-center gap-2">
          <a href={skillPath} download="SKILL.md" className={PILL_SECONDARY}>
            <Download aria-hidden="true" className="size-3.5" />
            <span className="hidden min-[400px]:inline">Download</span>
            <span className="sr-only min-[400px]:hidden">Download SKILL.md</span>
          </a>
          {closeButton}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          <header className="pb-6 sm:pb-8">
            <p className="text-sm font-medium text-ink-muted">
              <code>SKILL.md</code>
            </p>
            <h2
              id="skill-dialog-title"
              ref={view === "preview" ? viewHeadingRef : undefined}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl md:text-4xl"
            >
              Website playbook
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-ink-secondary sm:mt-4 sm:text-base sm:leading-[26px]">
              The decision framework for auditing, implementing and verifying sharper interfaces, as one file.
            </p>
          </header>

          {loadState === "loading" || loadState === "idle" ? (
            <div
              role="status"
              className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-sm text-ink-muted"
            >
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" />
              <p>Loading preview…</p>
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-sm text-ink-muted">
              <p>Could not load the preview. Try again or open the file directly.</p>
              <button type="button" className={PILL_SECONDARY} onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                Try again
              </button>
              <a href={skillPath} target="_blank" rel="noreferrer" className={PILL_SECONDARY}>
                <ArrowUpRight aria-hidden="true" className="size-4" />
                Open raw file
              </a>
            </div>
          ) : null}

          {loadState === "ready" ? (
            <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
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
          style={{ "--skill-modal-open-duration": `${reducedMotion ? 0 : modalOpenDurationMs}ms`, "--skill-modal-close-duration": `${reducedMotion ? 0 : modalCloseDurationMs}ms` } as CSSProperties}
          className="skill-modal-root fixed inset-0 z-[500] flex items-start p-0 sm:px-4 sm:py-4 md:px-6 md:py-6"
        >
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeModal}
            className="skill-modal-scrim absolute inset-0 cursor-default bg-black/40 backdrop-blur-md dark:bg-black/70"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-dialog-title"
            tabIndex={-1}
            className={cn(
              "skill-modal-panel relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden rounded-none bg-surface text-ink shadow-overlay outline-none sm:rounded-card",
              view === "preview" ? "max-w-5xl sm:h-full" : "max-w-3xl sm:h-auto sm:max-h-full"
            )}
          >
            <div className="skill-modal-content flex h-full min-h-0 flex-col">
              {view === "install" ? installView : previewView}
              <p aria-live="polite" className="sr-only">
                {announcement}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {compact ? (
        <div className="pt-3">
          <button
            type="button"
            onClick={openModal}
            className="pressable group flex min-h-11 w-full items-center justify-between gap-3 rounded-field px-2 py-1.5 text-left text-xs font-medium text-ink-muted hover:bg-fill hover:text-ink"
          >
            <span className="min-w-0">
              <span className="block text-xs font-normal text-ink-muted">Agent skills</span>
              <span className="mt-0.5 block">Install Axiom UI in your agent</span>
              <code className="mt-1 block truncate text-xs font-normal text-ink-muted">
                {skillsCliCommand}
              </code>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              style={{ transitionProperty: "transform, translate", transitionDuration: reducedMotion ? "0ms" : "var(--motion-fast)", transitionTimingFunction: "var(--ease-out-strong)" }}
              className="size-4 shrink-0 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </button>
        </div>
      ) : (
        <section className="rounded-card bg-surface p-5 text-ink shadow-card">
          <button
            type="button"
            onClick={openModal}
            className="group min-h-11 w-full rounded-field text-left"
          >
            <p className="text-xs font-medium text-ink-muted">Agent skills</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h3 className="text-2xl font-semibold leading-tight tracking-tight text-ink">
                Install Axiom UI in your agent
              </h3>
              <ArrowUpRight
                aria-hidden="true"
                style={{ transitionProperty: "translate, color", transitionDuration: reducedMotion ? "0ms" : "var(--motion-fast)", transitionTimingFunction: "var(--ease-out-strong)" }}
                className="mt-1 size-4 shrink-0 text-ink-muted group-hover:text-ink-secondary motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
              />
            </div>
            <code className="mt-2 block text-sm text-ink-secondary">{skillsCliCommand}</code>
          </button>
        </section>
      )}

      {modal}
    </>
  );
}

// Cross-fades the copy/check glyphs instead of hard-swapping them: both stay
// in the DOM and trade opacity + scale + blur, so rapid re-clicks retarget
// smoothly (transitions, not keyframes).
const GLYPH_POSITION = "absolute inset-0 size-4.5";

function CopyGlyph({ copied, failed }: { copied: boolean; failed: boolean }) {
  const BaseGlyph = failed ? AlertCircle : Copy;
  const reducedMotion = useReducedMotion();
  const transition: CSSProperties = {
    transitionProperty: "opacity, scale, filter",
    transitionDuration: reducedMotion ? "0ms" : "var(--motion-medium)",
    transitionTimingFunction: "var(--ease-emphasized)",
  };
  return (
    <span aria-hidden="true" className="relative size-4.5">
      <BaseGlyph
        style={transition}
        className={cn(
          GLYPH_POSITION,
          copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-[0px]",
          failed && "text-dont"
        )}
      />
      <Check
        style={transition}
        className={cn(
          GLYPH_POSITION,
          copied ? "scale-100 opacity-100 blur-[0px]" : "scale-[0.25] opacity-0 blur-[4px]"
        )}
      />
    </span>
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
        <section key={`heading-${index}`} className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{node.text}</h3>
        </section>
      );
    }

    return (
      <section key={`heading-${index}`} className="space-y-3">
        <h4 className="text-base font-semibold text-ink">{node.text}</h4>
      </section>
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
