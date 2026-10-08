import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "./icon-arrow";
import SiteShell from "./site-shell";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <SiteShell>
      <section id="not-found" className="mx-auto w-full max-w-4xl px-5 pt-32 pb-16 sm:px-10 sm:pt-40">
        <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-none font-semibold tracking-tight">404</h1>
        <p className="mt-4 mb-10 max-w-[50ch] text-muted">
          This page doesn&apos;t exist. It may have moved, or the link is out of date.
        </p>
        <Link href="/" className="project-link">
          <ArrowIcon direction="left" /> Back to home
        </Link>
      </section>
    </SiteShell>
  );
}
