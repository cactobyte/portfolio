import Link from "next/link";
import { Hero } from "@/src/components/hero";
import { ProjectsNudge } from "@/src/components/projects-nudge";

export default function Home() {
  return (
    <>
      <Hero />

      <section aria-label="About my work" className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-10 sm:py-32">
        <p className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] font-medium tracking-tight">
          I build full-stack products and AI tools.
        </p>
        <p className="mt-4 max-w-[46ch] text-[clamp(1.125rem,1.8vw,1.3rem)] text-muted">
          I also take on freelance work, so{" "}
          <Link href="/#contact" className="text-ink underline decoration-accent decoration-2 underline-offset-4 hover:decoration-[3px]">
            get in touch
          </Link>{" "}
          :)
        </p>

        {/* Fits its buttons, so the nudge can point at the last one; room below for it on tablets. */}
        <div className="relative mt-8 w-fit sm:mb-36 lg:mb-0">
          <div className="flex flex-col items-start gap-3 sm:flex-row">
            <a
              href="/docs/boris-cheung-cv.pdf"
              download
              className="press btn-lift group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-bg"
            >
              Download CV
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path className="btn-dip" d="M8 2.5v7M4.75 6.5 8 9.75l3.25-3.25" />
                <path d="M3 13h10" />
              </svg>
            </a>
            <Link
              href="/projects"
              className="press btn-lift inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-semibold hover:border-ink"
            >
              View projects
              <svg viewBox="0 0 16 16" aria-hidden="true" className="btn-nudge size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8h10M8.75 4.25 12.5 8l-3.75 3.75" />
              </svg>
            </Link>
          </div>
          <ProjectsNudge />
        </div>
      </section>
    </>
  );
}
