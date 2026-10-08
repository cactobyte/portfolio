import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/app/icon-arrow";
import { site, type Project } from "@/src/config/site";
import { ProjectStatus } from "./project-status";

/** Tints for logo tiles and text-only cards; they cycle so neighbours differ. */
const TINTS = ["--accent", "--warm", "--lamp", "--screen"];
const tint = (i: number) => `color-mix(in oklab, var(${TINTS[i % TINTS.length]}) 34%, var(--bg))`;

/**
 * Every project as a card in a loose masonry: pictures at their own shapes,
 * text-only cards on a tint, so heights vary. The 3D monitor shows the same data.
 * A card with a link is clickable as a whole (the link stretches over it).
 */
export function ProjectList() {
  return (
    <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {site.projects.map((project, i) => {
        const { link, image } = project;
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
            style={{ "--i": i + 1, background: image ? undefined : tint(i) } as CSSProperties}
            className="rise card-lift group relative mb-5 flex break-inside-avoid flex-col overflow-hidden rounded-2xl bg-surface"
          >
            {image && <Picture project={project} background={tint(i)} />}
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  className={`font-display leading-tight font-semibold tracking-tight ${image ? "text-xl" : "text-2xl"}`}
                >
                  {project.name}
                </h2>
                <ProjectStatus project={project} className="shrink-0 text-sm" />
              </div>
              <p className="text-base text-muted">{project.description}</p>
              {/* Above the stretched link, so the tags keep their own hover. */}
              <ul className="relative z-10 flex flex-wrap gap-1.5 pt-1" aria-label="Built with">
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

function Picture({ project, background }: { project: Project; background: string }) {
  const image = project.image!;
  const sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";
  if (image.fit === "contain") {
    return (
      <div className="grid aspect-[4/3] place-items-center overflow-hidden" style={{ background }}>
        <Image src={image.src} alt={image.alt} sizes="160px" className="card-media h-auto w-2/5" />
      </div>
    );
  }
  return (
    <div className="overflow-hidden">
      <Image src={image.src} alt={image.alt} sizes={sizes} className="card-media h-auto w-full" />
    </div>
  );
}
