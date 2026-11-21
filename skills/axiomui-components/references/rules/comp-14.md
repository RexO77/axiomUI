# Navigate with links, act with buttons

- ID: comp-14
- Category: Components & actions
- Tags: Navigation, Buttons, Keyboard
- URL: https://axiomui.nischal.fyi/rules/comp-14

If activating a control takes someone to another URL, make it a link with an href, however it is styled. The browser then offers Open in new tab and Copy link, and shows the address before the click. Keep buttons for actions that change something on the current page.

- Do: <a href="/invoices/1042">View invoice</a>
- Don't: <div onClick={() => router.push(…)}>

## Why it works

Someone reconciling accounts often wants three invoices open side by side. When “View invoice” is an `<a href>`, right-click offers Open link in new tab, hovering shows acme.app/invoices/1042 in the status bar, and Cmd-click or middle-click opens it without any extra code. The same control built as a div that calls `router.push` looks identical, but the browser never learns it leads anywhere, so right-click shows the page menu and hovering shows no address.

- [HTML · The a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- [WAI-ARIA APG · Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/)
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

## What breaks

Cmd-click on the div does nothing, so the reader has to open each invoice, press Back and find their place again. Screen-reader users who list the page’s links never find it, Copy link address is missing when someone wants to send the invoice to a colleague, and crawlers do not follow it.

## How to apply it

1. Render navigation as a native `<a>` with a real `href`. Router link components such as Next.js `<Link>` render one and still navigate on the client. Style it as a button if the design calls for one; the element stays a link.
2. To find violations, search for click handlers that navigate: `grep -rnE "onClick=.*(router\.(push|replace)|navigate\(|location\.(href|assign))" src`. Any match on an element other than `<a href>` is a candidate. In the DOM, check that every control whose click changes the URL matches `a[href]`, and flag `<a>` without `href` or `[role=link]` on a div.
3. Keep `<button>` for work on the current page: submitting, opening a menu or dialog, toggling, deleting. An action that ends by navigating, such as Save and view, stays a button and navigates only after it succeeds.

## Review questions

1. Right-click the control. Does the menu offer Open link in new tab and Copy link address?
2. Hover the control, then Cmd-click or middle-click it. Does the status bar show the destination, and does a new tab open while this page stays where it was?
3. Does anything styled as a button change the URL, or anything styled as a link only change the current page?
