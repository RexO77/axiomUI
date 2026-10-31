// design-system: strict
"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import type { CSSProperties, ReactElement, RefObject, UIEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Drawer } from "vaul";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { VerdictLabel } from "@/components/ui/verdict-label";
import type { DeepDiveSection, Rule } from "@/data/ui-logic";
import { getAdjacentRules } from "@/data/ui-logic";
import { useHaptics } from "@/hooks/use-haptics";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";

interface RuleDrawerProps {
  activeRule: Rule | null;
  activeCategoryName: string;
  activeRuleId: string | null;
  contentPending: boolean;
  onClose: () => void;
  onNavigate: (ruleId: string) => void;
}

/*
 * Two shells, one panel.
 *
 * At xl the panel docks beside the grid. The grid stays live: you can click
 * another card, tab back to it, and a screen reader can still read it. That is
 * a plain <aside>, because vaul always mounts a modal Radix Dialog (it does not
 * forward `modal={false}`), which hides the rest of the page from assistive
 * tech and traps focus even while the drawer looks non-modal.
 *
 * Below xl the panel covers most of the screen, so it is a real modal sheet:
 * vaul with a scrim, focus held inside, Esc and the scrim close it.
 *
 * Both shells move focus to the rule title on open and hand it back to the
 * control that opened them on close.
 */

const XL_QUERY = "(min-width: 1280px)";

function subscribeXl(onChange: () => void) {
  const mql = window.matchMedia(XL_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useIsXl() {
  return useSyncExternalStore(
    subscribeXl,
    () => window.matchMedia(XL_QUERY).matches,
    () => false,
  );
}

const inPanel = (element: Element) => element.closest("[data-rule-panel]") !== null;

/** How long the last rule stays rendered after close: the exit (220ms) plus slack. */
const EXIT_HOLD_MS = 400;

// Set both the standard and -webkit-prefixed backdrop-filter (older Safari).
// Uses setProperty since `webkitBackdropFilter` isn't in the typed CSSOM.
function setHeaderBlur(header: HTMLElement, radius: string) {
  const value = `blur(${radius})`;
  header.style.setProperty("backdrop-filter", value);
  header.style.setProperty("-webkit-backdrop-filter", value);
}

export function RuleDrawer({
  activeRule,
  activeCategoryName,
  activeRuleId,
  contentPending,
  onClose,
  onNavigate,
}: RuleDrawerProps) {
  const { tapMedium } = useHaptics();
  const isXl = useIsXl();
  const isOpen = Boolean(activeRuleId);

  // Keep the last rule on screen while the panel slides out, instead of
  // swapping its content for the empty state mid-exit.
  const [heldRule, setHeldRule] = useState<Rule | null>(activeRule);
  const [heldCategory, setHeldCategory] = useState(activeCategoryName);
  if (activeRule && activeRule !== heldRule) {
    setHeldRule(activeRule);
    setHeldCategory(activeCategoryName);
  }
  useEffect(() => {
    if (isOpen || !heldRule) return;
    const timeoutId = window.setTimeout(() => setHeldRule(null), EXIT_HOLD_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, heldRule]);

  const rule = activeRule ?? (isOpen ? null : heldRule);
  const categoryName = activeRule ? activeCategoryName : heldCategory;

  const [loadedDeepDive, setLoadedDeepDive] = useState<{
    ruleId: string;
    sections: DeepDiveSection[];
  } | null>(null);
  const deepDive =
    loadedDeepDive && loadedDeepDive.ruleId === rule?.id ? loadedDeepDive.sections : [];
  const { prev, next } = rule ? getAdjacentRules(rule) : { prev: null, next: null };

  const headerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoreBlur = useRef<ReturnType<typeof setTimeout>>(undefined);
  const titleEl = useRef<HTMLHeadingElement | null>(null);
  const titleFocusPending = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const closedOpener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const requestClose = useCallback(() => {
    tapMedium();
    onClose();
  }, [onClose, tapMedium]);

  // The title can mount after the open effect has run (the prose arrives a
  // render late, and vaul portals its content in a layout effect), so the
  // focus hand-off is finished by whichever happens second.
  const titleRef = useCallback((node: HTMLHeadingElement | null) => {
    titleEl.current = node;
    if (node && titleFocusPending.current) {
      requestAnimationFrame(() => {
        if (titleEl.current !== node || !titleFocusPending.current) return;
        titleFocusPending.current = false;
        node.focus({ preventScroll: true });
      });
    }
  }, []);

  // Focus in on open, back out on close. While open, remember the last thing
  // focused outside the panel: at xl that is the card you clicked most
  // recently, which is where Esc should take you back to.
  useEffect(() => {
    if (!isOpen) return;

    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    if (titleEl.current) titleEl.current.focus({ preventScroll: true });
    else titleFocusPending.current = true;

    const track = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && !inPanel(target)) {
        opener.current = target;
      }
    };
    document.addEventListener("focusin", track);

    return () => {
      document.removeEventListener("focusin", track);
      titleFocusPending.current = false;
      const target = opener.current;
      closedOpener.current = target;
      opener.current = null;
      const current = document.activeElement;
      const focusIsOurs =
        !current || current === document.body || inPanel(current);
      if (!focusIsOurs) return;
      // A deep link has no opener: land on the page's main region instead
      // of letting focus fall to <body> when the panel goes away.
      if (target?.isConnected) target.focus();
      else document.getElementById("main-content")?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Changing shells while open must move focus into the newly mounted panel.
  useEffect(() => {
    if (!isOpen) return;
    titleFocusPending.current = true;
    const frame = requestAnimationFrame(() => {
      if (!titleEl.current) return;
      titleFocusPending.current = false;
      titleEl.current.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isXl]);

  // Paging can remove the button that was pressed (Previous on the first
  // rule). Put focus on the new title rather than let it fall to <body>.
  useEffect(() => {
    if (!isOpen || !rule) return;
    if (document.activeElement === document.body) titleEl.current?.focus({ preventScroll: true });
  }, [isOpen, rule]);

  // Lighten the sticky header blur during scroll, then restore it after
  // settling. Keep per-frame updates off React's render path.
  const handleScroll = () => {
    const header = headerRef.current;
    if (!header) return;
    // Keep the bar at its resting blur under reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Set backdrop-filter directly (not via a CSS var) so the transition on
    // .drawer-sticky-header actually animates — changing an unregistered custom
    // property updates the dependent property instantly, with no fade.
    setHeaderBlur(header, "6px");
    clearTimeout(restoreBlur.current);
    restoreBlur.current = setTimeout(() => setHeaderBlur(header, "20px"), 120);
  };

  useEffect(() => () => clearTimeout(restoreBlur.current), []);

  // The authored prose lives in an async chunk. Key the loaded value to the
  // rule so a slow, stale import can never flash beneath a newer rule title.
  useEffect(() => {
    if (!rule) return;

    let cancelled = false;
    import("@/data/deep-dive-builder").then(({ buildDeepDive }) => {
      if (!cancelled) {
        setLoadedDeepDive({ ruleId: rule.id, sections: buildDeepDive(rule) });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rule]);

  // Arrow keys page through the current category while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target instanceof Element ? event.target : null;
      if (event.defaultPrevented || target?.closest("input, textarea, select, [contenteditable]")) return;
      const modal = target?.closest("[aria-modal='true']");
      if (modal && !modal.querySelector("[data-rule-panel]")) return;

      const targetRule = event.key === "ArrowLeft" ? prev : next;
      if (!targetRule) return;

      event.preventDefault();
      onNavigate(targetRule.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, next, onNavigate, prev]);

  // The docked panel has no Radix layer to close it on Esc. A field keeps its
  // own Esc (the search box clears itself), and so does any modal on top.
  useEffect(() => {
    if (!isOpen || !isXl) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable], [aria-modal='true']")) return;
      requestClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isXl, requestClose]);

  // A content swap starts at the top immediately; it is not a scroll animation.
  // Closing leaves the scroll alone so the exit shows what you were reading.
  useEffect(() => {
    if (activeRuleId) scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeRuleId]);

  // Wait for the docked layout to paint before the panel enters.
  const dockRef = useRef<HTMLElement>(null);
  const ready = isOpen && !contentPending;
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    if (!isOpen) {
      dock.dataset.shown = "false";
      return;
    }
    if (!ready || dock.dataset.shown === "true") return;

    let second = 0;
    let focusFrame = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        dock.dataset.shown = "true";
        // Visibility settles on the next frame, before focus can enter.
        focusFrame = requestAnimationFrame(() => {
          if (!document.activeElement?.closest('[aria-modal="true"]')) {
            titleFocusPending.current = false;
            titleEl.current?.focus({ preventScroll: true });
          }
        });
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      cancelAnimationFrame(focusFrame);
    };
  }, [isOpen, ready, isXl]);

  const panel = (
    <PanelBody
      dialog={!isXl}
      open={isOpen}
      titleId={titleId}
      rule={rule}
      categoryName={categoryName}
      pending={contentPending}
      deepDive={deepDive}
      prev={prev}
      next={next}
      titleRef={titleRef}
      headerRef={headerRef}
      scrollRef={scrollRef}
      onScroll={handleScroll}
      onClose={requestClose}
      onNavigate={onNavigate}
    />
  );

  if (isXl) {
    return (
      <aside
        ref={dockRef}
        aria-labelledby={titleId}
        inert={!isOpen}
        data-shown="false"
        className="sidebar-motion invisible fixed inset-y-6 right-6 z-[90] flex w-[min(40vw,480px)] translate-x-[calc(100%+3rem)] ease-drawer will-change-[translate] data-[shown=true]:visible data-[shown=true]:translate-x-0"
        style={{
          transitionProperty: "translate, visibility",
          transitionDuration: isOpen ? "var(--motion-slow)" : "var(--motion-medium)",
        }}
      >
        <div
          data-rule-panel=""
          className="flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-panel"
        >
          {panel}
        </div>
      </aside>
    );
  }

  return (
    <Drawer.Root
      direction="right"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && activeRuleId) requestClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[89] bg-black/20 dark:bg-black/50"
          // Radix dismisses on pointerdown, so focus is already back on the
          // opener when the mousedown lands here. Keep it from blurring it.
          onMouseDown={(event) => event.preventDefault()}
        />
        <Drawer.Content
          className="fixed inset-y-0 right-0 z-[90] flex w-full overscroll-contain outline-none sm:inset-y-3 sm:right-3 sm:w-[min(calc(100vw-24px),560px)]"
          // Start past the 12px inset and the shadow, so frame one is empty.
          style={{ "--initial-transform": "calc(100% + 2rem)" } as CSSProperties}
          // Finish our return-focus handoff after Radix releases its trap.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (isOpen) return;
            const current = document.activeElement;
            if (current !== document.body && current && !inPanel(current)) return;
            const target = closedOpener.current;
            if (target?.isConnected) target.focus({ preventScroll: true });
            else document.getElementById("main-content")?.focus({ preventScroll: true });
          }}
        >
          <div
            data-rule-panel=""
            className="flex h-full w-full flex-col overflow-hidden bg-surface shadow-panel sm:rounded-card sm:border sm:border-line"
          >
            {panel}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ------------------------------------------------------------------------ */

interface PanelBodyProps {
  /** Inside vaul's Radix Dialog: the title and lead become its label and description. */
  dialog: boolean;
  open: boolean;
  /** Labels the docked <aside>. Inside the dialog, Radix wires its own ids. */
  titleId: string;
  rule: Rule | null;
  categoryName: string;
  pending: boolean;
  deepDive: DeepDiveSection[];
  prev: Rule | null;
  next: Rule | null;
  titleRef: (node: HTMLHeadingElement | null) => void;
  headerRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onNavigate: (ruleId: string) => void;
}

function PanelBody({
  dialog,
  open,
  titleId,
  rule,
  categoryName,
  pending,
  deepDive,
  prev,
  next,
  titleRef,
  headerRef,
  scrollRef,
  onScroll,
  onClose,
  onNavigate,
}: PanelBodyProps) {
  // Spread, not `id={undefined}`: an explicit undefined would overwrite the
  // id Radix's Slot gives the dialog title.
  const labelId = dialog ? {} : { id: titleId };
  const asTitle = (heading: ReactElement) =>
    dialog ? <Drawer.Title asChild>{heading}</Drawer.Title> : heading;
  const asDescription = (paragraph: ReactElement) =>
    dialog ? <Drawer.Description asChild>{paragraph}</Drawer.Description> : paragraph;

  const closeButton = (
    <IconButton size="md" label="Close panel" title="Close panel" onClick={onClose}>
      <X aria-hidden="true" />
    </IconButton>
  );

  if (!rule) {
    if (pending || !open) {
      // The prose is a render behind the click. Keep the panel blank rather
      // than flash the empty state, but give the dialog its name meanwhile.
      return dialog ? (
        <>
          <Drawer.Title className="sr-only">Rule details</Drawer.Title>
          <Drawer.Description className="sr-only">
            Implementation guidance and visual comparisons for the selected rule.
          </Drawer.Description>
        </>
      ) : null;
    }

    return (
      <div className="flex flex-1 flex-col px-5 pb-8 sm:px-7">
        <div className="-mx-5 flex justify-end px-5 py-3.5 sm:-mx-7 sm:px-7">
          <div className="-mr-3">{closeButton}</div>
        </div>
        <div className="mx-auto mt-16 max-w-sm text-center">
          {asTitle(
            <h2
              ref={titleRef}
              {...labelId}
              tabIndex={-1}
              className="text-2xl font-semibold text-ink outline-none"
            >
              Nothing to show here
            </h2>,
          )}
          {asDescription(
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              No rule is selected, or the link points at one that no longer exists. Close the
              panel to browse every rule, or search by keyword.
            </p>,
          )}
          <Button variant="secondary" onClick={onClose} className="mt-6">
            <X aria-hidden="true" className="size-3.5" />
            Close panel
          </Button>
        </div>
      </div>
    );
  }

  const summary = findTextSection(deepDive, "Summary") ?? rule.desc;
  const whyItMatters = findTextSection(deepDive, "Why it matters");
  const riskWhenIgnored = findTextSection(deepDive, "Risk when ignored");
  const implementationNotes = findListSection(deepDive, "Implementation notes");
  const reviewPrompts = findListSection(deepDive, "Design review prompts");
  const showcase = hasShowcase(rule.id);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="drawer-scroll flex-1 overflow-y-auto px-5 pb-8 sm:px-7"
    >
      {/* Sticky header: keeps the category + copy/close reachable while the
          body scrolls. Bleeds past the scroll padding so its backdrop spans
          the full pane width. */}
      <div
        ref={headerRef}
        className="drawer-sticky-header sticky top-0 z-20 -mx-5 flex items-center justify-between gap-3 bg-surface/70 px-5 py-3.5 sm:-mx-7 sm:px-7"
      >
        <p className="min-w-0 truncate font-sans text-sm font-medium text-ink-muted">{categoryName}</p>
        {/* -mr-3 pulls the last glyph onto the text column's right edge. */}
        <div className="-mr-3 flex shrink-0 items-center gap-1">
          <IconButton
            size="md"
            href={`/rules/${rule.id}`}
            label={`Open full page for ${rule.title}`}
            title="Open full page"
          >
            <ArrowUpRight aria-hidden="true" />
          </IconButton>
          <CopyRuleButton key={rule.id} rule={rule} variant="icon" />
          {closeButton}
        </div>
      </div>

      <div className="rule-drawer-content space-y-10 pt-4 sm:space-y-12 sm:pt-5">
        {/* Keyed by category so the header only re-animates when the category
            changes; switching rules within a category leaves it put. */}
        <header key={rule.category} className="rule-drawer-stagger">
          {asTitle(
            <h2
              ref={titleRef}
              {...labelId}
              tabIndex={-1}
              className="text-2xl font-semibold leading-tight text-ink outline-none sm:text-3xl"
            >
              {rule.title}
            </h2>,
          )}
          {asDescription(<p className="mt-4 text-base leading-7 text-ink-secondary">{summary}</p>)}
        </header>

        {/* Keyed by rule so the body re-animates on every rule change, even
            when the header stays put within a category. */}
        <div key={rule.id} className="grid gap-10">
          <section className="rule-drawer-stagger space-y-10">
            {showcase ? (
              // The showcase already labels its two panes, so the shorthand
              // follows once, as a key, instead of as two more cards.
              <div>
                <MotionShowcase ruleId={rule.id} />
                <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
                  <dt className="flex">
                    <VerdictLabel verdict="do" size="sm" />
                  </dt>
                  <dd className="min-w-0 font-mono text-sm leading-6 text-ink-muted">{rule.do}</dd>
                  <dt className="flex">
                    <VerdictLabel verdict="dont" size="sm" />
                  </dt>
                  <dd className="min-w-0 font-mono text-sm leading-6 text-ink-muted">{rule.dont}</dd>
                </dl>
              </div>
            ) : (
              <div className="grid gap-8">
                {(["do", "dont"] as const).map((verdict) => (
                  <article key={verdict} className="min-w-0">
                    <h3 className="flex font-sans">
                      <VerdictLabel verdict={verdict} size="sm" />
                    </h3>
                    <div className="mt-3">
                      <RulePreview rule={rule} variant={verdict} size="lg" />
                    </div>
                    <p className="mt-3 font-mono text-sm leading-6 text-ink-muted">
                      {verdict === "do" ? rule.do : rule.dont}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {implementationNotes.length > 0 ? (
              <article>
                <SectionHeading>How to apply it</SectionHeading>
                <NumberedList items={implementationNotes} />
              </article>
            ) : null}
          </section>

          <div className="rule-drawer-stagger space-y-10">
            {whyItMatters ? (
              <article>
                <SectionHeading>Why it works</SectionHeading>
                <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{whyItMatters}</p>
              </article>
            ) : null}

            {riskWhenIgnored ? (
              <article>
                <h3 className="flex items-center gap-2 font-sans text-xs font-semibold text-amber-800 dark:text-amber-200">
                  <AlertTriangle aria-hidden="true" className="size-4 text-amber-700 dark:text-amber-300" />
                  What breaks
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{riskWhenIgnored}</p>
              </article>
            ) : null}

            {reviewPrompts.length > 0 ? (
              <article>
                <SectionHeading>Review questions</SectionHeading>
                <NumberedList items={reviewPrompts} />
              </article>
            ) : null}
          </div>
        </div>

        {prev || next ? (
          <nav aria-label="Rule navigation" className="grid grid-cols-2 gap-4 pt-6">
            {prev ? (
              <PagerLink direction="prev" rule={prev} onNavigate={onNavigate} />
            ) : null}
            {next ? (
              <PagerLink direction="next" rule={next} onNavigate={onNavigate} />
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return <h3 className="font-sans text-xs font-semibold text-ink-secondary">{children}</h3>;
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="mt-4 space-y-4">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-baseline gap-3">
          <span className="w-5 shrink-0 text-right text-sm tabular-nums text-ink-muted">{index + 1}</span>
          <p className="text-sm leading-relaxed text-ink-secondary">{item}</p>
        </li>
      ))}
    </ol>
  );
}

/** A two-line pager: the direction as a small label, the title beneath it. */
function PagerLink({
  direction,
  rule,
  onNavigate,
}: {
  direction: "prev" | "next";
  rule: Rule;
  onNavigate: (ruleId: string) => void;
}) {
  const isNext = direction === "next";
  const Arrow = isNext ? ArrowRight : ArrowLeft;

  return (
    <button
      type="button"
      onClick={() => onNavigate(rule.id)}
      className={`pressable -mx-2 flex min-h-11 min-w-0 flex-col gap-1 rounded-frame px-2 py-1.5 text-ink-secondary hover:text-ink ${
        isNext ? "col-start-2 items-end justify-self-end text-right" : "items-start text-left"
      }`}
    >
      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
        {isNext ? null : <Arrow aria-hidden="true" className="size-3.5" />}
        {isNext ? "Next" : "Previous"}
        {isNext ? <Arrow aria-hidden="true" className="size-3.5" /> : null}
      </span>
      <span className="line-clamp-2 text-sm font-medium">
        {rule.title}
      </span>
    </button>
  );
}
