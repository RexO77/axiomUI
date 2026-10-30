# Design tokens naming

- ID: sys-5
- Category: System & logic
- Tags: System, Semantics
- URL: https://axiomui.nischal.fyi/rules/sys-5

Name colors for what they are (blue-500), not for what they do (primary). An alias layer maps the palette onto roles, so a rebrand edits one file instead of every component.

- Do: blue-500 (palette) → accent (alias) → component
- Don't: $button-blue → component

## Why it works

Naming a token for what it is, blue-500, keeps the base palette stable while an alias layer such as accent maps meaning on top, so a rebrand edits the aliases and the palette underneath survives. Naming directly by function, as $button-blue does, welds one component’s intent into the value, and the weld holds the moment anything else borrows that color.

## What breaks

A token named $button-blue ends up on the Payment overdue banner because that blue happened to look right, so the next rebrand moves the button and repaints the warning with it, and nobody connects the two until a customer asks why an overdue notice is the same color as Save.

## How to apply it

1. Structure tokens in three layers: blue-500 in the palette, accent as the alias, then the component that consumes the alias.
2. Name base tokens by hue and value, never by the component that consumes them.
3. Keep function-specific names like button-blue out of the base palette entirely.
4. Point component styles at the semantic alias layer, not the raw palette value.

## Review questions

1. Are base color tokens named by hue and value rather than by function?
2. Is there a semantic alias layer between raw colors and component styles?
3. Would rebranding the primary color require touching more than the alias layer?
