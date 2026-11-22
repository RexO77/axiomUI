// design-system: strict
"use client";

/*
 * The deep dive, Related rules, and Before you ship.
 *
 * The prose arrives as props: the rule page renders this component on the
 * server with the landing rule's payload, and the rule view renders it for
 * every other rule with nothing, reading the loader. It is never a dynamic
 * import, and it never reads the corpus.
 *
 * It renders two of the stage grid's items:
 *   .rv-side   the deep dive (an <aside> that `I` hides) and Related;
 *   .rv-ship   Before you ship, outside the aside, so it stays when `I` hides
 *              the dive.
 *
 * Desktop hides the dive with hidden="until-found", so find-in-page still
 * reaches it and a match opens it. Phones never hide it; their sections
 * collapse instead. The server renders every section open with a heading. The
 * toggle buttons appear only after hydration, and phone CSS hides a closed
 * body only under html[data-hydrated] on a section that has its button, so a
 * reader with no script sees all four sections.
 */

import { AlertTriangle } from "@/components/ui/icons";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { useShell } from "@/components/shell/shell-context";
import { proseLoader, useProse, type ProseState } from "@/lib/prose-loader";
import { PROSE_HEADINGS, type RuleProse } from "@/lib/rule-prose-types";
import { Prose } from "./prose";
import { Related } from "./related";

/** The deep dive's element id: the header's toggle controls it. */
export const DEEP_DIVE_ID = "rule-deep-dive";

type DeepKey = "how" | "why" | "breaks";
/** How to apply it starts open; the rest wait for a tap (phones only). */
const FIRST_OPEN: Record<DeepKey, boolean> = { how: true, why: false, breaks: false };

const never = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    never,
    () => true,
    () => false,
  );

function DeepSection({
  id,
  icon,
  open,
  collapsible,
  onToggle,
  children,
}: {
  id: DeepKey;
  icon?: ReactNode;
  open: boolean;
  collapsible: boolean;
  onToggle: (id: DeepKey) => void;
  children: ReactNode;
}) {
  const uid = useId();
  const title = PROSE_HEADINGS[id];
  return (
    <section
      className="rv-dd-sec"
      data-section={id}
      data-open={open || undefined}
      data-collapsible={collapsible || undefined}
      aria-labelledby={`${uid}-h`}
    >
      <h2 className="rv-dd-h" id={`${uid}-h`}>
        {collapsible ? (
          <button type="button" className="rv-dd-toggle" aria-expanded={open} aria-controls={`${uid}-b`} onClick={() => onToggle(id)}>
            {icon}
            <span>{title}</span>
          </button>
        ) : (
          <span className="rv-dd-label">
            {icon}
            <span>{title}</span>
          </span>
        )}
      </h2>
      <div className="rv-dd-body" id={`${uid}-b`}>
        {children}
      </div>
    </section>
  );
}

function DeepDive({ ruleId, state }: { ruleId: string; state: ProseState }) {
  const { inspectorOpen, toggleInspector, phone } = useShell();
  const hydrated = useHydrated();
  const aside = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(FIRST_OPEN);
  const toggle = useCallback((key: DeepKey) => setOpen((current) => ({ ...current, [key]: !current[key] })), []);

  // Set outside React: the browser removes hidden="until-found" itself on a find-in-page match.
  const hide = !inspectorOpen && !phone;
  useLayoutEffect(() => {
    const el = aside.current;
    if (!el) return;
    if (hide) {
      if (el.contains(document.activeElement)) {
        el.closest(".rv")?.querySelector<HTMLElement>(`.rv-head button[aria-controls="${DEEP_DIVE_ID}"]`)?.focus({ preventScroll: true });
      }
      el.setAttribute("hidden", "until-found");
    } else el.removeAttribute("hidden");
  }, [hide]);
  useEffect(() => {
    const el = aside.current;
    if (!el || !hide) return;
    const reveal = () => toggleInspector();
    el.addEventListener("beforematch", reveal);
    return () => el.removeEventListener("beforematch", reveal);
  }, [hide, toggleInspector]);

  const section = { collapsible: hydrated && phone, onToggle: toggle };
  let body: ReactNode;
  if (state.status === "ready") {
    const { how, why, sources, breaks } = state.prose;
    body = (
      <>
        <div className="rv-dd-col">
          <DeepSection id="how" open={open.how} {...section}>
            <ol className="rv-dd-steps">
              {how.map((step, index) => (
                <li key={index}>
                  <span>
                    <Prose text={step} />
                  </span>
                </li>
              ))}
            </ol>
          </DeepSection>
        </div>
        <div className="rv-dd-col">
          <DeepSection id="why" open={open.why} {...section}>
            <p>
              <Prose text={why} />
            </p>
            {sources && sources.length > 0 && (
              <ul className="rv-sources" aria-label="Sources">
                {sources.map(({ href, title }) => (
                  <li key={href}>
                    {/* References open beside the rule, never in its place; the name says so to a screen reader. */}
                    <a href={href} target="_blank" rel="noreferrer">
                      {title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </DeepSection>
          <DeepSection id="breaks" icon={<AlertTriangle aria-hidden="true" />} open={open.breaks} {...section}>
            <p>
              <Prose text={breaks} />
            </p>
          </DeepSection>
        </div>
      </>
    );
  } else {
    body = (
      <div className="rv-dd-state" role="status">
        {state.status === "loading" ? (
          <p>Loading the deep dive…</p>
        ) : (
          <>
            <p>Couldn’t load the deep dive.</p>
            <button type="button" className="rv-ctl" onClick={() => void proseLoader.retry(ruleId)}>
              Try again
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <aside
      ref={aside}
      id={DEEP_DIVE_ID}
      data-panel-rule={ruleId}
      className="rv-dd"
      aria-label="Deep dive"
      aria-busy={state.status === "loading" || undefined}
      data-state={state.status}
    >
      {body}
    </aside>
  );
}

/** The review questions: a short list to read before shipping, not a checklist to tick. */
function ShipCheck({ prose }: { prose: RuleProse }) {
  const uid = useId();
  if (prose.review.length === 0) return null;
  return (
    <section className="rv-ship bezel" aria-labelledby={`${uid}-h`}>
      <div className="bezel-head">
        <h2 id={`${uid}-h`}>{PROSE_HEADINGS.review}</h2>
        <span className="bezel-meta" aria-hidden="true">
          {prose.review.length} {prose.review.length === 1 ? "question" : "questions"}
        </span>
      </div>
      <ul className="bezel-panel">
        {prose.review.map((question, index) => (
          <li key={index}>
            <Prose text={question} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The dive's length on the card's header: its three sections at a reading pace of 220 words a minute. */
function readingTime({ how, why, breaks }: RuleProse) {
  const words = [...how, why, breaks].join(" ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export type InspectorProps = {
  ruleId: string;
  /** The server's payload for the landing rule. Used for its own id only; every other rule reads the loader. */
  prose?: RuleProse;
};

export function Inspector({ ruleId, prose }: InspectorProps) {
  const { restorePanel } = useShell();
  const panel = useRef<HTMLDivElement>(null);
  const seeded = prose && prose.id === ruleId ? prose : null;
  const loaded = useProse(ruleId);
  const state: ProseState = seeded ? { status: "ready", prose: seeded } : loaded;
  useLayoutEffect(() => {
    if (state.status !== "loading" && panel.current) restorePanel(ruleId, panel.current);
  }, [restorePanel, ruleId, state.status]);

  // The seed joins the cache, so coming back to this rule later needs no fetch.
  useEffect(() => {
    if (seeded) proseLoader.seed(seeded);
  }, [seeded]);

  return (
    <>
      <div ref={panel} className="rv-side">
        {/* Docked, the reading card is a bezel: a header row on the shell and
            the dive inset below it, still the element that scrolls. Below
            1160, or hidden, the wrapper is display: contents (rule.css). */}
        <div className="rv-dd-card">
          {/* The dive names itself, so only the duplicate label is hidden; the reading time is read out. */}
          <p className="rv-dd-bar">
            <span aria-hidden="true">Deep dive</span>
            {state.status === "ready" ? <span className="rv-dd-meta">{readingTime(state.prose)}</span> : null}
          </p>
          <DeepDive ruleId={ruleId} state={state} />
        </div>
        <Related ruleId={ruleId} />
      </div>
      {state.status === "ready" ? <ShipCheck prose={state.prose} /> : null}
    </>
  );
}
