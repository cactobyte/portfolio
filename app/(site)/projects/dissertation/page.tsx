import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/app/icon-arrow";

export const metadata: Metadata = {
  title: "LLM-Driven RPG Game",
};

export default function Dissertation() {
  return (
    <section id="dissertation" className="mx-auto w-full max-w-4xl px-5 pt-32 pb-16 sm:px-10 sm:pt-40">
      <h1 className="rise font-display text-[clamp(2.5rem,6.5vw,4.5rem)] leading-none font-semibold tracking-tight">
        LLM-Driven RPG Game
      </h1>
      <p className="rise mt-4 mb-12 text-muted" style={{ "--i": 1 } as CSSProperties}>Dissertation project — University of Exeter, First Class.</p>

      <div className="rise flex max-w-[65ch] flex-col gap-5" style={{ "--i": 2 } as CSSProperties}>
        <p>
          This project investigates how large language models can be integrated into
          game systems beyond dialogue generation alone. Existing AI native games
          often use LLMs for storytelling, conversational play, or isolated
          language-driven mechanics, leaving a gap between narrative interaction and
          structured gameplay execution. To address this, the project developed a
          small 2D AI native role-playing game prototype in Unity, where players
          interact with LLM-driven non-player characters using natural language. The
          system uses Gemini through an API, with prompt constraints and structured
          JSON outputs used to translate player input into dialogue, quests,
          objectives, and rewards. Unity then parses these outputs and executes them
          through deterministic gameplay systems, allowing the LLM to influence the
          main quest loop without directly controlling game state.
        </p>
        <p>
          The full write-up — architecture, the memory system, and how the quest
          generation pipeline works — is still in progress. Check back soon.
        </p>
      </div>

      <ul className="rise mt-10 flex flex-wrap gap-2" style={{ "--i": 3 } as CSSProperties} aria-label="Built with">
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">Unity</li>
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">C#</li>
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">Gemini API</li>
      </ul>

      <p className="rise mt-10" style={{ "--i": 4 } as CSSProperties}>
        <Link href="/projects" className="project-link">
          <ArrowIcon direction="left" /> Back to projects
        </Link>
      </p>
    </section>
  );
}
