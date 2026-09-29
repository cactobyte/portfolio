"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/me", label: "Overview" },
  { href: "/me/leads", label: "Leads" },
  { href: "/me/clients", label: "Clients" },
];

export default function MeNav() {
  const pathname = usePathname();
  return (
    <nav className="me-tabs" aria-label="Dashboard">
      {tabs.map(({ href, label }) => {
        const active = href === "/me" ? pathname === "/me" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
