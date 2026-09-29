import type { CSSProperties } from "react";
import { siteFontVariables } from "@/lib/sites/fonts";
import { studio } from "@/lib/sites/studio";
import type { Business, PrimaryAction, SiteConfig } from "@/lib/sites/types";
import { directionsUrl, telUrl, whatsappUrl } from "./links";
import OpenStatus from "./open-status";
import { SiteSection } from "./sections";
import "./site.css";

function StatusBanner({ site }: { site: SiteConfig }) {
  const { name } = site.business;
  if (site.status === "live") return null;
  if (site.status === "sample") {
    return (
      <p className="status-banner">
        Sample site. {name} is a fictional business made to show this template.
      </p>
    );
  }
  const subject = encodeURIComponent(`Website for ${name}`);
  return (
    <p className="status-banner">
      Concept design by {studio.name}, not the official website of {name}.{" "}
      <a href={`mailto:${studio.email}?subject=${subject}`}>Want this site? Email me</a>
    </p>
  );
}

interface Action {
  kind: PrimaryAction | "directions";
  label: string;
  href: string;
  external: boolean;
}

function actions(business: Business, primary: PrimaryAction): Action[] {
  const list: Action[] = [];
  if (business.phone) list.push({ kind: "call", label: "Call", href: telUrl(business.phone), external: false });
  if (business.whatsapp) {
    list.push({ kind: "whatsapp", label: "WhatsApp", href: whatsappUrl(business.whatsapp), external: true });
  }
  if (business.bookingUrl) list.push({ kind: "booking", label: "Book now", href: business.bookingUrl, external: true });
  list.push({ kind: "directions", label: "Directions", href: directionsUrl(business), external: true });
  return list.sort((a, b) => Number(b.kind === primary) - Number(a.kind === primary));
}

export default function Site({ site }: { site: SiteConfig }) {
  const { business, theme } = site;
  const { palette } = theme;
  const style = {
    "--paper": palette.paper,
    "--surface": palette.surface,
    "--ink": palette.ink,
    "--muted": palette.muted,
    "--accent": palette.accent,
    "--on-accent": palette.onAccent,
  } as CSSProperties;

  return (
    <div className={`site ${siteFontVariables}`} data-type={theme.type} style={style}>
      <StatusBanner site={site} />

      <header className="site-hero">
        <div className="sign">
          <div className="sign-body">
            <h1 className="sign-name">{business.name}</h1>
            <p className="sign-tagline">{business.tagline}</p>
          </div>
          {business.nameZh && (
            // Stacked by hand rather than with writing-mode, which breaks on fonts without vertical metrics.
            <p className="sign-zh" lang="zh-Hant" aria-label={business.nameZh}>
              {Array.from(business.nameZh).map((char, i) => (
                <span key={i} aria-hidden="true">
                  {char}
                </span>
              ))}
            </p>
          )}
        </div>
        <OpenStatus hours={business.hours} />
        <ul className="actions">
          {actions(business, site.primaryAction).map((action) => (
            <li key={action.kind}>
              <a
                href={action.href}
                className="action"
                data-primary={action.kind === site.primaryAction || undefined}
                {...(action.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {action.label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <main className="site-main">
        {site.sections.map((section) => (
          <SiteSection key={section.id} section={section} business={business} />
        ))}
      </main>

      <footer className="site-footer">
        <p className="site-footer-name">
          {business.name}
          {business.nameZh && <span lang="zh-Hant"> {business.nameZh}</span>}
        </p>
        <ul className="site-footer-links">
          {business.instagram && (
            <li>
              <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener">
                Instagram
              </a>
            </li>
          )}
          {business.facebook && (
            <li>
              <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noopener">
                Facebook
              </a>
            </li>
          )}
        </ul>
        <p className="site-footer-credit">
          Site by <a href={studio.url}>{studio.name}</a>
        </p>
      </footer>
    </div>
  );
}
