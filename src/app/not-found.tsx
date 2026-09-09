import type { Metadata } from "next";
import Link from "next/link";

import { AxiomLogo } from "@/components/ui/axiom-logo";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page isn't in the catalog. Browse all rules or read the empty-state rule it follows.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <main className="glass panel-shadow w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <AxiomLogo className="h-5 w-5" />
        </div>

        <p className="mt-5 text-xs font-medium tracking-wide text-neutral-400 dark:text-neutral-500">
          404
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          This page doesn&rsquo;t exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          We couldn&rsquo;t find that page — the link may be outdated, or the
          rule may have moved. The catalog is intact.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="pressable inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:w-auto dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-500"
          >
            Browse all rules
          </Link>
          <Link
            href="/rules/sys-2"
            className="pressable inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-500"
          >
            Read the empty-state rule
          </Link>
        </div>

        <p className="mt-6 text-xs leading-5 text-neutral-400 dark:text-neutral-500">
          Even a 404 is an empty state — rule sys-2 says it should explain
          itself and offer a next step.
        </p>
      </main>
    </div>
  );
}
