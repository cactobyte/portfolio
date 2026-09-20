import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "./icon-arrow";

export const metadata: Metadata = {
  title: "404 — Boris",
};

export default function NotFound() {
  return (
    <section id="not-found">
      <h1 className="page-heading">404</h1>
      <p className="page-sub">This page doesn&apos;t exist. It may have moved, or the link is out of date.</p>
      <Link href="/" className="project-link">
        <ArrowIcon direction="left" /> Back to home
      </Link>
    </section>
  );
}
