"use client";

import { useRef, useState, type PointerEvent } from "react";
import { logicalPoint, type Point, type Size } from "./geometry";

export type Contact = { pointerId: number; pointerType: string; point: Point; receiver: string | null };
export type Trial = { sequence: number; intended: string | null; down: Contact; end: Contact; canceled: boolean; action: string | null };
export function classify(trial: Trial) {
  if (trial.canceled) return "Canceled";
  if (!trial.intended) return trial.end.receiver ?? "No receiver";
  if (trial.action === trial.intended) return "Hit";
  return trial.action ? "Other target" : "Miss";
}
function contact(event: PointerEvent<HTMLElement>, size: Size): Contact {
  const el = event.currentTarget.ownerDocument.elementFromPoint(event.clientX, event.clientY);
  const receiver = event.currentTarget.contains(el) ? el?.closest<HTMLElement>("[data-receiver]")?.dataset.receiver : null;
  return { pointerId: event.pointerId, pointerType: event.pointerType, receiver: receiver ?? null,
    point: logicalPoint({ x: event.clientX, y: event.clientY }, event.currentTarget.getBoundingClientRect(), size) };
}
/** Record release first, then credit only the activation the scene actually commits. */
export function useTapRecorder(size: Size, intended: string | null) {
  const pending = useRef(new Map<number, { intended: string | null; down: Contact }>());
  const sequence = useRef(0);
  const completed = useRef(new Map<number, number>());
  const [trials, setTrials] = useState<Trial[]>([]);
  function begin(event: PointerEvent<HTMLElement>) {
    completed.current.delete(event.pointerId);
    pending.current.set(event.pointerId, { intended, down: contact(event, size) });
  }
  function end(event: PointerEvent<HTMLElement>, canceled = false) {
    const start = pending.current.get(event.pointerId);
    if (!start) return;
    pending.current.delete(event.pointerId);
    const trial = { ...start, sequence: ++sequence.current, end: contact(event, size), canceled, action: null };
    if (!canceled) completed.current.set(event.pointerId, trial.sequence);
    setTrials(old => [...old, trial]);
  }
  function commit(pointerId: number, action: string) {
    const id = completed.current.get(pointerId);
    if (id === undefined) return;
    setTrials(old => old.map(trial => trial.sequence === id ? { ...trial, action } : trial));
    completed.current.delete(pointerId);
  }
  return { trials, begin, end, commit };
}
