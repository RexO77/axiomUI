# Agent skills design and verification

The dialog offers three core skills and eight domain skills. The core entries each covered 105 rules when the review began. With the three worked examples, each now carries 108. Someone choosing among them needs to know what their agent will do differently. Someone who just copied a command needs a way to confirm that the right agent received it.

## Choosing and installing

1. **Give the three core skills one example task each.** Use the same signup form across all three so the difference is easy to see. Reference answers “Which rules apply to this form, and why?” Audit answers “Review this form and cite the rule behind each finding.” Upgrade answers “Improve this form in code and verify the changes.” In a first-use review, ask someone to choose a skill for a review-only assignment and describe what they expect to receive. [Audit](https://github.com/RexO77/axiomUI/tree/main/skills/axiomui-audit) · [Upgrade](https://github.com/RexO77/axiomUI/tree/main/skills/axiomui-website-upgrade)
2. **Show how to confirm installation.** Place an “After installation” disclosure next to the main command. Show `npx skills list` for the project, with `npx skills list -g` for a global install. Tell readers to look for their selected skill and agent. In a clean project, installing the public audit skill for Codex and running `list --json` returned the skill, project scope, and Codex among its agents. The copy button should continue to report only clipboard success. [CLI command reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-list)
3. **Expose the CLI prerequisite near the command.** The advertised command uses Vercel’s skills CLI. At review, version 1.9.0 declared Node.js 22.20.0 or later. Link the upstream requirement and recheck the package metadata when updating that line. Test with a developer on Node 20 who needs to decide whether their environment is ready. [Upstream installation guide](https://github.com/vercel-labs/skills#install-a-skill)

## Moving from the rail to the dialog

1. **Preserve the source card and focus during a cold load.** Opening the compact card warms the dialog chunk. If Browse is activated before that fetch finishes, the card can disappear before the dialog takes focus. Keep it available through the handoff and support retry after a failed fetch. Test with a one-second delay, a double activation, and Escape during the wait. Canceling should suppress a late opening. [React lazy loading](https://react.dev/reference/react/lazy) · [WAI-ARIA dialog focus](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
2. **Keep type and icons at their natural proportions during expansion.** The current panel matches the starting and ending rectangles, which have different aspect ratios. A surface can interpolate between those rectangles while its contents fade independently. Inspect the midpoint with the playbook and the shorter install view. A square glyph should still be square and only one install command should be legible. [Motion on child distortion](https://motion.dev/docs/react-layout-animations#fixing-child-distortion-during-layout-animations)
3. **Recheck the close destination after a resize.** The original card bounds are a snapshot. On pointer dismissal the full dock contracts toward the visible install button over 180 ms and its contents fade within the first 75 ms. If the rail disappears while the dialog is open, fade locally and restore focus to the visible navigation control. Test opening on desktop, resizing to phone width, and dismissing from each view. [CSSOM View geometry](https://drafts.csswg.org/cssom-view/#dom-element-getboundingclientrect) · [WAI-ARIA focus return](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## New rules in the existing skills

| Proposed rule | Where it belongs | What the comparison should let someone verify |
| --- | --- | --- |
| Paste a complete sign-in code | Forms and Accessibility | Paste `012345` once. The full code, including the leading zero, reaches the form. Explain the scope and alternative authentication paths in WCAG 3.3.8. [W3C failure example](https://www.w3.org/WAI/WCAG22/Techniques/failures/F109) |
| Make the chart’s question answerable without the plot | Components and Accessibility | Hide the plot. Use the keyboard and a screen reader to identify the declining series and look up a specific month’s value and unit. Change the filter and check both answers again. [WAI complex images](https://www.w3.org/WAI/tutorials/images/complex/) · [USWDS data visualizations](https://designsystem.digital.gov/components/data-visualizations/) |
| Keep mixed-direction names, punctuation and counts readable | Typography and Layout | Insert English and Hebrew restaurant names in both English and Hebrew interfaces. A bilingual reviewer can verify that each name retains its direction and that each number stays with its review label. [W3C inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/) |

All three examples are available as interactive rule pages. The distributed reference files carry the same primary sources as the site. See [the worked examples and cross-engine checks](rule-review/added-rules.md).

## What the public install command reports

The dialog invokes Vercel’s `skills` package through npm. At review, npm resolved version 1.9.0 with a minimum Node.js version of 22.20.0. Running that version’s entry point on Node 20.20.2 exited before it could list skills because the runtime lacked a required filesystem API. Axiom’s separate checkout installer has its own runtime requirements. [Public package metadata](https://registry.npmjs.org/skills/1.9.0) · [Upstream installation guide](https://github.com/vercel-labs/skills#install-a-skill) · [Axiom installer](https://github.com/RexO77/axiomUI/blob/main/packages/axiomui/README.md)

I ran the published CLI against the public GitHub repository on Node 26.7.0. The checks used disposable projects and redirected Node’s home-directory lookup to a temporary directory for the global installation. The installation runs added `-a codex -y` to make the agent choice reproducible. The dialog leaves those choices interactive. [Installation options](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#options)

| Question | Command or setup | Observed result |
| --- | --- | --- |
| What does the repository offer? | `npx skills add RexO77/axiomUI --list` | The normal listing returned all 11 names in Axiom’s distribution, including three core skills. |
| How can I verify a project install? | Install `axiomui-audit`, then run `npx skills list -a codex --json` in that project with a detectable Codex configuration. | The record named the audit skill, project scope, Codex, and tracked status. From a different, empty project the default list returned no records. |
| How can I verify a global install? | Install `axiomui-forms` with `-g`, then run `npx skills list -g -a codex --json`. | The record named the forms skill, global scope, Codex, and tracked status. The default project list in the empty project still returned no records. |
| What if no agent is detected? | Run the same listings with no Codex configuration directory in the temporary profile. | Installation and file discovery succeeded. The text listing showed the skill name and `Agents: not linked`. Creating the Codex configuration directory made Codex appear on the next listing. File discovery alone cannot confirm that an agent used the skill in a session. |
| What if a skill name is mistyped? | Pass the nonexistent name `axiomui-missing-example`. | The command exited with status 1 and listed possible names. Its expanded failure search also found the compatibility copy, `axiom-website-upgrade`. The general listing and valid named installs both discovered the 11 distributed skills. |

The verification disclosure therefore follows the selected scope and asks the reader to check the skill name and the agents beside it. The CLI’s `check` command looks for updates. The dialog only receives a clipboard result and cannot observe what ran in someone’s terminal. [CLI listing and update commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-list)

## Interaction verification

| Condition | What the browser did |
| --- | --- |
| 320 × 640 CSS pixels, doubled text | Enlarging each computed text size and line height exposed a clipped “Website upgrade” choice. The selector had 113px for 218px of content. It now wraps below its label and measures 288px wide, with a matching 288px scroll width in Chromium and WebKit. The command and verification disclosure fit the detail column. |
| Browser zoom at 200% | Changing Chromium’s tab zoom from 1 to 2 changed a 1280 × 753 CSS-pixel viewport to 640 × 376 and the reported device pixel ratio from 1 to 2. The compact chooser appeared. The workspace and detail column each measured 640px across without horizontal overflow. The footer actions remained 44 CSS pixels high. |
| Short touch landscape | At 667 × 320 CSS pixels, a sequence of touch-start, move and end events scrolled the detail column. The footer kept the same bounding rectangle throughout. Both 44px footer actions received hit tests at their centers, and tapping Preview opened the playbook. |
| Keyboard and native picker | The open verification disclosure adds one Copy action to the ten-stop desktop Tab sequence. Tab and Shift+Tab traverse both ends. Closing the disclosure skips its hidden Copy button. The modal gives Escape to an open native skill chooser. Escape from the closed chooser dismisses the workspace and returns focus to Menu. |
| Forced colors | Selection and focus previously used the same outline. The selected skill now has a 3px leading bar, the selected installation scope has an underline, and keyboard focus has its own outline. In Chromium’s light and dark forced-color palettes, the heading, descriptive text, hint and selection bar each measured 21:1 against Canvas. The help link measured 13.99:1 and 19.56:1. The focus ring measured 11.30:1 and 9.10:1 after compositing its alpha against Canvas. |

The keyboard sweep exposed a WebKit-specific failure. With its default macOS Tab settings, focus jumped from GitHub to the disclosure and then left the document. The workspace now advances focus through the visible controls in DOM order, including the selected radio and open disclosure actions. [Modal keyboard behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

The touch checks use Chromium device emulation with browser-dispatched touch input. Physical-device gestures and assistive-technology announcements remain unverified. Headless browser tests can observe whether the dialog consumed Escape, retained focus, and closed from a collapsed picker. The operating system controls the visible native option list. Contrast values apply to the two measured browser palettes.
