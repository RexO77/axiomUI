# Return people to the result they opened

- ID: sys-15
- Category: System & logic
- Tags: Navigation, States
- URL: https://axiomui.nischal.fyi/rules/sys-15

Back should return to the same scroll position with the item in view. Keep the search, filters, sort and page in the URL so a refresh or shared link restores the same results.

- Do: Back → Overdue · sorted by due date · row 37
- Don’t: Back → All invoices · top of the list

## Why it works

A clerk opens Northwind’s invoice at row 37 of the overdue list. Back should return to that row with the due-date sort intact so they can check row 38 next. Baymard observed shoppers having to find a product again when Back returned them to the top.

- [Baymard Institute · Return users to the same place in the list](https://baymard.com/research-articles/return-same-place)
- [Baymard Institute · Back button expectations](https://baymard.com/research-articles/back-button-expectations)
- [Next.js · Adding search and pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)
- [WHATWG HTML · The History interface](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface)
- [MDN · History.scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)
- [web.dev · Back/forward cache](https://web.dev/articles/bfcache)

## What breaks

Back returns to row 1 of All invoices, sorted by newest. The clerk must restore the filter and sort, then find their place again. If the URL also omits those settings, a colleague opening the link sees a different list.

## How to apply it

1. Keep shareable view state, such as the query, filters, sort and page, in the URL (for example `?status=overdue&sort=due`), and render the list from it. Update it with `history.replaceState` or the router’s replace so changing a filter does not stack a Back step per click.
2. Keep scroll position and expanded rows out of the URL. Let the browser restore scroll (`history.scrollRestoration` stays `auto`), or save the position with the history entry and restore it once the rows have rendered. Keep the list data cached so Back does not refetch and render an empty list first.
3. To find violations, search for filter, sort and search state held only in component state, such as `useState` for a filter with no matching `useSearchParams` or `URLSearchParams`, and for `history.scrollRestoration = "manual"` or a `window.scrollTo(0, 0)` that runs on every route change.

## Before you ship

1. Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?
2. Open the filtered list’s URL in a new tab. Do the search, filters, sort and page match?
3. Start on another page, open the list, change the filter three times and open an item. Does Back return to the filtered list, then to the starting page?
