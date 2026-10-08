"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/src/config/site";
import { hasWebGL, LOW_POWER, REDUCED_MOTION, useMediaQuery } from "@/src/lib/media";
import posterLandscape from "@/src/assets/desk-poster-landscape.jpg";
import posterPortrait from "@/src/assets/desk-poster-portrait.jpg";
import { ProjectList } from "./project-list";
import { useTheme } from "./theme";

// three.js and friends stay out of the initial bundle.
const Scene = dynamic(() => import("./scene/scene"), { ssr: false });

/** Portrait screens; must match the camera rig's portrait framing and the .desk-poster CSS. */
const PORTRAIT_MEDIA = "(max-aspect-ratio: 11/10)";

type Support = "checking" | "webgl" | "none";

/** Load the scene anyway after this long without interaction. */
const IDLE_LOAD_DELAY_MS = 4000;

/** Once three.js has been fetched this session, returning to home loads the scene straight away. */
let sceneRequested = false;

/**
 * Home hero: a tall scroll section with the desk pinned in view. Scrolling
 * flies the camera into the monitor, where the project list is real HTML;
 * then the page carries on below.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const screenPortal = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const reduced = useMediaQuery(REDUCED_MOTION);
  const lowPower = useMediaQuery(LOW_POWER);
  const { theme } = useTheme();

  const [support, setSupport] = useState<Support>("checking");
  const [loadScene, setLoadScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [navHeight, setNavHeight] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const copiedTimer = useRef(0);

  // The mailto link still opens the mail app; copying covers devices that have none set up.
  const copyEmail = (email: string) => {
    navigator.clipboard
      ?.writeText(email)
      .then(() => {
        setCopiedEmail(email);
        window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(() => setCopiedEmail(null), 3000);
      })
      .catch(() => {});
  };

  // The poster is a render of this scene, so three.js can wait: load on the first
  // interaction, or once the page has sat idle for a few seconds.
  useEffect(() => {
    if (!hasWebGL()) {
      queueMicrotask(() => setSupport("none"));
      return;
    }
    queueMicrotask(() => setSupport("webgl"));
    if (sceneRequested) {
      queueMicrotask(() => setLoadScene(true));
      return;
    }
    const events = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    let idle = 0;
    const start = () => {
      sceneRequested = true;
      setLoadScene(true);
      cleanup();
    };
    const timer = window.setTimeout(() => {
      idle = window.requestIdleCallback?.(start, { timeout: 2000 }) ?? window.setTimeout(start, 0);
    }, IDLE_LOAD_DELAY_MS);
    const cleanup = () => {
      window.clearTimeout(timer);
      if (idle) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      events.forEach((e) => window.removeEventListener(e, start));
    };
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return cleanup;
  }, []);

  useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const observer = new ResizeObserver(() => setNavHeight(nav.offsetHeight));
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const copyOpacity = useTransform(scrollYProgress, (p) => (reduced ? (p > 0.5 ? 0 : 1) : 1 - Math.min(p / 0.22, 1)));
  // Hidden copy must not keep its links clickable or focusable.
  const copyVisibility = useTransform(copyOpacity, (o) => (o < 0.02 ? "hidden" : "visible"));

  const focusScreen = () => {
    const el = section.current;
    if (!el) return;
    const end = el.offsetTop + el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: end, behavior: reduced ? "auto" : "smooth" });
  };

  const tall = support !== "none";
  // The poster is a clay render; in the night theme the page background stands in until the scene draws.
  const showPoster = support === "none" || theme === "clay";

  return (
    <>
      <section
        ref={section}
        id="contact"
        aria-label="Introduction"
        className="relative"
        style={{ height: tall ? `${site.scene.scrollLength * 100}svh` : undefined }}
      >
        {/* Size container: the poster is positioned in container units (see .desk-poster). */}
        <div className="sticky top-0 h-svh overflow-hidden [container-type:size]">
          {showPoster && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
              <Poster />
            </div>
          )}

          {loadScene && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
              <Scene
                progress={scrollYProgress}
                active={onScreen}
                reduced={reduced}
                lowPower={lowPower}
                idleSway={lowPower}
                onFocusScreen={focusScreen}
                onReady={() => setReady(true)}
                topInset={navHeight}
                screenPortal={screenPortal}
              />
              <div ref={screenPortal} className="pointer-events-none absolute inset-0" />
            </div>
          )}

          {loadScene && !ready && (
            <p role="status" className="absolute right-5 bottom-5 rounded-full bg-bg/80 px-4 py-2 text-sm text-muted backdrop-blur">
              Setting up the desk…
            </p>
          )}

          <motion.div
            data-hero-copy
            // Without WebGL the hero is one screen tall, so scroll progress can't drive the fade.
            style={support === "none" ? undefined : { opacity: copyOpacity, visibility: copyVisibility }}
            className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-28 sm:px-10 md:top-1/2 md:max-w-[36rem] md:-translate-y-1/2 md:pt-0"
          >
            <h1 className="font-display leading-[0.95] font-semibold tracking-tight">
              <span className="rise block text-xl font-medium text-muted sm:text-2xl">Hi, I&apos;m</span>
              {/* Two lines beside the desk; one line above it on phones. Letters drop in and
                  settle one by one (and lift on hover); read as whole words. */}
              <span className="pointer-events-auto mt-1 block text-[clamp(3rem,7.5vw,6.25rem)]">
                <span className="sr-only">Boris Cheung</span>
                <Letters word="Boris" from={0} /> <Letters word="Cheung" from={5} />
              </span>
            </h1>
            <p className="rise mt-4 text-lg sm:text-xl" style={at(5)}>
              Graduate Software Engineer
            </p>
            {/* Fits its icons, so the copied note can sit just after them. */}
            <div className="relative mt-6 w-fit">
              <ul className="pointer-events-auto flex flex-wrap gap-2" aria-label="Find me on">
                {site.socials.map(({ name, href, icon }, i) => (
                  <li key={name} className="rise" style={at(6 + i * 0.5)}>
                    <a
                      href={href}
                      {...(href.startsWith("mailto:")
                        ? { onClick: () => copyEmail(href.slice("mailto:".length)) }
                        : { target: "_blank", rel: "noopener" })}
                      aria-label={name}
                      title={href.startsWith("mailto:") ? href.slice("mailto:".length) : name}
                      className="press icon-pop grid size-11 place-items-center rounded-full border border-line bg-bg/70 backdrop-blur-sm hover:border-ink hover:bg-surface"
                    >
                      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                        <path d={icon} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
              <p
                role="status"
                className={`absolute top-1/2 left-full ml-3 -translate-y-1/2 text-sm whitespace-nowrap text-muted transition-opacity duration-300 ${copiedEmail ? "opacity-100" : "opacity-0"}`}
              >
                {copiedEmail && "Email copied"}
              </p>
            </div>
            {tall && (
              <p className="rise mt-3 text-sm text-muted md:mt-10" style={at(9)}>
                <span className="md:hidden">Scroll down</span>
                <span className="hidden md:inline">Scroll to see what&apos;s on the screen</span>
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {support === "none" && (
        <section aria-labelledby="home-projects" className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-10">
          <h2 id="home-projects" className="mb-8 font-display text-4xl font-semibold tracking-tight">
            Projects
          </h2>
          <ProjectList />
        </section>
      )}
    </>
  );
}

/** Stagger step for entrance animations (see .rise and .letter in globals.css). */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

function Letters({ word, from }: { word: string; from: number }) {
  return (
    <span className="md:block" aria-hidden="true">
      {[...word].map((letter, i) => (
        <span key={i} className="letter" style={at(from + i)}>
          {letter}
        </span>
      ))}
    </span>
  );
}

/**
 * Rendered stills of the default scene (`npm run poster`): first paint, loading
 * backdrop and no-WebGL fallback. Statically imported so their URLs are
 * fingerprinted (a re-render can never be served stale), and positioned by
 * .desk-poster in globals.css to sit exactly where the camera frames the desk.
 */
function Poster() {
  const common = { alt: "", quality: 75, loading: "eager", fetchPriority: "high" } as const;
  const portrait = getImageProps({ ...common, src: posterPortrait, sizes: "100vw" }).props;
  const { srcSet, ...landscape } = getImageProps({ ...common, src: posterLandscape, sizes: "160vh" }).props;
  return (
    <picture>
      <source media={PORTRAIT_MEDIA} srcSet={portrait.srcSet} sizes={portrait.sizes} />
      <img {...landscape} src={landscape.src} alt="" srcSet={srcSet} className="desk-poster" />
    </picture>
  );
}
