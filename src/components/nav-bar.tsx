"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./theme";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavBar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const lampOn = theme === "night";

  // Below 360px (the smallest phones) everything tightens so the lamp still fits.
  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex items-center gap-2 bg-bg/75 px-3 py-3 backdrop-blur-md max-[359px]:gap-1 max-[359px]:px-2 sm:gap-4 sm:px-8">
      <Link href="/" className="mr-auto rounded-full px-2 py-2 font-display text-xl font-bold tracking-tight max-[359px]:px-1">
        boris
      </Link>
      <ul className="flex items-center">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav-link block px-2.5 py-2 font-medium max-[359px]:px-1.5 max-[359px]:py-2.5 max-[359px]:text-base sm:px-3 ${active ? "" : "text-muted hover:text-ink"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={lampOn}
        title={lampOn ? "Turn the desk lamp off" : "Turn the desk lamp on"}
        className="press icon-pop grid size-11 place-items-center rounded-full border border-line hover:border-ink"
      >
        <span className="sr-only">Desk lamp</span>
        <LampIcon on={lampOn} />
      </button>
      <Link
        href="/#contact"
        className="press btn-lift hidden rounded-full bg-accent px-5 py-2.5 font-semibold text-[#1E1F1C] sm:block"
      >
        Contact me
      </Link>
    </nav>
  );
}

function LampIcon({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8M12 21v-6l-4-6 3-3 5 2-2 4" />
      <path
        d="M16 8l3.5 1.5L17 13"
        className="transition-[fill] duration-300 ease-out"
        style={{ fill: on ? "var(--lamp)" : "transparent" }}
      />
    </svg>
  );
}
