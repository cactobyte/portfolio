import type { Project } from "@/src/config/site";

/** "● shipped" — the dot pulses for work in progress. */
export function ProjectStatus({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-muted ${className}`}>
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${project.live ? "bg-accent motion-safe:animate-pulse" : "bg-current"}`}
      />
      {project.status}
    </span>
  );
}
