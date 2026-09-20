import type { Metadata } from "next";
import { ArrowIcon } from "../../icon-arrow";

export const metadata: Metadata = {
  title: "LLM-Driven RPG Game — Boris",
};

export default function Dissertation() {
  return (
    <section id="dissertation">
      <h1 className="page-heading">LLM-Driven RPG Game</h1>
      <p className="page-sub">Dissertation project — University of Exeter, First Class.</p>

      <div className="about-block">
        <p className="about-text">
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
        <p className="about-text">
          The full write-up — architecture, the memory system, and how the quest
          generation pipeline works — is still in progress. Check back soon.
        </p>
      </div>

      <div className="project-tags">
        <span className="tag">Unity</span>
        <span className="tag">C#</span>
        <span className="tag">Gemini API</span>
      </div>

      <p style={{ marginTop: "2.4rem" }}>
        <a href="/projects" className="project-link">
          <ArrowIcon direction="left" /> Back to projects
        </a>
      </p>
    </section>
  );
}
