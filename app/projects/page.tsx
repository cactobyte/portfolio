import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Boris",
};

export default function Projects() {
  return (
    <section id="projects">
      <h1 className="page-heading">Projects</h1>

      <div className="project">
        <div className="project-top">
          <span className="project-name">OneInbox</span>
          <span className="project-status">in progress</span>
        </div>
        <p className="project-desc">Omnichannel customer messaging platform for SMEs.</p>
        <div className="project-tags">
          <span className="tag">Full-stack</span>
        </div>
        <a
          href="https://github.com/cactobyte/one-inbox"
          target="_blank"
          rel="noopener"
          className="project-link"
        >
          View project →
        </a>
      </div>

      <div className="project">
        <div className="project-top">
          <span className="project-name">LLM-Driven RPG Game</span>
          <span className="project-status">dissertation — first</span>
        </div>
        <p className="project-desc">
          Unity RPG where NPCs are powered by an LLM: they remember past
          conversations and generate dynamic quests instead of following a fixed list.
        </p>
        <div className="project-tags">
          <span className="tag">Unity</span>
          <span className="tag">C#</span>
          <span className="tag">Gemini API</span>
        </div>
        <a href="/projects/dissertation" className="project-link">
          Read more →
        </a>
      </div>

      <div className="project">
        <div className="project-top">
          <span className="project-name">FanClub</span>
          <span className="project-status">shipped</span>
        </div>
        <p className="project-desc">
          MVP web app for a friend&apos;s startup, built and used to pitch investors.
        </p>
        <div className="project-tags">
          <span className="tag">React</span>
          <span className="tag">Freelance</span>
        </div>
        <a
          href="https://github.com/cactobyte/fanclub"
          target="_blank"
          rel="noopener"
          className="project-link"
        >
          View project →
        </a>
      </div>
    </section>
  );
}
