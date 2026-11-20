// design-system: strict
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Copy } from "@/components/ui/icons";
import { skillInstallCommand, skillsCliCommand, type SkillSpec } from "@/lib/skills/catalog";

type CopyState = "idle" | "copied" | "failed";

async function copyCommand(command: string, isCurrent: () => boolean) {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(command);
      return true;
    } catch {
      // Permission may resolve after the person has selected a different command.
      if (!isCurrent()) return false;
    }
  }

  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement("textarea");
  field.value = command;
  field.readOnly = true;
  field.tabIndex = -1;
  field.className = "sr-only";
  try {
    // Body siblings are inert while the skills dialog is open.
    (trigger?.closest('[role="dialog"]') ?? document.body).appendChild(field);
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }
}

function CommandRow({ command, label, announce }: {
  command: string;
  label: string;
  announce?: (message: string) => void;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const commandRef = useRef<HTMLElement>(null);
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    attempt.current += 1;
    window.clearTimeout(timer.current);
  }, []);

  const failure = "Copy failed. The command is selected for manual copying.";

  async function handleCopy() {
    const request = ++attempt.current;
    const copied = await copyCommand(command, () => request === attempt.current);
    if (request !== attempt.current) return;
    window.clearTimeout(timer.current);
    setState(copied ? "copied" : "failed");
    if (copied) {
      announce?.(`Copied: ${command}`);
      timer.current = window.setTimeout(() => setState("idle"), 1800);
    } else if (commandRef.current) {
      // The native Copy shortcut remains available when clipboard APIs are denied.
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(commandRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
      announce?.(failure);
    }
  }

  const Glyph = state === "copied" ? Check : state === "failed" ? AlertCircle : Copy;
  return (
    <>
      <div className="skill-install-command-row">
        <code ref={commandRef}>
          {command.split(" ").map((word, index) => (
            <Fragment key={index}>{index > 0 && " "}<span>{word}</span></Fragment>
          ))}
        </code>
        <button type="button" className="skill-install-copy" data-state={state}
          aria-label={state === "failed" ? `Retry copying ${label}` : `Copy ${label}`}
          onClick={() => void handleCopy()}>
          <Glyph aria-hidden="true" className="size-4" />
          <span className="skill-copy-label" aria-hidden="true" data-reserve="Copied">
            <span>{state === "copied" ? "Copied" : state === "failed" ? "Retry" : "Copy"}</span>
          </span>
        </button>
        {!announce && (
          <span role="status" className="sr-only">
            {state === "copied" && `Copied: ${command}`}
            {state === "failed" && failure}
          </span>
        )}
      </div>
      {state === "failed" && <p className="skill-copy-help">{failure}</p>}
    </>
  );
}

export function SkillInstallCommand({ skill, announce }: {
  skill?: SkillSpec | null;
  announce?: (message: string) => void;
}) {
  const [global, setGlobal] = useState(false);
  const suffix = global ? " -g" : "";
  const install = (skill ? skillInstallCommand(skill) : skillsCliCommand) + suffix;
  const list = "npx skills list" + suffix;

  return (
    <section className="skill-install-command" aria-label="Install command">
      <div className="skill-install-bar">
        <h4 className="skill-install-heading">Install</h4>
        <div className="skill-install-scope" role="group" aria-label="Installation scope">
          <button type="button" aria-pressed={!global} onClick={() => setGlobal(false)}><Check aria-hidden="true" />Project</button>
          <button type="button" aria-pressed={global} onClick={() => setGlobal(true)}><Check aria-hidden="true" />Global</button>
        </div>
      </div>
      <p className="skill-install-hint">
        {global ? "Install across projects." : "Run in your project folder."}{" "}
        Requires <a href="https://github.com/vercel-labs/skills#install-a-skill" target="_blank" rel="noreferrer">Node.js 22.20 or later</a>.
      </p>
      <CommandRow key={install} command={install}
        label={skill ? `install command for ${skill.name}` : "install command"} announce={announce} />
      <details className="skill-install-after" onToggle={event => {
        const disclosure = event.currentTarget;
        const scroller = disclosure.closest<HTMLElement>(".skill-details");
        if (!disclosure.open || !scroller) return;
        const overflow = disclosure.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom;
        if (overflow > 0) scroller.scrollTop += Math.ceil(overflow);
      }}>
        <summary>After installation</summary>
        <p>
          {global ? "In the global list, find" : "From the same project folder, look for"}{" "}
          {skill ? <code>{skill.name}</code> : "your chosen skills"}. Check the agents listed alongside each skill.
        </p>
        <CommandRow key={install} command={list} label="verification command" announce={announce} />
      </details>
    </section>
  );
}
