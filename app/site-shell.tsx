import Link from "next/link";
import { NavBar } from "@/src/components/nav-bar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-[200%] rounded-full bg-ink px-4 py-2 font-semibold text-bg focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <NavBar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-muted">
        {/* Desktop has this in the nav. */}
        <Link href="/#contact" className="py-3 font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 sm:hidden">
          Contact me
        </Link>
        © 2026 Boris — cactobyte.tech
      </footer>
    </>
  );
}
