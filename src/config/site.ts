/*
 * Single source of truth for the site: theme tokens, the 3D desk scene,
 * the camera path and the project list. See README.md for how to swap
 * models or themes.
 */

import type { StaticImageData } from "next/image";
import bennettShot from "@/src/assets/projects/bennett.jpg";
import fanclubLogo from "@/src/assets/projects/fanclub-logo.png";
import openclawArt from "@/src/assets/projects/openclaw.svg";

export type Vec3 = [number, number, number];

/* ---------- Theme ---------- */

export type ThemeName = "clay" | "night";

export type ThemeTokens = {
  /** Page and scene background. */
  bg: string;
  /** Text and dark clay. */
  ink: string;
  /** Sage: buttons, plants, focus. */
  accent: string;
  /** Terracotta: pots, mugs, small warm details. */
  warm: string;
  /** Desk lamp bulb and light colour. */
  lamp: string;
  /** Monitor glow. */
  screen: string;
};

const themes: Record<ThemeName, ThemeTokens> = {
  clay: {
    bg: "#F2EEE6",
    ink: "#1E1F1C",
    accent: "#7FA77A",
    warm: "#C8734F",
    lamp: "#FFE2B8",
    screen: "#DCE8DE",
  },
  night: {
    bg: "#12141C",
    ink: "#ECEAE4",
    accent: "#7FA77A",
    warm: "#C8734F",
    lamp: "#FFB45C",
    screen: "#6FE3FF",
  },
};

/* ---------- Scene ---------- */

/** Objects that have a built-in primitive stand-in (see src/components/scene/stand-ins.tsx). */
export type StandInId = "desk" | "monitor" | "keyboard" | "mug" | "lamp" | "cactus" | "chair";

export type Interaction =
  /** Wobbles on hover. */
  | "wiggle"
  /** Click switches between the clay and night themes. */
  | "toggleLight"
  /** Click flies the camera into the monitor. */
  | "focusScreen";

/** Where the HTML project list sits, in the object's local space. */
export type ScreenAnchor = {
  position: Vec3;
  rotation?: Vec3;
  /** World-unit size of the visible screen area. */
  width: number;
  height: number;
};

type SceneObjectBase = {
  /** Shown as the accessible name and hover label. */
  label: string;
  position: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
  interaction?: Interaction;
  /** Present on the object that hosts the project list. */
  screen?: ScreenAnchor;
  /** Local position of the light a "toggleLight" object emits in the night theme. */
  light?: Vec3;
};

export type SceneObject = SceneObjectBase &
  (
    | { id: StandInId; /** GLB (Draco OK). Leave out to use the primitive stand-in. */ modelPath?: string }
    | { id: string; modelPath: string }
  );

export type CameraKeyframe = {
  /** Scroll progress through the hero, 0..1. */
  at: number;
  position: Vec3;
  target: Vec3;
  /** Ignore `position` and frame the monitor screen to fill the viewport. */
  fitScreen?: boolean;
};

/* ---------- Projects ---------- */

export type Project = {
  name: string;
  status: string;
  /** Pulsing dot for work in progress. */
  live?: boolean;
  description: string;
  tags: string[];
  link?: { href: string; label: string; external?: boolean };
  /**
   * Card picture, statically imported from src/assets/projects/ and shown at its own
   * aspect ratio. `contain` centres it on a tinted tile instead (for logos). Cards
   * without one are text only, on a tint.
   */
  image?: { src: StaticImageData; alt: string; fit?: "contain" };
};

export type Social = {
  name: string;
  href: string;
  /** SVG path data for a 24×24 icon. */
  icon: string;
};

/* ---------- Config ---------- */

export const site = {
  theme: {
    default: "clay" as ThemeName,
    presets: themes,
  },

  scene: {
    /** Max scene tilt toward the cursor or phone tilt. */
    tiltDegrees: 6,
    /** Hero scroll length in viewport heights; longer = slower fly-in. */
    scrollLength: 3,
    camera: {
      fov: 30,
      keyframes: [
        { at: 0, position: [2.5, 1.8, 3.1], target: [0, 0.8, 0] },
        { at: 0.55, position: [0.7, 1.25, 1.45], target: [0, 1.04, 0] },
        { at: 1, position: [0, 1.07, 0.8], target: [0, 1.07, 0], fitScreen: true },
      ] satisfies CameraKeyframe[],
    },
    objects: [
      { id: "desk", label: "Desk", position: [0, 0, 0] },
      {
        id: "monitor",
        label: "Monitor showing projects",
        position: [0, 0.775, -0.12],
        interaction: "focusScreen",
        screen: { position: [0, 0.295, 0.0185], width: 0.58, height: 0.33 },
      },
      { id: "keyboard", label: "Keyboard", position: [-0.04, 0.775, 0.16], rotation: [0, 0.04, 0] },
      { id: "mug", label: "Mug", position: [0.42, 0.775, 0.12], rotation: [0, -0.9, 0] },
      {
        id: "lamp",
        label: "Desk lamp",
        position: [-0.6, 0.775, -0.16],
        rotation: [0, 0.5, 0],
        interaction: "toggleLight",
        light: [0, 0.33, 0.16],
      },
      { id: "cactus", label: "Cactus", position: [0.6, 0.775, -0.2], interaction: "wiggle" },
      { id: "chair", label: "Chair", position: [-0.58, 0, 0.6], rotation: [0, -0.8, 0] },
    ] satisfies SceneObject[] as SceneObject[],
  },

  /** Shown as icon buttons under the hero intro; "Contact me" leads here. */
  socials: [
    {
      name: "GitHub",
      href: "https://github.com/cactobyte",
      icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/boris-cheung-010291210/",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      name: "X",
      href: "https://x.com/cactobyte",
      icon: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
    },
    {
      name: "LeetCode",
      href: "https://leetcode.com/u/cactobyte/",
      icon: "M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z",
    },
    {
      // Opens the visitor's mail app; the hero also copies the address, for when no mail app is set up.
      name: "Email",
      href: "mailto:borisbcheung@gmail.com",
      icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
    },
  ] satisfies Social[] as Social[],

  projects: [
    {
      name: "Bennett",
      status: "almost done",
      live: true,
      description: "A website for musician Bennett, featuring an interactive 3D stage you can rotate.",
      tags: ["Next.js", "React Three Fiber", "Framer Motion", "Tailwind CSS"],
      link: { href: "https://bennett-music.vercel.app/", label: "Visit site", external: true },
      image: {
        src: bennettShot,
        alt: "Bennett's site: a halftone 3D stage with a keyboard, mic stand, red guitar and coat stand",
      },
    },
    {
      name: "AI Bookings Manager",
      status: "in progress",
      live: true,
      description: "Commissioned AI manager that handles bookings for tattoo artists and other creatives.",
      tags: ["TypeScript", "Next.js", "Postgres (Neon) via Drizzle", "Vitest"],
    },
    {
      name: "OneInbox",
      status: "shipped",
      description: "Omnichannel customer messaging platform for SMEs.",
      tags: ["Full-stack"],
      link: { href: "https://github.com/cactobyte/one-inbox", label: "View project", external: true },
    },
    {
      name: "OpenClaw - Orbis",
      status: "deprecated",
      description: "My own personal open-claw bot, run on a Mac mini. Currently deprecated.",
      tags: ["Personal"],
      image: { src: openclawArt, alt: "Illustration of a red lobster claw" },
    },
    {
      name: "LLM-Driven RPG Game",
      status: "dissertation — first",
      description:
        "Unity RPG where NPCs are powered by an LLM: they remember past conversations and generate dynamic quests instead of following a fixed list.",
      tags: ["Unity", "C#", "Gemini API"],
      link: { href: "/projects/dissertation", label: "Read more" },
    },
    {
      name: "FanClub",
      status: "shipped",
      description: "MVP web app for a friend's startup, built and used to pitch investors.",
      tags: ["React", "Freelance"],
      link: { href: "https://github.com/cactobyte/fanclub", label: "View project", external: true },
      image: { src: fanclubLogo, alt: "FanClub logo", fit: "contain" },
    },
  ] satisfies Project[] as Project[],
};

export type SiteConfig = typeof site;

/** CSS custom properties for every theme, generated from the presets above. */
export function themeCss() {
  const vars = (t: ThemeTokens) =>
    Object.entries(t)
      .map(([key, value]) => `--${key}:${value};`)
      .join("");
  const { presets, default: initial } = site.theme;
  return [
    `:root{${vars(presets[initial])}}`,
    ...Object.entries(presets).map(([name, tokens]) => `:root[data-theme="${name}"]{${vars(tokens)}}`),
  ].join("\n");
}
