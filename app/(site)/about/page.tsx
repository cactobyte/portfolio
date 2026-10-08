import type { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "About",
};

const label = "rise font-display text-lg font-semibold text-muted md:pt-1";
const pill = "chip rise rounded-full bg-surface px-4 py-1.5 font-medium";

const stack = {
  languages: [
    ["Python", "JavaScript", "TypeScript"],
    ["C#", "Java", "C++"],
  ],
  tools: ["React", "Node.js", "Flask"],
};
/** Stagger step for entrance animations (see .rise). */
const at = (i: number) => ({ "--i": i }) as CSSProperties;
/** The stack tags pop in one after another once their section has arrived. */
const pillAt = (n: number) => at(4 + n * 0.5);

export default function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-4xl px-5 pt-32 pb-16 sm:px-10 sm:pt-40">
      <h1 className="rise mb-10 font-display text-[clamp(3rem,8vw,5.5rem)] leading-none font-semibold tracking-tight">
        About
      </h1>

      <div className="grid gap-x-10 gap-y-14 md:grid-cols-[10rem_minmax(0,1fr)]">
        <p className="rise max-w-[36em] text-[clamp(1.25rem,2.2vw,1.5rem)] leading-normal md:col-start-2" style={at(1)}>
          I&apos;m a graduate software developer currently based in Hong Kong, though
          sometimes I&apos;m back in the UK. I studied Computer Science at the
          University of Exeter and graduated with First Class Honours. These days
          I&apos;m building full-stack products like OneInbox, and spending a lot of my
          spare time experimenting with AI-assisted and multi-agent coding
          workflows, like OpenClaw and Claude Code, to see how far they can push
          the way software gets built.
        </p>

        <h2 className={label} style={at(2)}>
          education
        </h2>
        <div style={at(2)} className="rise flex flex-wrap justify-between gap-x-6 gap-y-1 border-y border-line py-5">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">BSc Computer Science — First Class Honours</span>
            <span className="text-muted">University of Exeter</span>
          </div>
          <span className="text-muted tabular-nums">2023–2026</span>
        </div>

        <h2 className={label} style={at(3)}>
          stack
        </h2>
        <div className="rise flex flex-col gap-6" style={at(3)}>
          <div>
            <h3 className="mb-3 text-base text-muted">languages</h3>
            {stack.languages.map((row, r) => (
              <ul key={r} className="mt-2 flex flex-wrap gap-2 first-of-type:mt-0">
                {row.map((name, j) => (
                  <li key={name} className={pill} style={pillAt(r * 3 + j)}>
                    {name}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div>
            <h3 className="mb-3 text-base text-muted">frameworks &amp; tools</h3>
            <ul className="flex flex-wrap gap-2">
              {stack.tools.map((name, j) => (
                <li key={name} className={pill} style={pillAt(6 + j)}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
