import type { Metadata } from "next";
import { ProjectList } from "@/src/components/project-list";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <section id="projects" className="mx-auto w-full max-w-6xl px-5 pt-32 pb-16 sm:px-10 sm:pt-40">
      <h1 className="rise mb-10 font-display text-[clamp(3rem,8vw,5.5rem)] leading-none font-semibold tracking-tight">
        Projects
      </h1>
      <ProjectList />
    </section>
  );
}
