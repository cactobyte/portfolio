import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Boris",
};

export default function About() {
  return (
    <section id="about">
      <h1 className="page-heading">About</h1>

      <div className="about-block">
        <p className="about-text">
          I&apos;m a graduate software developer currently based in Hong Kong, though
          sometimes I&apos;m back in the UK. I studied Computer Science at the
          University of Exeter and graduated with First Class Honours. These days
          I&apos;m building full-stack products like OneInbox, and spending a lot of my
          spare time experimenting with AI-assisted and multi-agent coding
          workflows, like OpenClaw and Claude Code, to see how far they can push
          the way software gets built.
        </p>
      </div>

      <div className="about-block">
        <div className="about-label">education</div>
        <div className="about-row">
          <div className="about-row-main">
            <span className="about-row-title">BSc Computer Science — First Class Honours</span>
            <span className="about-row-sub">University of Exeter</span>
          </div>
          <span className="about-row-meta">2023–2026</span>
        </div>
      </div>

      <div className="about-block">
        <div className="about-label">stack</div>

        <div className="stack-group">
          <div className="stack-group-label">languages</div>
          <ul className="about-list">
            <li>Python</li>
            <li>JavaScript</li>
            <li>TypeScript</li>
            <li>C#</li>
            <li>Java</li>
            <li>C++</li>
          </ul>
        </div>

        <div className="stack-group">
          <div className="stack-group-label">frameworks &amp; tools</div>
          <ul className="about-list">
            <li>React</li>
            <li>Node.js</li>
            <li>Flask</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
