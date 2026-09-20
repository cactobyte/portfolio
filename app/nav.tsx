"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname();
  const activeHref = links.find((link) => isActive(pathname, link.href))?.href;
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const activeEl = activeHref ? linkRefs.current[activeHref] : null;
      const listEl = listRef.current;
      if (!activeEl || !listEl) {
        setIndicator(null);
        return;
      }
      const listRect = listEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicator({ left: activeRect.left - listRect.left, width: activeRect.width });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeHref]);

  return (
    <nav>
      <Link href="/" className="wordmark">
        boris<span className="cursor">_</span>
      </Link>
      <ul className="nav-links" ref={listRef}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              ref={(el) => {
                linkRefs.current[href] = el;
              }}
              className={href === activeHref ? "active" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
        {indicator && (
          <span
            className="nav-indicator"
            style={{ transform: `translateX(${indicator.left}px) scaleX(${indicator.width})` }}
            aria-hidden="true"
          />
        )}
      </ul>
    </nav>
  );
}
