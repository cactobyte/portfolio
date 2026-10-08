import { createContext, useContext, type RefObject } from "react";
import { Color } from "three";
import { site } from "@/src/config/site";

/**
 * Per-frame values shared inside the canvas. Mutated in place by the
 * lighting rig (never via React state) so the render loop stays cheap.
 */
export type SceneState = {
  /** 0 = clay daylight, 1 = night with the lamp on; eases slowly, like a room's light. */
  night: number;
  /** The lamp's own light, 0..1; follows the switch much faster than the room. */
  lamp: number;
  /** performance.now() when the lamp was last switched on, for the start-up flicker; -1 for none. */
  lampOnAt: number;
  /** Camera path progress actually shown, 0 = wide shot, 1 = at the monitor. */
  progress: number;
};

export const SceneStateContext = createContext<RefObject<SceneState>>({
  current: { night: 0, lamp: 0, lampOnAt: -1, progress: 0 },
});
export const useSceneStateRef = () => useContext(SceneStateContext);

/**
 * DOM element the monitor's HTML mounts into. drei's <Html> otherwise picks
 * its container from R3F's event target, which changes after the first
 * render; on React 19 that remount races and leaves the screen empty.
 */
export const ScreenPortalContext = createContext<RefObject<HTMLElement | null> | undefined>(undefined);

/** Stepped brightness of a bulb catching: two quick dips over ~0.3s, then steady. */
const FLICKER = [0.15, 1, 0.35, 1, 0.7, 1];
const FLICKER_STEP_MS = 50;

/** Multiplier for the lamp's brightness right after it is switched on. */
export function lampFlicker(state: SceneState, now = performance.now()) {
  if (state.lampOnAt < 0) return 1;
  return FLICKER[Math.floor((now - state.lampOnAt) / FLICKER_STEP_MS)] ?? 1;
}

const { clay, night } = site.theme.presets;

/** Theme colours as linear three.js colours, for blending in useFrame. */
export const themeColors = {
  bg: [new Color(clay.bg), new Color(night.bg)],
  lamp: new Color(night.lamp),
  screenGlow: new Color(night.screen),
  /** The monitor's panel colour (the CSS --screen-surface mix), per theme. */
  screenSurface: [
    new Color(clay.bg).lerp(new Color(clay.screen), 0.18),
    new Color(night.bg).lerp(new Color(night.screen), 0.18),
  ],
} as const;

/** Clay material colours. Fixed across themes; the lighting does the mood change. */
export const clayColors = {
  oak: "#D9CAB2",
  cream: "#ECE6DB",
  ink: "#2C2D29",
  sage: clay.accent,
  sageDeep: "#5F8A5B",
  terracotta: clay.warm,
  soil: "#5B4636",
  coffee: "#3E2C22",
  blossom: "#E99AA8",
  pollen: "#F1C453",
} as const;
