"use client";

import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh, Object3D, PointLight } from "three";
import type { SceneObject, StandInId } from "@/src/config/site";
import { useTheme } from "../theme";
import { MonitorScreen } from "./monitor-screen";
import { lampFlicker, themeColors, useSceneStateRef } from "./scene-state";
import { standIns } from "./stand-ins";

type DeskObjectProps = {
  object: SceneObject;
  /** Called by "focusScreen" objects. */
  onFocusScreen: () => void;
  /** Skip the wiggle animation. */
  reduced: boolean;
};

/**
 * One object on the desk: a GLB when `modelPath` is set, otherwise the
 * primitive stand-in for its id. Adds the shared behaviours (shadows, hover
 * outline and cursor, interactions, screen and lamp light anchors) so a
 * model swap is a config change only.
 */
export function DeskObject({ object, onFocusScreen, reduced }: DeskObjectProps) {
  const { toggle } = useTheme();
  const [hovered, setHovered] = useState(false);
  const body = useRef<Group>(null);
  const springs = useRef({
    tiltX: { x: 0, v: 0 },
    tiltZ: { x: 0, v: 0 },
    squash: { x: 0, v: 0 },
    bloom: { x: 0, v: 0 },
    open: false,
    kickedAt: -Infinity,
  });
  const interactive = Boolean(object.interaction);
  useCursor(hovered && interactive);

  useLayoutEffect(() => {
    body.current?.traverse((child) => {
      if ((child as Mesh).isMesh) child.castShadow = child.receiveShadow = true;
    });
  });

  // "wiggle" objects: the plant (a "sway" node, else the whole object) bends from its base on
  // springs, kicked away from the cursor on hover; a click squashes it and opens or closes a
  // "bloom" node. Loosely damped so it rings like a stem, not a hinge.
  useFrame((_, delta) => {
    const root = body.current;
    const s = springs.current;
    if (!root || object.interaction !== "wiggle") return;
    const bloomTarget = s.open ? 1 : 0;
    if ([s.tiltX, s.tiltZ, s.squash].every((p) => settled(p, 0)) && settled(s.bloom, bloomTarget)) return;
    const dt = Math.min(delta, 1 / 30) / 2;
    for (let i = 0; i < 2; i++) {
      step(s.tiltX, 0, 170, 3.2, dt);
      step(s.tiltZ, 0, 170, 3.2, dt);
      step(s.squash, 0, 420, 9, dt);
      step(s.bloom, bloomTarget, 220, 13, dt);
    }
    poseWiggle(root, s);
  });

  const handlers = interactive && {
    onPointerOver(event: ThreeEvent<PointerEvent>) {
      event.stopPropagation();
      setHovered(true);
      // Pointer-over fires for each part the cursor crosses (pot, stem, arms): kick once per visit,
      // bending the plant away from where the cursor came in.
      const s = springs.current;
      if (object.interaction === "wiggle" && !reduced && body.current && event.timeStamp - s.kickedAt > 800) {
        const hit = body.current.worldToLocal(event.point.clone()).setY(0);
        if (hit.lengthSq() < 1e-8) hit.set(1, 0, 0);
        hit.normalize();
        s.tiltX.v -= hit.z * 1.6;
        s.tiltZ.v += hit.x * 1.6;
        s.kickedAt = event.timeStamp;
      }
    },
    onPointerOut() {
      setHovered(false);
    },
    onClick(event: ThreeEvent<MouseEvent>) {
      event.stopPropagation();
      if (object.interaction === "toggleLight") toggle();
      if (object.interaction === "focusScreen") onFocusScreen();
      if (object.interaction === "wiggle") {
        const s = springs.current;
        s.open = !s.open;
        if (reduced) s.bloom.x = s.open ? 1 : 0;
        else s.squash.v -= 2.4;
      }
    },
  };

  return (
    <group position={object.position} rotation={object.rotation} scale={object.scale} name={object.label}>
      <Select enabled={hovered && interactive}>
        <group ref={body} {...handlers}>
          {object.modelPath ? <Model path={object.modelPath} /> : <StandIn id={object.id as StandInId} />}
          {/* Inside the handler group so the screen, not just the bezel, is hoverable and clickable. */}
          {object.screen && <MonitorScreen anchor={object.screen} onFocusScreen={onFocusScreen} />}
        </group>
      </Select>
      {object.light && <LampLight position={object.light} />}
    </group>
  );
}

type Spring = { x: number; v: number };

function poseWiggle(root: Object3D, s: Record<"tiltX" | "tiltZ" | "squash" | "bloom", Spring>) {
  const sway = root.getObjectByName("sway") ?? root;
  sway.rotation.x = s.tiltX.x;
  sway.rotation.z = s.tiltZ.x;
  sway.scale.set(1 - s.squash.x / 2, 1 + s.squash.x, 1 - s.squash.x / 2);
  const bloom = root.getObjectByName("bloom");
  if (bloom) {
    bloom.scale.setScalar(Math.max(0, s.bloom.x));
    bloom.visible = s.bloom.x > 0.01;
  }
}

/** One semi-implicit Euler step of a damped spring toward `target`. */
function step(spring: Spring, target: number, stiffness: number, damping: number, dt: number) {
  spring.v += (stiffness * (target - spring.x) - damping * spring.v) * dt;
  spring.x += spring.v * dt;
}

const settled = (spring: Spring, target: number) => Math.abs(spring.x - target) < 1e-4 && Math.abs(spring.v) < 1e-3;

function StandIn({ id }: { id: StandInId }) {
  const Component = standIns[id];
  return <Component />;
}

function Model({ path }: { path: string }) {
  // `true` enables Draco decoding (decoder fetched from the drei/Google CDN).
  const { scene } = useGLTF(path, true);
  const instance = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={instance} />;
}

/** Warm light that fades in with the night theme. */
function LampLight({ position }: { position: [number, number, number] }) {
  const sceneStateRef = useSceneStateRef();
  const light = useRef<PointLight>(null);
  useFrame(() => {
    if (!light.current) return;
    const state = sceneStateRef.current;
    light.current.intensity = state.lamp * lampFlicker(state) * 1.6;
    // Point-light shadows render six maps a frame; only pay for them when the lamp is on.
    light.current.castShadow = state.lamp > 0.02;
  });
  return (
    <pointLight
      ref={light}
      position={position}
      color={themeColors.lamp}
      intensity={0}
      distance={2.2}
      decay={1.6}
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.002}
    />
  );
}
