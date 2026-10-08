import { useSyncExternalStore } from "react";

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Phones and small tablets: lower DPR, no post-processing. */
export const LOW_POWER = "(pointer: coarse), (max-width: 767px)";

/** Live media-query value for render; false during SSR. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
