"use client";

import { useId, useRef, useState, type ReactNode, type Ref } from "react";

import { categoryShort } from "@/data/taxonomy";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ArrowRight, ArrowUpRight, ChevronDown, Download, Layers, Pencil, Search, SquareTerminal } from "@/components/ui/icons";
import { skillCatalog, skillRules, skillsTreeUrl, type SkillSpec } from "@/lib/skills/catalog";

import { SkillInstallCommand } from "./skill-install-command";

const tasks: Record<string, { title: string; description: string; prompt: string }> = {
  axiomui: {
    title: "Axiom reference",
    description: "Look up the rules behind a design decision. Your agent can compare two treatments and explain which fits the interface.",
    prompt: "Which Axiom rules apply to this signup form, and why?",
  },
  "axiomui-audit": {
    title: "Design audit",
    description: "Get a prioritized review of an existing interface. Each finding points to a location, the rule it breaks, and a proposed fix.",
    prompt: "Review this signup form. Cite the rule behind each finding and leave the code as it is.",
  },
  "axiomui-website-upgrade": {
    title: "Website upgrade",
    description: "Give your agent an interface to improve in code. It can use the rules to choose changes and check the result.",
    prompt: "Improve this signup form in code, then verify the changes at desktop and phone widths.",
  },
};

const domainPrompts: Record<string, string> = {
  typography: "Review the line height, measure, and alignment in this settings page.",
  layout: "Check how this two-column layout behaves when the viewport narrows.",
  color: "Check the contrast of these controls against their backgrounds in both themes.",
  components: "Review the action hierarchy and dismissal behavior in this confirmation dialog.",
  forms: "Check whether this signup form keeps its labels and gives useful feedback after an error.",
  system: "Review the loading, empty, and error states of this activity feed.",
  motion: "Review this panel’s opening and closing transitions, including reduced motion.",
  accessibility: "Walk through this checkout with the keyboard and identify any unreachable actions.",
};

const groups = [
  { label: "Core", items: skillCatalog.filter(skill => skill.group === "core") },
  { label: "Domains", items: skillCatalog.filter(skill => skill.group === "domain") },
];

function labelOf(skill: SkillSpec) {
  return (skill.categoryId && categoryShort[skill.categoryId]) || tasks[skill.name]?.title || skill.title;
}

function SkillMark({ skill }: { skill?: SkillSpec }) {
  if (skill?.categoryId) return <CategoryIcon categoryId={skill.categoryId} className="size-4" />;
  const Icon = !skill ? SquareTerminal : skill.template === "axiomui-audit" ? Search : skill.template === "axiomui-website-upgrade" ? Pencil : Layers;
  return <Icon aria-hidden="true" />;
}

type Props = {
  closeButton: ReactNode;
  headingRef: Ref<HTMLHeadingElement>;
  onPreview: () => void;
  announce: (message: string) => void;
  skillPath: string;
};

export function SkillsBrowser({ closeButton, headingRef, onPreview, announce, skillPath }: Props) {
  const [selected, setSelected] = useState("axiomui");
  const groupName = useId();
  const details = useRef<HTMLDivElement>(null);
  const skill = skillCatalog.find(item => item.name === selected);
  const task = skill && tasks[skill.name];
  const prompt = task?.prompt ?? (skill?.categoryId && domainPrompts[skill.categoryId]);
  function choose(name: string) {
    setSelected(name);
    details.current?.scrollTo({ top: 0 });
  }
  function option(item?: SkillSpec) {
    const value = item?.name ?? "";
    return (
      <label key={value} className="skill-option">
        <input type="radio" name={groupName} value={value} checked={value === selected} onChange={() => choose(value)} />
        <SkillMark skill={item} />
        <span>{item ? labelOf(item) : "Choose in terminal"}</span>
      </label>
    );
  }
  return (
    <>
      <header className="skill-toolbar">
        <SquareTerminal aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1} id="skills-index-title">Agent skills</h2>
        <a className="skill-action skill-source-link" href={skillsTreeUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
        {closeButton}
      </header>
      <div className="skill-browser">
        <fieldset className="skill-list">
          <legend className="sr-only">Choose a skill</legend>
          {groups.map(group => (
            <div key={group.label} className="skill-group">
              <h3>{group.label}</h3>
              {group.items.map(item => option(item))}
            </div>
          ))}
          <div className="skill-terminal-option">{option()}</div>
        </fieldset>
        <label className="skill-picker-select">
          <span>Choose a skill</span>
          <select value={selected} onChange={event => choose(event.target.value)}>
            {groups.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map(item => <option key={item.name} value={item.name}>{labelOf(item)}</option>)}
              </optgroup>
            ))}
            <option value="">Choose in terminal</option>
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
        <div className="skill-details" ref={details} role="region" aria-labelledby="skill-detail-title">
          <div className="skill-overview">
            <div className="skill-meta"><SkillMark skill={skill} />{skill ? `${skillRules(skill).length} rules` : "Interactive installer"}</div>
            <h3 id="skill-detail-title">{skill ? labelOf(skill) : "Choose in terminal"}</h3>
            <p>{task?.description ?? skill?.summary ?? "Run the installer to choose which skills to add and which coding agents can use them."}</p>
          </div>
          {prompt && <section className="skill-example">
            <h4>Try asking your agent</h4>
            <p>{prompt}</p>
          </section>}
          <SkillInstallCommand skill={skill} announce={announce} />
        </div>
      </div>
      <footer className="skill-footer">
        <button type="button" className="skill-action" onClick={onPreview}>Preview the playbook<ArrowRight aria-hidden="true" /></button>
        <a href={skillPath} download="SKILL.md" className="skill-action"><Download aria-hidden="true" />Download playbook</a>
      </footer>
    </>
  );
}
