// design-system: strict
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AxiomLogo } from "@/components/ui/axiom-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "Page not found | Axiom UI" },
  description:
    "This page couldn't be found. Head back to the Axiom UI catalog of UI design rules.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-20 shrink-0 items-center justify-between px-6 sm:px-10">
        <Link href="/" aria-label="Axiom UI home" className="pressable inline-flex items-center gap-3 rounded-full text-sm font-medium text-ink">
          <span className="flex size-9 items-center justify-center rounded-full bg-inverse text-on-inverse">
            <AxiomLogo className="size-5" />
          </span>
          Axiom UI
        </Link>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24 pt-12 outline-none sm:px-10 lg:flex-row lg:items-center lg:gap-20"
      >
        <p aria-hidden="true" className="shrink-0 font-serif text-8xl leading-none tracking-tighter text-ink-muted sm:text-9xl lg:text-[180px]">
          404
        </p>
        <div className="mt-8 max-w-sm lg:mt-0">
          <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-base leading-7 text-pretty text-ink-secondary">
            The link may have changed, or the page may have moved. Find your
            way back in the catalog.
          </p>
          <div className="mt-8">
            <Button href="/" variant="primary" size="md">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to the catalog
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
