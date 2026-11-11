import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/app/icon-arrow";
import { site, type Project } from "@/src/config/site";
import { ProjectStatus } from "./project-status";

/** Tints for logo tiles and text-only cards, cycled across just those cards so no two match. */
const TINTS = ["--accent", "--warm", "--lamp", "--screen"];
const tinted = site.projects.filter((project) => !project.image || project.image.fit === "contain");
const tint = (project: Project) =>
  `color-mix(in oklab, var(${TINTS[tinted.indexOf(project) % TINTS.length]}) 34%, var(--bg))`;

/** Column count per breakpoint; only the matching layout is displayed. */
const LAYOUTS = [
  [1, "flex sm:hidden"],
  [2, "hidden sm:flex lg:hidden"],
  [3, "hidden lg:flex"],
] as const;

/**
 * Every project as a card in a loose masonry: pictures at their own shapes,
 * text-only cards on a tint, so heights vary. The 3D monitor shows the same data.
 * Cards are dealt into columns in config order, so the order reads left to right,
 * then down. A card with a link is clickable as a whole (the link stretches over it).
 */
export function ProjectList() {
  // ponytail: one copy per breakpoint (the hidden ones are display:none, so out of the
  // a11y tree and their lazy images never load); swap for CSS masonry once browsers ship it.
  return LAYOUTS.map(([columns, display]) => (
    <div key={columns} className={`${display} items-start gap-5`}>
      {Array.from({ length: columns }, (_, column) => (
        <ul key={column} className="flex min-w-0 flex-1 flex-col gap-5">
          {site.projects.map(
            (project, i) => i % columns === column && <Card key={project.name} project={project} i={i} />,
          )}
        </ul>
      ))}
    </div>
  ));
}

function Card({ project, i }: { project: Project; i: number }) {
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
      style={{ "--i": i + 1, background: image ? undefined : tint(project) } as CSSProperties}
      className="rise card-lift group relative flex flex-col overflow-hidden rounded-2xl bg-surface"
    >
      {image && <Picture project={project} background={tint(project)} />}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className={`font-display leading-tight font-semibold tracking-tight ${image ? "text-xl" : "text-2xl"}`}>
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
