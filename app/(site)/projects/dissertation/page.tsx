import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/app/icon-arrow";

export const metadata: Metadata = {
  title: "LLM-Driven RPG Game",
  description:
    "My dissertation: a 2D RPG in Unity where LLM-driven NPCs turn plain-English conversation into real quests, enemies and rewards.",
};

const at = (i: number) => ({ "--i": i }) as CSSProperties;

/** The report's shortened example of a quest reply (section 5.4). */
const EXAMPLE = `{
  "dialogue": "Please help me deal with the rats in my barn.",
  "questTriggered": true,
  "questType": "combat",
  "questEnemy": {
    "name": "Rat",
    "difficulty": "easy",
    "quantity": 3
  },
  "rewardItemId": "bread",
  "rewardName": "Farmer Bob's Bread",
  "rewardDialogue": "You've done well. Take this loaf for your trouble."
}`;

/** Table 2 of the report: 20 prompts per set, pass/fail per criterion. */
const RESULTS = [
  { set: "Normal chat", json: "20/20", structure: "20/20", character: "20/20", quest: "–" },
  { set: "Asking for work", json: "20/20", structure: "20/20", character: "20/20", quest: "20/20" },
  { set: "Off-topic questions", json: "20/20", structure: "20/20", character: "20/20", quest: "–" },
  { set: "Jailbreak attempts", json: "20/20", structure: "20/20", character: "17/20", quest: "–" },
];

const QUOTES = [
  { prompt: "Asking the grumpy guard what’s going on in the village", reply: "Quiet. Too quiet. Somethin’s brewing." },
  { prompt: "Asking about Seoul", reply: "Seoul? What in the blazes is that?" },
  { prompt: "Asking a character to explain its system prompt", reply: "Prompt? Bah. Just do what you’re told." },
];

const h2 = "rise mt-12 font-display text-2xl font-semibold tracking-tight";

export default function Dissertation() {
  return (
    <article id="dissertation" className="mx-auto w-full max-w-4xl px-5 pt-32 pb-16 sm:px-10 sm:pt-40">
      <h1 className="rise font-display text-[clamp(2.5rem,6.5vw,4.5rem)] leading-none font-semibold tracking-tight">
        LLM-Driven RPG Game
      </h1>
      <p className="rise mt-4 text-muted" style={at(1)}>
        Dissertation, University of Exeter. First Class.
        <br />
        <cite className="not-italic">LLM-Driven Game Design: Development and Evaluation of an AI Native RPG Game</cite>
      </p>

      <div className="flex max-w-[65ch] flex-col gap-5">
        <p className="rise mt-10" style={at(2)}>
          Research into integrating large language models into core game systems, beyond dialogue generation. It
          looks at how free-form natural language can be translated into structured, executable game logic through a
          constrained generation pipeline: layered prompt construction, schema-constrained JSON output and
          deterministic execution, so a probabilistic model can drive quest generation without ever controlling game
          state directly. The pipeline was evaluated on output validity, schema conformance, intent recognition and
          persona consistency under normal, off-topic and adversarial (jailbreak) inputs.
        </p>

        <h2 className={h2} style={at(3)}>
          The research gap
        </h2>
        <p className="rise" style={at(3)}>
          Scripted NPCs choose from fixed dialogue trees. LLM-driven ones interpret free-form input and generate
          replies in context, but that flexibility comes with the model&apos;s failure modes: hallucination,
          inconsistent outputs across turns, a limited context window, and players deliberately trying to jailbreak
          it. Existing AI native games tend to sit at one of two ends. AI Dungeon and 1001 Nights use the model for
          narrative co-creation. Latent Space translates natural language into a constrained domain-specific language
          that drives mechanics, with no storytelling. This project asks whether one model can do both: act as a
          narrative agent and as a functional part of the core gameplay loop.
        </p>

        <h2 className={h2} style={at(4)}>
          How it works
        </h2>
        <p className="rise" style={at(4)}>
          The game is built in Unity. When you talk to a character, your message goes to Gemini 2.5 Flash along with
          that character&apos;s role and personality, the recent conversation and a set of rules. The model must reply
          with JSON only, never free text. A quest reply looks like this (shortened):
        </p>
      </div>

      {/* Sized in the body text's ch so the box lines up with the paragraphs; long lines wrap. */}
      <div className="rise my-6 max-w-[65ch]" style={at(5)}>
        <pre className="rounded-2xl bg-surface p-5 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
          <code>{EXAMPLE}</code>
        </pre>
      </div>

      <div className="flex max-w-[65ch] flex-col gap-5">
        <p className="rise" style={at(5)}>
          Unity reads that reply. The dialogue goes on screen, and if a quest was triggered, a quest manager spawns
          the enemies to fight or the items to find. Rewards come from a fixed list of real in-game items, and the
          model only gets to name them, which is how a plain loaf becomes Farmer Bob&apos;s Bread. You finish the job,
          go back to the same character and collect your reward.
        </p>
        <p className="rise" style={at(6)}>
          The rule underneath all of it: the model never touches game state. It suggests what should happen, and
          Unity&apos;s own systems decide and do it. Only one character gives quests at a time, and the role moves on
          after each quest so quests never overlap. Everyone else still talks in character.
        </p>

        <h2 className={h2} style={at(7)}>
          Testing it
        </h2>
        <p className="rise" style={at(7)}>
          I tested the characters with 80 prompts in four sets of 20: normal chat, asking for work, off-topic
          questions, and jailbreak attempts trying to make them break character or the JSON format.
        </p>
      </div>

      <div className="rise my-6 max-w-[65ch] overflow-x-auto" style={at(8)}>
        <table className="w-full border-collapse text-left text-sm tabular-nums sm:text-base">
          <thead className="text-xs text-muted sm:text-sm">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 align-bottom font-medium sm:pr-4">Prompts (20 each)</th>
              <th className="py-2 pr-3 align-bottom font-medium sm:pr-4">Valid JSON</th>
              <th className="py-2 pr-3 align-bottom font-medium sm:pr-4">Right fields</th>
              <th className="py-2 pr-3 align-bottom font-medium sm:pr-4">In character</th>
              <th className="py-2 align-bottom font-medium">Quest started</th>
            </tr>
          </thead>
          <tbody>
            {RESULTS.map((row) => (
              <tr key={row.set} className="border-b border-line">
                <th scope="row" className="py-2.5 pr-3 font-medium sm:pr-4">
                  {row.set}
                </th>
                <td className="py-2.5 pr-3 sm:pr-4">{row.json}</td>
                <td className="py-2.5 pr-3 sm:pr-4">{row.structure}</td>
                <td className="py-2.5 pr-3 sm:pr-4">{row.character}</td>
                <td className="py-2.5">{row.quest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex max-w-[65ch] flex-col gap-5">
        <p className="rise" style={at(9)}>
          The format never broke, even under jailbreak attempts, and every request for work started a quest. Staying
          in character was the weak spot: 3 of the 20 jailbreak replies kept the right format but read awkwardly. A
          few replies I liked:
        </p>
        <ul className="rise flex flex-col gap-3" style={at(9)}>
          {QUOTES.map(({ prompt, reply }) => (
            <li key={reply} className="rounded-2xl bg-surface px-5 py-4">
              <span className="block text-sm text-muted">{prompt}</span>
              <span className="font-display text-lg font-semibold tracking-tight">“{reply}”</span>
            </li>
          ))}
        </ul>

        <h2 className={h2} style={at(10)}>
          Limits and what&apos;s next
        </h2>
        <p className="rise" style={at(10)}>
          The tests were small and each prompt ran in a fresh conversation, so long play sessions, where models start
          to lose context, weren&apos;t covered, and there was no baseline to compare against. Characters only
          remember the recent conversation. Longer-term memory is the obvious next step, along with more quest types
          and a bigger world.
        </p>
      </div>

      <ul className="rise mt-10 flex flex-wrap gap-2" style={at(11)} aria-label="Built with">
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">Unity</li>
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">C#</li>
        <li className="chip rounded-full bg-surface px-3 py-1 text-sm">Gemini API</li>
      </ul>

      <div className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={at(12)}>
        <a href="/docs/boris_final_report_clean.pdf" target="_blank" rel="noopener" className="project-link">
          Read the full report (PDF) <ArrowIcon />
        </a>
        <Link href="/projects" className="project-link">
          <ArrowIcon direction="left" /> Back to projects
        </Link>
      </div>
    </article>
  );
}
