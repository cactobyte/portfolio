import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowIcon } from "@/app/icon-arrow";

// Unlisted: not in the nav, and kept out of search results. Shared by link only.
export const metadata: Metadata = {
  title: "Pricing",
  description: "Bespoke website pricing, benchmarked against GoDaddy's 2026 guide to website costs in Hong Kong.",
  robots: { index: false, follow: false },
};

const GUIDE = "https://www.godaddy.com/resources/asia/skills/how-much-does-a-website-in-hong-kong-cost-in-2025";

/** Figures quoted from the guide (published 18 Dec 2025). */
const MARKET = [
  ["Small business website, by a web designer", "HKD 23,520–39,200"],
  ["Web hosting", "HKD 220–930 / month"],
  ["Copywriting", "HKD 3,800–12,000 / page"],
] as const;

const INCLUDED = [
  ["5 pages", "Home, about, services, gallery, contact"],
  ["Mobile-friendly", "Responsive, tested on iOS and Android"],
  ["Quick delivery", "Usually live in two to four weeks"],
  ["Revisions until you're happy", "No caps on rounds"],
  ["Modern UI", "Bespoke design, never a template"],
  ["Motion design", "Smooth, accessible animation"],
] as const;

const ADD_ONS = [
  ["Extra language", "e.g. English, 简体 and 繁體 = HKD 1,500", "HKD 500 each"],
  ["Extra page", "Beyond the first five", "HKD 600 each"],
  ["Blog", "Posts, RSS feed and social cards", "HKD 1,500"],
  [
    "3D and WebGL",
    <>
      Interactive Three.js scenes, like{" "}
      <a
        href="https://www.bennettmusic.net/"
        target="_blank"
        rel="noopener"
        className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-2"
      >
        this
      </a>
    </>,
    "from HKD 3,500",
  ],
  ["Domain transfer", "Move the domain you already own to your new site", "HKD 500"],
  ["Domain setup", "Register a new domain, DNS and HTTPS configured", "HKD 300"],
] as const;

const SERVICES = [
  ["Custom web apps", "Client portals, dashboards, booking systems", "from HKD 15,000"],
  ["AI integrations", "Chatbots on your own content, auto-replies", "from HKD 3,000"],
  ["Website refresh", "Modernise your existing site: new UI, motion, speed", "from HKD 4,500"],
  ["Landing page", "One page for a launch, event or album drop", "from HKD 3,000"],
  ["Speed and SEO audit", "Lighthouse and Core Web Vitals report, plus fixes", "from HKD 1,500"],
  ["Hosting and care", "Hosting, SSL, updates, edits. Billed yearly", "HKD 200 / month"],
] as const;

const at = (i: number) => ({ "--i": i }) as CSSProperties;
const price = "shrink-0 font-display font-semibold whitespace-nowrap tabular-nums";

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto flex w-full max-w-6xl flex-col gap-3.5 px-5 pt-20 pb-8 sm:px-10">
      <div className="rise flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h1 className="font-display text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-semibold tracking-tight">
          Website pricing
        </h1>
        <p className="text-muted">Bespoke websites, designed and built by hand. Prices in HKD.</p>
      </div>

      {/* The benchmark first: the market rates, then my price against them. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rise flex flex-col gap-3 rounded-2xl border border-line p-5" style={at(1)}>
          <p className="text-sm">
            Benchmarked against{" "}
            <a
              href={GUIDE}
              target="_blank"
              rel="noopener"
              className="font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:decoration-[3px]"
            >
              GoDaddy&apos;s 2026 guide to website costs in Hong Kong ↗
            </a>
            . Standard market rates:
          </p>
          <dl className="flex flex-col">
            {MARKET.map(([item, range]) => (
              <div
                key={item}
                className="flex flex-col border-b border-line py-1 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <dt className="text-muted">{item}</dt>
                <dd className={price}>{range}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rise flex flex-col justify-center rounded-2xl bg-ink p-6 text-bg" style={at(2)}>
          <p className="text-sm opacity-70">My base price, one-off</p>
          <p className="font-display text-[clamp(2.75rem,5vw,3.75rem)] leading-none font-semibold tracking-tight tabular-nums">
            HKD 6,000
          </p>
          <p className="mt-2 text-sm opacity-70">HKD 5,000 for referrals and friends</p>
        </div>
      </div>

      <ul
        className="rise grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        style={at(3)}
        aria-label="Included in the base price"
      >
        {INCLUDED.map(([name, detail]) => (
          <li key={name} className="chip rounded-xl bg-surface px-4 py-3">
            <span className="block leading-snug font-semibold">{name}</span>
            <span className="block text-sm text-muted">{detail}</span>
          </li>
        ))}
      </ul>

      <PriceList id="add-ons" title="Other add-ons" items={ADD_ONS} i={4} />
      <PriceList id="services" title="Other services" items={SERVICES} i={5} />

      <div className="rise flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 text-sm" style={at(6)}>
        <p className="max-w-[64em] text-muted">
          <span className="font-semibold text-ink">Need something else?</span> Online shops, bookings, payments, content
          management, SEO, analytics, business email and more are all available. Ask for a quote. Fixed quote before
          work starts. Domain billed at cost.
        </p>
        <Link href="/#contact" className="project-link">
          Get in touch <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function PriceList({
  id,
  title,
  items,
  i,
}: {
  id: string;
  title: string;
  items: readonly (readonly [string, ReactNode, string])[];
  i: number;
}) {
  return (
    <div className="rise flex flex-col gap-1" style={at(i)}>
      <h2 id={id} className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="grid gap-x-8 border-t border-line sm:grid-cols-2 lg:grid-cols-3" aria-labelledby={id}>
        {items.map(([name, detail, cost]) => (
          <li key={name} className="border-b border-line py-1.5">
            <span className="flex items-baseline justify-between gap-4">
              <span className="font-semibold">{name}</span>
              <span className={price}>{cost}</span>
            </span>
            <span className="block truncate text-sm text-muted">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
