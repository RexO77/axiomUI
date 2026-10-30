# Axiom UI — UI logic repository

> Treat every decision as a repeatable system. Break the rule only after you understand it.

The decision engine behind sharp, consistent interfaces. This repository captures the micro-decisions that define durable design systems across typography, layout, color, and interaction patterns.

## What is Axiom UI?

Axiom UI is a reference-ready collection of product UI best practices structured as design axioms—fundamental truths that don't require proof, just application. Each decision includes:

- ✅ Do/Don't patterns
- 🎯 Context tags (Buttons, Forms, Accessibility, etc.)
- 📐 Specific values and formulas
- 🧠 Conceptual grounding (Gestalt, Fitts's Law, etc.)

## Coverage

- **105 curated decisions** grounded in product UI best practices
- **8 system categories**: Typography, Layout, Color, Components, Forms, System Logic, Motion, Accessibility
- **Fast scanning** with tag filters and encoded patterns

## Why Axiom UI?

Stop debating the same design decisions on every project. Axiom UI codifies battle-tested heuristics so teams can:

- Ship faster with consistent patterns
- Onboard designers with clear principles
- Reduce decision fatigue
- Build accessible, readable interfaces by default

## Structure

Each axiom follows a consistent format:
- **Title**: The principle (e.g., "Sentence Case is King")
- **Tags**: Context/domains it applies to
- **Rule**: The specific guideline
- **Do/Avoid**: Visual comparison with values
- **Deep dive**: Extended rationale and edge cases

## Machine-readable

Axiom UI is meant to be pasted into an AI tool as much as read in a browser. Three generated endpoints, always in sync with the ruleset:

- `/llms.txt` — index: what the site is, plus links to the other two
- `/llms-full.txt` — the entire ruleset as markdown, one rule per section
- `/rules.json` — the entire ruleset as structured JSON


## Agent skills

Install the complete skills listed below from this repository:

```sh
npx skills add RexO77/axiomUI
```

The available set is delivered incrementally. Each listed skill contains its own
references; the table and machine catalog are generated from the same source selection.
The standalone `axiomui` npm package is not published yet.

<!-- skills:start -->
| Skill | Group | Rules | What it covers | Install on its own |
|---|---|---|---|---|
| `axiomui` | Core | 105 | Every Axiom UI rule, indexed by domain, with full reasoning one file away. | `npx skills add RexO77/axiomUI --skill axiomui` |
| `axiomui-website-upgrade` | Core | 105 | A playbook for upgrading a real interface in code, backed by every Axiom UI rule. | `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade` |
| `axiomui-audit` | Core | 105 | A read-only design review where every finding cites a rule, a location and a fix. | `npx skills add RexO77/axiomUI --skill axiomui-audit` |
| `axiomui-typography` | Domain | 13 | Casing, tracking, line height, weights, figures and wrapping for interface text. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-system` | Domain | 13 | Loading, empty and error states, undo, optimistic updates, tokens and breakpoints. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 31 | Exact durations, easing and gesture physics for UI motion. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |
<!-- skills:end -->

**Built for consistency. Break rules only after mastering them.**
