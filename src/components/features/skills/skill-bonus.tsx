"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowUpRight, Check, Copy, Download, LoaderCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

const skillPath = "/skills/axiom-website-upgrade/SKILL.md";
const skillLoadTimeoutMs = 8000;
const modalOpenDurationMs = 280;
const modalCloseDurationMs = 180;

// House focus treatment (matches rule-drawer.tsx).
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500";

// Header pills share one recipe; min-h-11 (44px) on touch, min-h-10 (40px)
// where the pointer is fine. `pressable` supplies the tokenized
// transform/color transition and scale(0.96) press.
const PILL_PRIMARY = cn(
  "pressable inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-900 bg-neutral-950 px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 sm:min-h-10 dark:border-white/10 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90 dark:disabled:border-white/10 dark:disabled:bg-white/15 dark:disabled:text-white/50",
  FOCUS_RING
);
const PILL_SECONDARY = cn(
  "pressable inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 sm:min-h-10 dark:border-white/10 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white",
  FOCUS_RING
);
const CLOSE_BUTTON = cn(
  "pressable inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white",
  FOCUS_RING
);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type LoadState = "idle" | "loading" | "ready" | "error";
type CopyState = "idle" | "copied" | "error";
type ModalState = "closed" | "mounted" | "open" | "closing";

type PreviewNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

export function SkillBonus({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [skillText, setSkillText] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const isModalVisible = modalState !== "closed";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalVisible && loadState === "loading" && !skillText) {
      setLoadState("idle");
    }
  }, [isModalVisible, loadState, skillText]);

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }

    if (skillText) {
      setLoadState("ready");
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
  }, [isModalVisible, skillText]);

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    };
  }, [isModalVisible]);

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
    }, modalCloseDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [modalState]);

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  const previewNodes = useMemo(() => parsePreviewNodes(skillText), [skillText]);

  function openModal() {
    if ((loadState === "loading" && !skillText) || loadState === "error") {
      setLoadState("idle");
    }

    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextParams.has("rule")) {
      nextParams.delete("rule");
      const next = nextParams.toString();
      const nextUrl = next ? `${pathname}?${next}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }

    setModalState("mounted");
  }

  function closeModal() {
    setModalState((current) => {
      if (current === "closed" || current === "closing") {
        return current;
      }

      return "closing";
    });
  }

  async function handleCopy() {
    if (!skillText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(skillText);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
        ? "Retry"
        : "Copy";

  const modal = isMounted && isModalVisible
    ? createPortal(
        <div
          data-state={modalState}
          style={{ "--skill-modal-open-duration": `${modalOpenDurationMs}ms`, "--skill-modal-close-duration": `${modalCloseDurationMs}ms` } as CSSProperties}
          className="skill-modal-root fixed inset-0 z-[500] p-0 sm:px-4 sm:py-4 md:px-6 md:py-6"
        >
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeModal}
            className="skill-modal-scrim absolute inset-0 cursor-default bg-neutral-950/30 backdrop-blur-md dark:bg-black/72"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-preview-title"
            tabIndex={-1}
            className="skill-modal-panel relative mx-auto flex h-[100dvh] max-w-5xl flex-col overflow-hidden rounded-none border-y border-neutral-200 bg-white text-neutral-950 shadow-[0_24px_80px_rgba(15,23,42,0.14)] outline-none sm:h-full sm:rounded-[28px] sm:border dark:border-white/10 dark:bg-[#111216] dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="skill-modal-content flex h-full min-h-0 flex-col">
              <h2 id="skill-preview-title" className="sr-only">
                Website playbook
              </h2>

              <div className="border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-white/10">
                <div className="flex items-center justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-400 dark:text-white/45">SKILL.md</p>
                    <p className="mt-1 truncate text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                      Website playbook
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close preview"
                    title="Close preview"
                    onClick={closeModal}
                    className={cn(CLOSE_BUTTON, "size-11")}
                  >
                    <X aria-hidden="true" className="size-4.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    disabled={loadState !== "ready"}
                    className={PILL_PRIMARY}
                  >
                    <CopyGlyph copied={copyState === "copied"} />
                    <span aria-live="polite">{copyLabel}</span>
                  </button>

                  <a href={skillPath} download="SKILL.md" className={PILL_SECONDARY}>
                    <Download aria-hidden="true" className="size-3.5" />
                    Download
                  </a>
                </div>

                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
                  <p className="text-sm font-medium text-neutral-400 dark:text-white/45">SKILL.md</p>
                  <p className="text-sm font-semibold tracking-tight text-neutral-950 dark:text-white md:text-base">
                    Website playbook
                  </p>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      disabled={loadState !== "ready"}
                      className={PILL_PRIMARY}
                    >
                      <CopyGlyph copied={copyState === "copied"} />
                      <span aria-live="polite">{copyLabel}</span>
                    </button>

                    <a href={skillPath} download="SKILL.md" className={PILL_SECONDARY}>
                      <Download aria-hidden="true" className="size-3.5" />
                      Download
                    </a>

                    <button
                      type="button"
                      aria-label="Close preview"
                      title="Close preview"
                      onClick={closeModal}
                      className={cn(CLOSE_BUTTON, "size-10")}
                    >
                      <X aria-hidden="true" className="size-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadState === "loading" || loadState === "idle" ? (
                  <div
                    role="status"
                    className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-neutral-500 dark:text-white/70"
                  >
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin motion-reduce:animate-none"
                    />
                    <p>Loading preview…</p>
                  </div>
                ) : null}

                {loadState === "error" ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-neutral-500 dark:text-white/70">
                    <p>Preview unavailable. The raw file still works.</p>
                    <a
                      href={skillPath}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "pressable inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white",
                        FOCUS_RING
                      )}
                    >
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                      Open raw file
                    </a>
                  </div>
                ) : null}

                {loadState === "ready" ? (
                  <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
                    <header className="border-b border-neutral-200 pb-6 sm:pb-8 dark:border-white/10">
                      <p className="text-sm font-medium text-neutral-500 dark:text-white/45">
                        Bonus skill
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl dark:text-white">
                        Website playbook
                      </h3>
                      <p className="mt-3 max-w-2xl text-pretty text-sm leading-7 text-neutral-600 sm:mt-4 sm:text-base sm:leading-8 dark:text-white/70">
                        A decision framework for auditing, implementing, and verifying sharper interfaces.
                      </p>
                    </header>

                    <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
                      {previewNodes.map((node, index) => renderPreviewNode(node, index))}
                    </div>
                  </article>
                ) : null}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {compact ? (
        <div className="border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={openModal}
            className={cn(
              "pressable group flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-left text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              FOCUS_RING
            )}
          >
            <span>
              <span className="block text-[11px] font-normal text-neutral-400 dark:text-neutral-500">Bonus skill</span>
              <span className="mt-0.5 block">Website playbook</span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-150 ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </button>
        </div>
      ) : (
        <section className="rounded-[24px] border border-neutral-200 bg-white p-5 text-neutral-950 shadow-[0_1px_0_rgba(17,24,39,0.04)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:shadow-none">
          <button
            type="button"
            onClick={openModal}
            className={cn("group w-full rounded-xl text-left", FOCUS_RING)}
          >
            <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Bonus skill</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h3 className="text-2xl font-semibold leading-tight tracking-tight text-neutral-950 dark:text-white">
                Website playbook
              </h3>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-neutral-400 transition-[translate,color] duration-150 ease-out group-hover:text-neutral-600 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 dark:text-neutral-500 dark:group-hover:text-neutral-300"
              />
            </div>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              The decision framework behind these rules — preview it, then copy or download the raw file.
            </p>
          </button>

          <a
            href={skillPath}
            download="SKILL.md"
            className={cn(
              "pressable mt-3 inline-flex min-h-11 items-center gap-2 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100",
              FOCUS_RING
            )}
          >
            <Download aria-hidden="true" className="size-3.5" />
            Download SKILL.md
          </a>
        </section>
      )}

      {modal}
    </>
  );
}

// Cross-fades the copy/check glyphs instead of hard-swapping them: both stay
// in the DOM and trade opacity + scale + blur, so rapid re-clicks retarget
// smoothly (transitions, not keyframes).
const GLYPH_TRANSITION =
  "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

function CopyGlyph({ copied }: { copied: boolean }) {
  return (
    <span aria-hidden="true" className="relative size-3.5">
      <Copy
        className={cn(
          GLYPH_TRANSITION,
          copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-[0px]"
        )}
      />
      <Check
        className={cn(
          GLYPH_TRANSITION,
          copied ? "scale-100 opacity-100 blur-[0px]" : "scale-[0.25] opacity-0 blur-[4px]"
        )}
      />
    </span>
  );
}

function renderPreviewNode(node: PreviewNode, index: number) {
  if (node.type === "heading") {
    if (node.level === 1) {
      return null;
    }

    if (node.level === 2) {
      return (
        <section key={`heading-${index}`} className="space-y-4">
          <h4 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">{node.text}</h4>
        </section>
      );
    }

    return (
      <section key={`heading-${index}`} className="space-y-3">
        <p className="text-xs font-semibold text-neutral-500 dark:text-white/45">{node.text}</p>
      </section>
    );
  }

  if (node.type === "paragraph") {
    return (
      <p key={`paragraph-${index}`} className="text-pretty text-sm leading-7 text-neutral-700 dark:text-white/70 sm:text-base sm:leading-8">
        {node.text}
      </p>
    );
  }

  if (node.type === "unordered-list") {
    return (
      <ul key={`unordered-${index}`} className="space-y-2.5 pl-5 text-sm leading-7 text-neutral-700 dark:text-white/70 sm:space-y-3 sm:text-base sm:leading-8">
        {node.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`} className="list-disc pl-2 marker:text-neutral-400 dark:marker:text-white/35">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol key={`ordered-${index}`} className="space-y-3 pl-5 text-sm leading-7 text-neutral-700 dark:text-white/70 sm:space-y-4 sm:text-base sm:leading-8">
      {node.items.map((item, itemIndex) => (
        <li key={`${item}-${itemIndex}`} className="list-decimal pl-2 marker:font-medium marker:text-neutral-500 dark:marker:text-white/45">
          {item}
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

      if (/^(#{1,3})\s+/.test(current) || /^-\s+/.test(current) || /^\d+\.\s+/.test(current)) {
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

    if (/^(#{1,3})\s+/.test(trimmed) || /^-\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
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
