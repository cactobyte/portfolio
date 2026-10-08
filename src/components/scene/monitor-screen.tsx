"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState, type RefObject } from "react";
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial, type PointLight } from "three";
import { site, type ScreenAnchor } from "@/src/config/site";
import { useMediaQuery } from "@/src/lib/media";
import { ProjectStatus } from "../project-status";
import { useTheme } from "../theme";
import { ScreenPortalContext, themeColors, useSceneStateRef } from "./scene-state";
import { snapshotElement, type SnapshotLink } from "./snapshot-element";

/**
 * Design width of the screen UI in CSS px; the world size comes from the
 * anchor. Narrow viewports get a compact layout designed at a smaller width.
 */
const DESIGN_WIDTH = { regular: 720, compact: 420 };
/** Progress at which the camera has arrived and the live HTML takes over from the copy. */
const LIVE_AT = 0.998;
/** Before this progress the links are too small to tap; a tap on the screen flies the camera in instead. */
const TAPPABLE_AT = 0.85;
/** How far from a link (in design px) a tap on the copy still counts as hitting it. */
const TAP_SLOP = 14;
const noRaycast = () => null;

/**
 * The monitor's display: a panel mesh plus the project list as real HTML,
 * mapped onto the screen with a CSS 3D transform so it stays crisp,
 * selectable and keyboard reachable.
 *
 * Phones scroll the page on another thread, and HTML positioned from script slips
 * off the screen (notably iOS Safari). So the screen shows a texture painted from
 * the HTML: on touch screens throughout, with taps hit-tested against its links;
 * elsewhere only while the camera flies, with the live HTML taking over on arrival.
 */
export function MonitorScreen({ anchor, onFocusScreen }: { anchor: ScreenAnchor; onFocusScreen: () => void }) {
  const sceneStateRef = useSceneStateRef();
  const panel = useRef<MeshBasicMaterial>(null);
  const glow = useRef<PointLight>(null);
  const content = useRef<HTMLElement>(null);
  // Keyboard focus inside the list. The live HTML shows then even on touch screens, so focus is visible.
  const focused = useRef(false);
  // Attached before the lazily loaded scene mounts, so it is never null by the time <Html> reads it.
  const portal = useContext(ScreenPortalContext) as RefObject<HTMLElement> | undefined;
  const viewportWidth = useThree((s) => s.size.width);
  const compact = viewportWidth < 640;
  const designWidth = compact ? DESIGN_WIDTH.compact : DESIGN_WIDTH.regular;
  // At the end of the fly-in the screen fills about the viewport's width. Rendering the UI that
  // large (CSS zoom) means the 3D transform only ever scales it down, so text stays sharp.
  const zoom = Math.max(1, viewportWidth / designWidth);
  const pxWidth = Math.round(designWidth * zoom);
  const { theme } = useTheme();
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  // Paint the copy at the size the screen ends up on screen, so it swaps for the HTML pixel for pixel.
  const dpr = useThree((s) => s.viewport.dpr);
  const copyScale = Math.min(4, zoom * dpr);
  const designHeight = Math.round((designWidth * anchor.height) / anchor.width);
  const touch = useMediaQuery("(pointer: coarse)");
  const [copy, setCopy] = useState<{ texture: CanvasTexture; links: SnapshotLink[] } | null>(null);

  // Repaint the copy when the layout or theme changes, once fonts and the theme attribute are in.
  useEffect(() => {
    let live = true;
    let frame = 0;
    let texture: CanvasTexture | undefined;
    const paint = () => {
      if (!live) return;
      if (!content.current || document.documentElement.dataset.theme !== theme) {
        frame = requestAnimationFrame(paint);
        return;
      }
      const { canvas, links } = snapshotElement(content.current, copyScale);
      texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      setCopy({ texture, links });
    };
    document.fonts.ready.then(paint);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      texture?.dispose();
    };
  }, [theme, designWidth, maxAnisotropy, copyScale]);

  useFrame(() => {
    panel.current?.color.lerpColors(
      themeColors.screenSurface[0],
      themeColors.screenSurface[1],
      sceneStateRef.current.night,
    );
    if (glow.current) glow.current.intensity = sceneStateRef.current.night * 0.35;
    // Hidden, not removed, so keyboard focus still reaches the links (and flies the camera in).
    if (content.current) {
      const live = !copy || focused.current || (!touch && sceneStateRef.current.progress > LIVE_AT);
      content.current.style.opacity = live ? "1" : "0";
      content.current.style.pointerEvents = live ? "auto" : "none";
    }
  });

  // Whenever the live HTML is hidden (touch screens, and mid-flight elsewhere), clicks on the copy open its links.
  const openLink = (event: ThreeEvent<MouseEvent>) => {
    if (!copy || !event.uv || sceneStateRef.current.progress < TAPPABLE_AT) return;
    const x = event.uv.x * designWidth;
    const y = (1 - event.uv.y) * designHeight;
    let hit: SnapshotLink | undefined;
    let nearest = TAP_SLOP;
    for (const link of copy.links) {
      const dx = Math.max(link.left * designWidth - x, 0, x - link.right * designWidth);
      const dy = Math.max(link.top * designHeight - y, 0, y - link.bottom * designHeight);
      const distance = Math.hypot(dx, dy);
      if (distance < nearest) [hit, nearest] = [link, distance];
    }
    if (!hit) return;
    event.stopPropagation();
    if (hit.newTab) window.open(hit.href, "_blank", "noopener");
    else window.location.assign(hit.href);
  };

  return (
    <group position={anchor.position} rotation={anchor.rotation}>
      {/* Takes the pointer for the screen: taps on a link open it, anything else bubbles up to fly the camera in. */}
      <mesh onClick={openLink}>
        <planeGeometry args={[anchor.width, anchor.height]} />
        <meshBasicMaterial ref={panel} toneMapped={false} />
      </mesh>
      {copy && (
        <mesh raycast={noRaycast} position={[0, 0, 0.0003]}>
          <planeGeometry args={[anchor.width, anchor.height]} />
          <meshBasicMaterial map={copy.texture} toneMapped={false} />
        </mesh>
      )}
      <pointLight ref={glow} color={themeColors.screenGlow} position={[0, -0.05, 0.3]} distance={1.4} intensity={0} />
      {/* The wrapper passes pointers through to the scene; the list sets its own pointer-events. */}
      <Html transform occlude portal={portal} pointerEvents="none" distanceFactor={(400 * anchor.width) / pxWidth} position={[0, 0, 0.0005]}>
        <ScreenContent
          ref={content}
          width={designWidth}
          height={designHeight}
          zoom={zoom}
          compact={compact}
          onFocus={() => {
            focused.current = true;
            onFocusScreen();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false;
          }}
        />
      </Html>
    </group>
  );
}

/*
 * Rendered by drei into its own React root, so it can't use app context
 * (theme, Next's router). Plain <a> links and CSS tokens only.
 */
type ScreenContentProps = {
  ref: React.Ref<HTMLElement>;
  /** Layout size in design px, before zoom. */
  width: number;
  height: number;
  zoom: number;
  compact: boolean;
  onFocus: () => void;
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
};

function ScreenContent({ ref, width, height, zoom, compact, onFocus, onBlur }: ScreenContentProps) {
  return (
    <section
      ref={ref}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label="Projects"
      style={{ width, height, zoom }}
      className={`flex flex-col overflow-hidden bg-screen-surface font-sans text-ink ${compact ? "px-5 pt-3 pb-2" : "px-8 pt-6 pb-5"}`}
    >
      <div className="flex items-baseline justify-between pb-2">
        <h2 className={`font-display font-semibold tracking-tight ${compact ? "text-[19px]" : "text-[28px]"}`}>
          Projects
        </h2>
        <a
          href="/projects"
          className={`font-medium underline decoration-accent decoration-2 underline-offset-4 ${compact ? "text-[13px]" : "text-[15px]"}`}
        >
          Open projects page
        </a>
      </div>
      <ul className="flex flex-1 flex-col justify-between">
        {site.projects.map((project) => (
          <li
            key={project.name}
            className={`flex items-baseline border-t border-line ${compact ? "gap-3 pt-1" : "gap-6 pt-2.5"}`}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`font-display leading-tight font-semibold tracking-tight ${compact ? "text-[16px]" : "text-[20px]"}`}
              >
                {project.link ? (
                  <a
                    href={project.link.href}
                    {...(project.link.external && { target: "_blank", rel: "noopener" })}
                    className="underline decoration-line decoration-1 underline-offset-4 transition-colors hover:decoration-accent hover:decoration-2"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </p>
              {!compact && <p className="truncate text-[14px] text-muted">{project.description}</p>}
            </div>
            <ProjectStatus project={project} className={compact ? "text-[12px]" : "text-[13px]"} />
          </li>
        ))}
      </ul>
    </section>
  );
}
