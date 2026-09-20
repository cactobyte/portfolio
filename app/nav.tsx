"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav>
      <Link href="/" className="wordmark">
        boris<span className="cursor">_</span>
      </Link>
      <ul className="nav-links">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={pathname === href ? "active" : undefined}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
