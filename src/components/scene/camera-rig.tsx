"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { CatmullRomCurve3, Euler, MathUtils, Object3D, Vector3, type Group, type PerspectiveCamera } from "three";
import { site, type CameraKeyframe, type SceneObject } from "@/src/config/site";
import { useSceneStateRef } from "./scene-state";

export type ProgressSource = { get(): number };
export type TiltSource = RefObject<{ x: number; y: number }>;

type CameraRigProps = {
  /** Scroll progress through the hero, 0..1 (a framer-motion MotionValue fits). */
  progress: ProgressSource;
  /** The group holding the desk; it is rotated for the tilt. */
  tiltGroupRef: RefObject<Group | null>;
  /** Phone tilt, if live. */
  deviceTilt: TiltSource | null;
  /** Sway gently when there is no mouse or gyro input. */
  idleSway: boolean;
  reduced: boolean;
  /** Pixels covered by fixed UI at the top (the nav); the final screen shot frames below it. */
  topInset: number;
};

const { camera: cameraConfig, objects, tiltDegrees } = site.scene;
const MAX_TILT = MathUtils.degToRad(tiltDegrees);
/** How far the subject shifts off-centre at the wide shot, as a share of the viewport. */
const SUBJECT_OFFSET = { landscape: -0.17, portrait: -0.16 };
/** Below this aspect the layout is portrait: intro copy above the desk instead of beside it. */
const PORTRAIT_BELOW = 1.1;
/**
 * Aspect the keyframes are composed for. Narrower screens pull the camera back so
 * the desk scales with width: on landscape that keeps it clear of the intro copy,
 * on portrait it keeps the whole desk in frame. Keep in sync with .desk-poster
 * in globals.css and the poster render sizes in scripts/render-poster.mjs.
 */
const COMPOSED_ASPECT = { landscape: 1.75, portrait: 1.15 };
/** At the monitor, portrait screens lift it a little so the desk fills the space below it, not bare wall above. */
const PORTRAIT_SCREEN_LIFT = 0.08;

/** World-space centre, normal and size of the screen, from the config. */
function screenFrame() {
  const host = objects.find((o): o is SceneObject & { screen: NonNullable<SceneObject["screen"]> } => !!o.screen);
  if (!host) return null;
  const parent = new Object3D();
  parent.position.set(...host.position);
  if (host.rotation) parent.rotation.set(...host.rotation);
  const anchor = new Object3D();
  anchor.position.set(...host.screen.position);
  if (host.screen.rotation) anchor.rotation.set(...host.screen.rotation);
  parent.add(anchor);
  parent.updateMatrixWorld(true);
  return {
    center: anchor.getWorldPosition(new Vector3()),
    normal: new Vector3(0, 0, 1).applyQuaternion(anchor.getWorldQuaternion(anchor.quaternion.clone())),
    width: host.screen.width,
    height: host.screen.height,
  };
}

/**
 * Camera position that fits the screen (plus a sliver of bezel) in the part
 * of the viewport not covered by the nav. `visible` is that part's share of the height.
 */
function fitScreenPosition(aspect: number, fov: number, visible: number) {
  const frame = screenFrame();
  if (!frame) return null;
  const tanY = Math.tan(MathUtils.degToRad(fov) / 2) * visible;
  const tanX = Math.tan(MathUtils.degToRad(fov) / 2) * aspect;
  const distance = Math.max(frame.height / 2 / tanY, frame.width / 2 / tanX) * 1.06;
  return { position: frame.center.clone().addScaledVector(frame.normal, distance), target: frame.center };
}

function buildPath(keyframes: CameraKeyframe[], aspect: number, fov: number, visible: number) {
  const composed = aspect > PORTRAIT_BELOW ? COMPOSED_ASPECT.landscape : COMPOSED_ASPECT.portrait;
  const pullBack = Math.max(1, composed / aspect);
  const points = keyframes.map((k) => {
    const fit = k.fitScreen ? fitScreenPosition(aspect, fov, visible) : null;
    if (fit) return fit;
    const target = new Vector3(...k.target);
    const position = new Vector3(...k.position).sub(target).multiplyScalar(pullBack).add(target);
    return { position, target };
  });
  return {
    positions: new CatmullRomCurve3(
      points.map((p) => p.position),
      false,
      "centripetal",
    ),
    targets: new CatmullRomCurve3(
      points.map((p) => p.target),
      false,
      "centripetal",
    ),
  };
}

/** Maps scroll progress onto the curve parameter so each keyframe lands at its `at`. */
function curveParam(progress: number, keyframes: CameraKeyframe[]) {
  const last = keyframes.length - 1;
  for (let i = 0; i < last; i++) {
    const a = keyframes[i].at;
    const b = keyframes[i + 1].at;
    if (progress <= b) return (i + MathUtils.clamp((progress - a) / (b - a), 0, 1)) / last;
  }
  return 1;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Moves the camera along the configured path as the hero scrolls, framing
 * the monitor at the end, and tilts the desk toward the pointer (or phone).
 * With reduced motion it cuts between the first and last shots and never tilts.
 */
export function CameraRig({ progress, tiltGroupRef, deviceTilt, idleSway, reduced, topInset }: CameraRigProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const keyframes = cameraConfig.keyframes;
  const visible = 1 - topInset / size.height;
  const path = useMemo(() => buildPath(keyframes, aspect, cameraConfig.fov, visible), [keyframes, aspect, visible]);

  const pointer = useRef({ x: 0, y: 0, active: false });
  // The damped camera position before the framing pan is added.
  const base = useRef(new Vector3(...keyframes[0].position));
  const look = useRef(new Vector3(...keyframes[0].target));
  const goal = useMemo(
    () => ({
      position: new Vector3(),
      target: new Vector3(),
      tilt: new Euler(),
      right: new Vector3(),
      up: new Vector3(),
    }),
    [],
  );
  const first = useRef(true);
  const sceneStateRef = useSceneStateRef();

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.current.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const raw = MathUtils.clamp(progress.get(), 0, 1);
    const p = reduced ? (raw > 0.5 ? 1 : 0) : easeInOut(raw);
    sceneStateRef.current.progress = p;
    const u = curveParam(p, keyframes);
    path.positions.getPoint(u, goal.position);
    path.targets.getPoint(u, goal.target);

    if (reduced || first.current) {
      base.current.copy(goal.position);
      look.current.copy(goal.target);
      first.current = false;
    } else {
      const lambda = 6;
      base.current.set(
        MathUtils.damp(base.current.x, goal.position.x, lambda, dt),
        MathUtils.damp(base.current.y, goal.position.y, lambda, dt),
        MathUtils.damp(base.current.z, goal.position.z, lambda, dt),
      );
      look.current.set(
        MathUtils.damp(look.current.x, goal.target.x, lambda, dt),
        MathUtils.damp(look.current.y, goal.target.y, lambda, dt),
        MathUtils.damp(look.current.z, goal.target.z, lambda, dt),
      );
    }
    camera.position.copy(base.current);
    camera.lookAt(look.current);
    camera.updateMatrixWorld();

    // Frame the subject off-centre at the wide shot so the intro copy has room, and at the
    // end drop the screen below the nav. Done as a pan in the camera plane (not
    // setViewOffset) so drei's <Html> transform, which ignores view offsets, stays aligned.
    const landscape = aspect > PORTRAIT_BELOW;
    const shiftX = landscape ? (1 - p) * SUBJECT_OFFSET.landscape : 0; // share of viewport width
    const portraitShift = (1 - p) * SUBJECT_OFFSET.portrait + p * PORTRAIT_SCREEN_LIFT;
    const shiftY = (landscape ? 0 : portraitShift) - (p * topInset) / 2 / state.size.height;
    const halfHeight = base.current.distanceTo(look.current) * Math.tan(MathUtils.degToRad(camera.fov) / 2);
    goal.right.setFromMatrixColumn(camera.matrixWorld, 0);
    goal.up.setFromMatrixColumn(camera.matrixWorld, 1);
    camera.position
      .addScaledVector(goal.right, shiftX * 2 * halfHeight * aspect)
      .addScaledVector(goal.up, -shiftY * 2 * halfHeight);

    // Tilt fades out as the camera approaches the screen, so the list holds still to read.
    if (!tiltGroupRef.current || reduced) return;
    let x = 0;
    let y = 0;
    if (deviceTilt?.current) ({ x, y } = deviceTilt.current);
    else if (pointer.current.active) ({ x, y } = pointer.current);
    else if (idleSway) {
      x = Math.sin(state.clock.elapsedTime * 0.35) * 0.6;
      y = Math.sin(state.clock.elapsedTime * 0.27) * 0.3;
    }
    const strength = MAX_TILT * (1 - p);
    goal.tilt.set(y * strength * 0.6, x * strength, 0);
    const { rotation } = tiltGroupRef.current;
    rotation.x = MathUtils.damp(rotation.x, goal.tilt.x, 3, dt);
    rotation.y = MathUtils.damp(rotation.y, goal.tilt.y, 3, dt);
  });

  return null;
}
