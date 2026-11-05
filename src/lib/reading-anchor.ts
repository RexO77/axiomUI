// design-system: strict
import { REDUCED_MOTION_QUERY } from "@/lib/media";

/**
 * Keeps the reader's place across a change that re-lays out the catalog:
 * docking or undocking the drawer, collapsing or expanding the sidebar. Both
 * change the lane's width, which re-wraps every visible card and changes their
 * heights, so the page would jump by whatever the cards above gained or lost.
 *
 * Capture before the change, restore in a layout effect after it, and the
 * card the reader was looking at keeps its top edge where it was. The
 * correction lands before paint, so the jump is never seen.
 */

export type ReadingAnchor = { id: string; top: number };

function inView(element: Element) {
    const { top, bottom } = element.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>("[data-sticky-header]");
    const visibleTop = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
    return bottom > visibleTop && top < window.innerHeight;
}

/**
 * The card to hold in place: the preferred rule's card when it is in view
 * (the one open in the drawer, or just closed), else the first card on screen.
 */
export function findReadingAnchor(preferredId: string | null): ReadingAnchor | null {
    let card: Element | null = preferredId
        ? document.getElementById(`rule-${preferredId}`)
        : null;
    if (card && !inView(card)) card = null;
    card ??= Array.from(document.querySelectorAll("article.rule-card[id]")).find(inView) ?? null;

    return card ? { id: card.id, top: card.getBoundingClientRect().top } : null;
}

/** Scrolls, instantly, so the anchor's card is back at its recorded top. */
export function holdReadingAnchor(anchor: ReadingAnchor) {
    const card = document.getElementById(anchor.id);
    if (!card) return;

    const drift = card.getBoundingClientRect().top - anchor.top;
    if (Math.abs(drift) >= 1) window.scrollBy({ top: drift, behavior: "instant" });
}

/**
 * Holds the anchor now and again as the catalog settles. Re-mounted cards
 * start at their placeholder height and render at their real one in the next
 * frame, which moves the card by a few pixels after the first hold. A
 * ResizeObserver's callbacks run after layout and before paint, so each
 * correction lands in the frame that needed it.
 */
export function settleReadingAnchor(anchor: ReadingAnchor, container: Element) {
    if (!container.isConnected) return () => {};
    holdReadingAnchor(anchor);
    let callbacks = 0;
    let stopped = false;
    const observer = new ResizeObserver(() => {
        if (stopped) return;
        if (!container.isConnected || !document.getElementById(anchor.id)) {
            stop();
            return;
        }
        holdReadingAnchor(anchor);
        if (++callbacks >= 4) stop();
    });
    const timeoutId = window.setTimeout(stop, 300);

    function stop() {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        window.clearTimeout(timeoutId);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("keydown", stop);
        window.removeEventListener("resize", stop);
    }

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("resize", stop);
    observer.observe(container);
    return stop;
}

let pending: ReadingAnchor | null = null;

/** Records the card to hold. Call it just before the state change that re-lays out the lane. */
export function captureReadingAnchor(preferredId: string | null) {
    stopGlide();
    pending = findReadingAnchor(preferredId);
}

/** Puts the captured card back and clears it. Call it in the layout effect that applies the change. */
export function restoreReadingAnchor() {
    const anchor = pending;
    pending = null;
    if (anchor) holdReadingAnchor(anchor);
}

/**
 * How far the page has to scroll for a card to be fully in view, with the
 * `nearest` alignment scrollIntoView uses (scroll margins included), clamped to
 * what the document can scroll.
 */
export function distanceToNearest(card: HTMLElement) {
    const { top, bottom } = card.getBoundingClientRect();
    const style = getComputedStyle(card);
    const start = top - (parseFloat(style.scrollMarginTop) || 0);
    const end = bottom + (parseFloat(style.scrollMarginBottom) || 0);
    const view = window.innerHeight;

    // Above: align its top. Below: align its bottom, or its top if it is taller
    // than the viewport. Already in view, or spanning it: stay.
    let distance = 0;
    if (start < 0 && end <= view) distance = start;
    else if (start > 0 && end > view) distance = end - start > view ? start : end - view;

    const max = Math.max(0, document.documentElement.scrollHeight - view);
    return Math.min(Math.max(window.scrollY + distance, 0), max) - window.scrollY;
}

/** Critically damped: one card's step settles in about 400ms. */
const GLIDE_OMEGA = 16;
/**
 * The glide's top speed, and the most time one frame may advance it. Fast
 * paging outruns the glide, which then cruises at this speed and catches up
 * after the last press, and a stalled frame lags rather than leaps: no frame
 * moves the page more than 100px.
 */
const GLIDE_MAX_SPEED = 4000;
const GLIDE_MAX_STEP_S = 1 / 40;

/**
 * Glides the page after a card on a spring that keeps its speed when the card
 * changes mid-glide. A native smooth scrollIntoView restarts from rest on every
 * call, so fast paging fell further behind on each press and then caught up
 * at 15px/ms. The distance is re-measured every frame, so cards that render at
 * their real height on the way past are aimed at where they actually are.
 * One glide runs at a time; any scroll of the reader's own stops it.
 */
let glide: { card: HTMLElement; velocity: number; last: number; frame: number; reduced: MediaQueryList } | null = null;

function glideStep(now: number) {
    const current = glide;
    if (!current) return;
    if (!current.card.isConnected || window.innerWidth < 1280 || current.reduced.matches) {
        stopGlide();
        return;
    }

    const dt = Math.min(Math.max(now - current.last, 0) / 1000, GLIDE_MAX_STEP_S);
    current.last = now;
    const distance = distanceToNearest(current.card);

    if (Math.abs(distance) < 1 && Math.abs(current.velocity) < 30) {
        if (distance !== 0) window.scrollBy({ top: distance, behavior: "instant" });
        stopGlide();
        return;
    }

    // The exact critically damped step, stable at any frame length: x is the
    // offset from the target, v the velocity, both in px and px/s.
    const x = -distance;
    const v = current.velocity;
    const decay = Math.exp(-GLIDE_OMEGA * dt);
    const drive = v + GLIDE_OMEGA * x;
    const nextV = (v - GLIDE_OMEGA * drive * dt) * decay;
    let move = (x + drive * dt) * decay - x;
    if (Math.abs(nextV) > GLIDE_MAX_SPEED) {
        current.velocity = Math.sign(nextV) * GLIDE_MAX_SPEED;
    } else {
        current.velocity = nextV;
    }
    move = Math.sign(move) * Math.min(Math.abs(move), GLIDE_MAX_SPEED * dt);
    const before = window.scrollY;
    window.scrollBy({ top: move, behavior: "instant" });
    // Root scrollers can round a subpixel request to zero. Keep a small
    // remaining gap from leaving the paging frame alive indefinitely.
    if (move !== 0 && Math.abs(move) < 1 && distance !== 0 && window.scrollY === before) {
        const finish = Math.sign(distance) * Math.min(Math.abs(distance), 1, GLIDE_MAX_SPEED * dt);
        window.scrollBy({ top: finish, behavior: "instant" });
    }
    current.frame = requestAnimationFrame(glideStep);
}

/** Re-target an active glide without discarding its velocity. */
export function glideToCard(card: HTMLElement) {
    if (!card.isConnected || window.innerWidth < 1280) {
        stopGlide();
        return;
    }
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    if (reduced.matches) {
        stopGlide();
        card.scrollIntoView({ block: "nearest", behavior: "instant" });
        return;
    }
    if (glide) {
        glide.card = card;
        return;
    }
    glide = { card, velocity: 0, last: performance.now(), frame: requestAnimationFrame(glideStep), reduced };
    window.addEventListener("wheel", stopGlide, { passive: true });
    window.addEventListener("touchstart", stopGlide, { passive: true });
    window.addEventListener("keydown", stopGlideOnKey);
    window.addEventListener("resize", stopGlide);
    reduced.addEventListener("change", stopGlide);
}

export function stopGlide() {
    if (!glide) return;
    cancelAnimationFrame(glide.frame);
    glide.reduced.removeEventListener("change", stopGlide);
    glide = null;
    window.removeEventListener("wheel", stopGlide);
    window.removeEventListener("touchstart", stopGlide);
    window.removeEventListener("keydown", stopGlideOnKey);
    window.removeEventListener("resize", stopGlide);
}

function stopGlideOnKey(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") stopGlide();
}
