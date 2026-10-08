import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/app/icon-arrow";
import { site, type Project } from "@/src/config/site";
import { ProjectStatus } from "./project-status";

/** Type tiles cycle through the theme colours so neighbouring cards differ. */
const TINTS = ["--accent", "--warm", "--lamp", "--screen"];

/**
 * Every project as a compact card in one grid; the 3D monitor shows the same data.
 * A card with a link is clickable as a whole (the link stretches over it).
 */
export function ProjectList() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {site.projects.map((project, i) => {
        const { link } = project;
        const linkClass = "project-link after:absolute after:inset-0 after:rounded-2xl";
        const linkContent = (
          <>
            {link?.label}
            <span className="sr-only">: {project.name}</span> <ArrowIcon />
          </>
        );
        return (
          <li
            key={project.name}
            style={{ "--i": i + 1 } as CSSProperties}
            className={`rise group relative flex flex-col overflow-hidden rounded-2xl bg-surface ${
              link ? "card-lift" : ""
            }`}
          >
            <Thumbnail project={project} tint={TINTS[i % TINTS.length]} />
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl leading-tight font-semibold tracking-tight">{project.name}</h2>
                <ProjectStatus project={project} className="shrink-0 text-sm" />
              </div>
              <p className="line-clamp-3 text-base text-muted">{project.description}</p>
              {/* Above the stretched link, so the tags keep their own hover. */}
              <ul className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-1" aria-label="Built with">
                {project.tags.map((tag) => (
                  <li key={tag} className="chip rounded-full bg-bg px-2.5 py-0.5 text-sm">
                    {tag}
                  </li>
                ))}
              </ul>
              {link &&
                (link.external ? (
                  <a href={link.href} target="_blank" rel="noopener" className={linkClass}>
                    {linkContent}
                  </a>
                ) : (
                  <Link href={link.href} className={linkClass}>
                    {linkContent}
                  </Link>
                ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Thumbnail({ project, tint }: { project: Project; tint: string }) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      style={{ background: `color-mix(in oklab, var(${tint}) 38%, var(--bg))` }}
    >
      {project.image ? (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="card-media object-cover object-top"
        />
      ) : (
        // The first word, set big and cropped by the tile: a name plate, not a stand-in picture.
        <span
          aria-hidden="true"
          className="card-media absolute bottom-[-0.2em] left-4 font-display text-[5.5rem] leading-none font-semibold tracking-tight whitespace-nowrap text-ink/85"
        >
          {project.name.split(" ")[0]}
        </span>
      )}
    </div>
  );
}
