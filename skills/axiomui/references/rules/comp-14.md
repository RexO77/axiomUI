# Navigate with links, act with buttons

- ID: comp-14
- Category: Components & actions
- Tags: Navigation, Buttons, Keyboard
- URL: https://axiomui.nischal.fyi/rules/comp-14

Use a link with an href to open a destination. People can then copy its address or open it in another tab. Use a button to perform an action, even if it redirects afterward.

- Do: `<a href="/invoices/1042">View invoice</a>`
- Don’t: `<div onClick={() => router.push(…)}>`

## Why it works

To compare three invoices, a reader can open each in a new tab and keep the list in place. A native link shows its address on hover and offers a link menu. A div that calls `router.push` gets the page menu instead.

- [HTML · The a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- [WAI-ARIA APG · Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/)
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [Google Search Central · Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Chrome Help · Link shortcuts](https://support.google.com/chrome/answer/157179)
- [Next.js · Link](https://nextjs.org/docs/app/api-reference/components/link)

## What breaks

Command-clicking a div that calls `router.push` can open the invoice in the current tab. “View invoice” is missing from a screen reader’s list of links, and the browser offers no link address to copy.

## How to apply it

1. Render navigation as a native `<a>` with a real `href`. Router link components such as Next.js `<Link>` render one and still navigate on the client. Style it as a button if the design calls for one; the element stays a link.
2. Inspect controls meant for navigation in the rendered page. For “View invoice”, check for an `a[href]` whose address opens that invoice. A Save button can redirect after saving.
3. Keep `<button>` for work on the current page: submitting, opening a menu or dialog, toggling, deleting. An action that ends by navigating, such as Save and view, stays a button and navigates only after it succeeds.

## Before you ship

1. Right-click the control. Does the menu offer Open link in new tab and Copy link address?
2. Does hovering show the invoice address? Can you open it in another tab with Command-click on macOS, Ctrl-click on Windows or Linux, or a middle click?
3. Does “View invoice” expose a link to the invoice? Does “Save” submit the changes before leaving the page?
