# Return people to the result they opened

- ID: sys-15
- Category: System & logic
- Tags: Navigation, States
- URL: https://axiomui.nischal.fyi/rules/sys-15

When someone opens an item from a searched, filtered or scrolled list, Back should bring them to the same query, filters, sort and scroll position, with the item they opened in view. A refresh or a pasted link should restore the same view.

- Do: Back → Overdue · sorted by due date · row 37
- Don't: Back → All invoices · top of the list

## Why it works

A collections clerk filters invoices to Overdue, sorts by due date, scrolls to row 37 and opens Northwind’s invoice. Pressing Back should put them on that same row with the filter and sort still applied, so they can open row 38 next. Baymard found that sites which reset the list to the top force people to scroll and re-scan for the item they just viewed, and that users read this as the site being broken.

- [Baymard Institute · Return users to the same place in the list](https://baymard.com/research-articles/return-same-place)
- [WHATWG HTML · The History interface](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface)
- [MDN · History.scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)

## What breaks

Back lands on All invoices, sorted by newest, at row 1. The clerk has to reapply the filter, re-sort and scroll for every invoice they check, and on a long list they lose track of which ones they have already handled. A refresh or a shared link drops the view the same way.

## How to apply it

1. Keep shareable view state, such as the query, filters, sort and page, in the URL (for example `?status=overdue&sort=due`), and render the list from it. Update it with `history.replaceState` or the router’s replace so changing a filter does not stack a Back step per click.
2. Keep scroll position and expanded rows out of the URL. Let the browser restore scroll (`history.scrollRestoration` stays `auto`), or save the position with the history entry and restore it once the rows have rendered. Keep the list data cached so Back does not refetch and render an empty list first.
3. To find violations, search for filter, sort and search state held only in component state, such as `useState` for a filter with no matching `useSearchParams` or `URLSearchParams`, and for `history.scrollRestoration = "manual"` or a `window.scrollTo(0, 0)` that runs on every route change.

## Review questions

1. Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?
2. Copy the URL while the list is filtered and paste it into a new tab. Does the same view load?
3. Change the filter three times, open an item and press Back twice. Does the first Back return to the list and the second leave it?
