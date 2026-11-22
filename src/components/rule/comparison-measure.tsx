// design-system: strict
"use client";

import { useState, type ReactNode } from "react";

import { height, measureValue, sizeLabel, width, type Edges, type Rect, type Target } from "./measure-geometry";
import type { Side } from "./use-compare";
import type { MeasureView } from "./use-comparison-measure";

const verdict: Record<Side, string> = { do: "Do", dont: "Don’t" };

function position(rect: Rect, pane: Rect) {
  return { left: rect.left - pane.left, top: rect.top - pane.top, width: width(rect), height: height(rect) };
}

function Chip({ x, y, pane, children }: { x: number; y: number; pane: Rect; children: string }) {
  const labelWidth = children.length * 7.3 + 8;
  const left = Math.max(4, Math.min(x, width(pane) - labelWidth - 4));
  const top = Math.max(4, Math.min(y, height(pane) - 20));
  return <span className="cmp-measure-chip bg-blue-600 text-on-inverse dark:bg-blue-400" style={{ left, top }}>{children}</span>;
}

function Outline({ target, zoom, label = true }: { target: Target; zoom: number; label?: boolean }) {
  if (width(target.visible) <= 0 || height(target.visible) <= 0) return null;
  const { pane, rect, visible } = target;
  const x = visible.left - pane.left;
  const top = rect.top - pane.top;
  const y = top >= 22 ? top - 18 : visible.bottom - pane.top + 2;
  return (
    <>
      <span className="cmp-measure-outline" style={position(rect, pane)} />
      {label && <Chip x={x} y={y} pane={pane}>{sizeLabel(rect, zoom)}</Chip>}
    </>
  );
}

function Dimension({ axis, start, line, length, pane, label }: {
  axis: "x" | "y"; start: number; line: number; length: number; pane: Rect; label?: string;
}) {
  if (length <= 0) return null;
  const x = axis === "x";
  const style = x ? { left: start, top: line, width: length } : { left: line, top: start, height: length };
  const labelWidth = label ? label.length * 7.3 + 8 : 0;
  const labelX = x ? (length >= labelWidth ? start + (length - labelWidth) / 2 : start + length + 4) : line + 5;
  const labelY = x ? line - 19 : (length >= 16 ? start + (length - 16) / 2 : start + length + 4);
  return (
    <>
      <span className="cmp-measure-line" data-axis={axis} style={style} />
      {label && <Chip x={labelX} y={labelY} pane={pane}>{label}</Chip>}
    </>
  );
}

function Padding({ target, padding, border, zoom }: { target: Target; padding: Edges; border: Edges; zoom: number }) {
  const { rect, pane } = target;
  const [top, right, bottom, left] = padding.map((value) => value * zoom);
  const inner = {
    top: rect.top + border[0] * zoom,
    right: rect.right - border[1] * zoom,
    bottom: rect.bottom - border[2] * zoom,
    left: rect.left + border[3] * zoom,
  };
  const x = (inner.left + inner.right) / 2 - pane.left;
  const y = (inner.top + inner.bottom) / 2 - pane.top;
  const strips = [
    { ...inner, bottom: inner.top + top },
    { ...inner, top: inner.top + top, bottom: inner.bottom - bottom, left: inner.right - right },
    { ...inner, top: inner.bottom - bottom },
    { ...inner, top: inner.top + top, bottom: inner.bottom - bottom, right: inner.left + left },
  ];
  return (
    <>
      {strips.map((strip, index) => width(strip) > 0 && height(strip) > 0 && (
        <span key={index} className="cmp-measure-padding" style={position(strip, pane)} />
      ))}
      <Dimension axis="y" start={inner.top - pane.top} line={x} length={top} pane={pane} />
      <Dimension axis="x" start={inner.right - right - pane.left} line={y} length={right} pane={pane} />
      <Dimension axis="y" start={inner.bottom - bottom - pane.top} line={x} length={bottom} pane={pane} />
      <Dimension axis="x" start={inner.left - pane.left} line={y} length={left} pane={pane} />
    </>
  );
}

function Gap({ gap, pane }: { gap: NonNullable<MeasureView["gap"]>; pane: Rect }) {
  const { left, top, right, bottom, x, y } = gap;
  return (
    <>
      {x > 0 && y === 0 && <span className="cmp-measure-gap" style={position({ left, right, top: bottom, bottom: top }, pane)} />}
      {y > 0 && x === 0 && <span className="cmp-measure-gap" style={position({ top, bottom, left: right, right: left }, pane)} />}
      <Dimension axis="x" start={left - pane.left} line={(top + bottom) / 2 - pane.top} length={right - left} pane={pane} label={`${measureValue(x)}px`} />
      <Dimension axis="y" start={top - pane.top} line={(left + right) / 2 - pane.left} length={bottom - top} pane={pane} label={`${measureValue(y)}px`} />
    </>
  );
}

export function MeasureOverlay({ view, side, zoom }: { view: MeasureView; side: Side; zoom: number }) {
  const pin = view.pin?.side === side ? view.pin : undefined;
  const hover = view.hover?.side === side ? view.hover : undefined;
  const second = view.second?.side === side ? view.second : undefined;
  if (!pin && !hover && !second) return null;
  return (
    <div className="cmp-measure-overlay text-blue-600 dark:text-blue-400" aria-hidden="true">
      {pin && view.detail && !view.typography && <Padding target={pin} padding={view.detail.padding} border={view.detail.border} zoom={zoom} />}
      {pin && !view.typography && <Outline target={pin} zoom={zoom} />}
      {second && <Outline target={second} zoom={zoom} label={!view.gap} />}
      {pin && view.gap && <Gap gap={view.gap} pane={pin.pane} />}
      {hover && hover !== view.typography?.target && hover !== pin && hover !== second && <Outline target={hover} zoom={zoom} />}
    </div>
  );
}

function Reading({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}

export function MeasureReadout({ view, id }: { view: MeasureView | null; id: string }) {
  const [copyResult, setCopyResult] = useState<{ text: string; success: boolean } | null>(null);
  const detail = view?.detail;
  const name = detail && view.pin ? `${verdict[view.pin.side]} · ${detail.name}` : undefined;
  const type = view?.typography;
  const typeRows = type?.measure.rows;
  const padding = detail?.padding.map((value) => `${measureValue(value)}px`).join(" / ");
  const gap = view?.gap;
  const gapSize = gap && `${measureValue(gap.x)}px horizontal / ${measureValue(gap.y)}px vertical`;
  const text = detail && [
    name,
    ...(typeRows ?? []).map(row => row.label + ": " + row.value),
    `Box size: ${detail.size}px`,
    `Padding (top / right / bottom / left): ${padding}`,
    `Font (size / line height · weight): ${detail.font}`,
    `Font family: ${detail.family}`,
    `Color: ${detail.color}`,
    `Background: ${detail.background}`,
    gap && `Gap to ${gap.name}: ${gapSize}`,
  ].filter(Boolean).join("\n");
  const copied = text && copyResult?.text === text ? (copyResult.success ? "Copied" : "Couldn’t copy") : "";

  return (
    <section className="cmp-measure-readout" aria-label="Measurements">
      <p id={id} className="cmp-measure-instructions">
        <span className="cmp-measure-pointer" aria-hidden="true">
          <span className="rule-hint-key">Click an element to pin it. On the same side, click another or hold Alt and hover over it to measure the gap.</span>
          <span className="rule-hint-touch">Tap an element to pin it. Tap another on the same side to measure the gap.</span>
        </span>
        <span className="cmp-measure-keys sr-only">Use arrow keys to choose an element. Press Enter to pin it. Choose another on the same side and press Enter to measure the gap. Escape exits Measure.</span>
      </p>
      <span className="sr-only" role="status">
        {view?.candidate || copied ||
          (detail ? `${name}, ${detail.size} pixels. ${gap ? `Gap to ${gap.name}: ${gapSize}.` : ""}` : "Measure on.")}
      </span>
      {(type || detail) && (
        <>
          <div className="cmp-measure-heading">
            <h3>{name ?? (type && verdict[type.target.side] + " · " + type.name)}</h3>
            {text && <button type="button" className="cmp-ctl" onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopyResult({ text, success: true });
              } catch {
                setCopyResult({ text, success: false });
              }
            }}>Copy measurements</button>}
            {copied && <span className="cmp-measure-copy">{copied}</span>}
          </div>
          <dl>
            {typeRows?.map(row => <Reading key={row.key} label={row.label}>{row.value}</Reading>)}
            {detail && <>
              <Reading label="Box size">{detail.size}px</Reading>
              <Reading label="Padding (top / right / bottom / left)">{padding}</Reading>
              {!type && <Reading label="Font (size / line height · weight)">{detail.font}</Reading>}
              {!type && <Reading label="Font family">{detail.family}</Reading>}
              <Reading label="Color">{detail.color}</Reading>
              <Reading label="Background">{detail.background}</Reading>
              {gap && <Reading label={`Gap to ${gap.name}`}>{gapSize}</Reading>}
            </>}
          </dl>
        </>
      )}
    </section>
  );
}
