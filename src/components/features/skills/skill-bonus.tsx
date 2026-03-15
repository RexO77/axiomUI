"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowUpRight, Check, Copy, Download, LoaderCircle, X } from "lucide-react";

const skillPath = "/skills/axiom-website-upgrade/SKILL.md";
const modalOpenDurationMs = 360;
const modalCloseDurationMs = 220;

type LoadState = "idle" | "loading" | "ready" | "error";
type CopyState = "idle" | "copied" | "error";
type ModalState = "closed" | "mounted" | "open" | "closing";

type PreviewNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

export function SkillBonus() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [skillText, setSkillText] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const isModalVisible = modalState !== "closed";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalVisible || loadState !== "idle") {
      return;
    }

    let active = true;

    async function loadSkill() {
      setLoadState("loading");

      try {
        const response = await fetch(skillPath, { cache: "force-cache" });

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
      }
    }

    void loadSkill();

    return () => {
      active = false;
    };
  }, [isModalVisible, loadState]);

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
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
            aria-label="Close skill preview"
            onClick={closeModal}
            className="skill-modal-scrim absolute inset-0 bg-neutral-950/30 backdrop-blur-md dark:bg-black/72"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-preview-title"
            className="skill-modal-panel relative mx-auto flex h-[100dvh] max-w-5xl flex-col overflow-hidden rounded-none border-y border-neutral-200 bg-white text-neutral-950 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:h-full sm:rounded-[28px] sm:border dark:border-white/10 dark:bg-[#111216] dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="skill-modal-content flex h-full min-h-0 flex-col">
              <h2 id="skill-preview-title" className="sr-only">
                Website Playbook
              </h2>

              <div className="border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-white/10">
                <div className="flex items-start justify-between gap-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-white/45">SKILL.md</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                      Website Playbook
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <X aria-hidden="true" className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    disabled={loadState !== "ready"}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 dark:border-white/10 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90 dark:disabled:border-white/10 dark:disabled:bg-white/15 dark:disabled:text-white/50"
                  >
                    {copyState === "copied" ? (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    {copyLabel}
                  </button>

                  <a
                    href={skillPath}
                    download="SKILL.md"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <Download aria-hidden="true" className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>

                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
                  <p className="text-sm font-medium text-neutral-400 dark:text-white/45">SKILL.md</p>
                  <p className="text-sm font-semibold tracking-tight text-neutral-950 dark:text-white md:text-base">
                    Website Playbook
                  </p>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      disabled={loadState !== "ready"}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 dark:border-white/10 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90 dark:disabled:border-white/10 dark:disabled:bg-white/15 dark:disabled:text-white/50"
                    >
                      {copyState === "copied" ? (
                        <Check aria-hidden="true" className="h-3.5 w-3.5" />
                      ) : (
                        <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                      )}
                      {copyLabel}
                    </button>

                    <a
                      href={skillPath}
                      download="SKILL.md"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <Download aria-hidden="true" className="h-3.5 w-3.5" />
                      Download
                    </a>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <X aria-hidden="true" className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadState === "loading" || loadState === "idle" ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-neutral-500 dark:text-white/65">
                    <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
                    <p>Loading preview...</p>
                  </div>
                ) : null}

                {loadState === "error" ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-neutral-500 dark:text-white/65">
                    <p>Preview unavailable. The raw file still works.</p>
                    <a
                      href={skillPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 dark:border-white/10 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <Download aria-hidden="true" className="h-4 w-4" />
                      Open file
                    </a>
                  </div>
                ) : null}

                {loadState === "ready" ? (
                  <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
                    <header className="border-b border-neutral-200 pb-6 sm:pb-8 dark:border-white/10">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 sm:text-sm sm:normal-case sm:tracking-normal dark:text-white/45">
                        Bonus skill
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl dark:text-white">
                        Website Upgrade Playbook
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:mt-4 sm:text-base sm:leading-8 dark:text-white/68">
                        A reusable skill for tightening hierarchy, spacing, components, forms, states, and accessibility.
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
      <section className="rounded-[24px] border border-neutral-200 bg-white px-4 py-4 text-neutral-950 shadow-[0_1px_0_rgba(17,24,39,0.04)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:shadow-none">
        <button
          type="button"
          onClick={openModal}
          className="w-full text-left"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-white/45">Bonus skill</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold leading-tight tracking-tight text-neutral-950 dark:text-white">
              Website Playbook
            </h3>
            <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-neutral-400 dark:text-white/45" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-white/60">
            Open a cleaner preview, then copy or download the raw file.
          </p>
        </button>

        <a
          href={skillPath}
          download="SKILL.md"
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-white/72 dark:hover:text-white"
        >
          <Download aria-hidden="true" className="h-3.5 w-3.5" />
          Download .md
        </a>
      </section>

      {modal}
    </>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-white/45">{node.text}</p>
      </section>
    );
  }

  if (node.type === "paragraph") {
    return (
      <p key={`paragraph-${index}`} className="text-sm leading-7 text-neutral-700 dark:text-white/70 sm:text-base sm:leading-8">
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
