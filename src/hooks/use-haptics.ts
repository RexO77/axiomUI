"use client";

import { useCallback } from "react";
import { WebHaptics, defaultPatterns, type HapticInput } from "web-haptics";

type HapticAction = "selection" | "medium" | "nudge" | "success" | "warning" | "error";

const ACTION_PATTERNS: Record<HapticAction, HapticInput> = {
  selection: defaultPatterns.selection,
  medium: defaultPatterns.medium,
  nudge: defaultPatterns.nudge,
  success: defaultPatterns.success,
  warning: defaultPatterns.warning,
  error: defaultPatterns.error,
};

const ACTION_COOLDOWN_MS: Record<HapticAction, number> = {
  selection: 60,
  medium: 120,
  nudge: 200,
  success: 220,
  warning: 220,
  error: 260,
};

let haptics: WebHaptics | null = null;
let lastTriggeredAt = 0;

function getHapticsInstance() {
  if (typeof window === "undefined" || !WebHaptics.isSupported) {
    return null;
  }

  if (!haptics) {
    haptics = new WebHaptics();
  }

  return haptics;
}

function canTriggerHaptics() {
  if (typeof window === "undefined" || !WebHaptics.isSupported) {
    return false;
  }

  if (document.visibilityState !== "visible") {
    return false;
  }

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useHaptics() {
  const triggerAction = useCallback((action: HapticAction) => {
    if (!canTriggerHaptics()) {
      return;
    }

    const now = performance.now();
    const cooldown = ACTION_COOLDOWN_MS[action];
    if (now - lastTriggeredAt < cooldown) {
      return;
    }

    lastTriggeredAt = now;
    const instance = getHapticsInstance();
    if (!instance) {
      return;
    }

    void instance.trigger(ACTION_PATTERNS[action]);
  }, []);

  const cancel = useCallback(() => {
    getHapticsInstance()?.cancel();
  }, []);

  return {
    tapLight: () => triggerAction("selection"),
    tapMedium: () => triggerAction("medium"),
    tapNudge: () => triggerAction("nudge"),
    tapSuccess: () => triggerAction("success"),
    tapWarning: () => triggerAction("warning"),
    tapError: () => triggerAction("error"),
    cancel,
    isSupported: WebHaptics.isSupported,
  };
}
