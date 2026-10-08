"use client";

/*
 * Primitive "clay" stand-ins for each desk object, used until a GLB is set in
 * the config. Units are metres; each object's origin sits where it touches
 * the surface below it (the floor for the desk and chair, the desktop for the rest).
 */

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  DoubleSide,
  FrontSide,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
  type InstancedMesh,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { StandInId } from "@/src/config/site";
import { clayColors as C, lampFlicker, themeColors, useSceneStateRef } from "./scene-state";

function Clay({ color, doubleSided = false }: { color: string; doubleSided?: boolean }) {
  return (
    <meshStandardMaterial color={color} roughness={0.85} metalness={0} side={doubleSided ? DoubleSide : FrontSide} />
  );
}

function Box({
  size,
  radius = 0.012,
  color,
  ...props
}: { size: [number, number, number]; radius?: number; color: string } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <RoundedBox args={size} radius={radius} smoothness={4}>
        <Clay color={color} />
      </RoundedBox>
    </group>
  );
}

const UP = new Vector3(0, 1, 0);

/** A capsule stretched between two points, for tubes, arms and legs. */
function Segment({ from, to, radius, color }: { from: Vector3; to: Vector3; radius: number; color: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = to.clone().sub(from);
    return {
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry args={[radius, length, 6, 16]} />
      <Clay color={color} />
    </mesh>
  );
}

/** Revolved profile (x = radius, y = height). Double-sided so open shapes (mugs, shades) show their insides. */
function Lathe({
  profile,
  color,
  ...props
}: { profile: [number, number][]; color: string } & React.ComponentProps<"mesh">) {
  const points = useMemo(() => profile.map(([x, y]) => new Vector2(x, y)), [profile]);
  return (
    <mesh {...props}>
      <latheGeometry args={[points, 48]} />
      <Clay color={color} doubleSided />
    </mesh>
  );
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/* ---------- Objects ---------- */

function Desk() {
  const legs: [number, number][] = [
    [-0.74, -0.34],
    [0.74, -0.34],
    [-0.74, 0.34],
    [0.74, 0.34],
  ];
  return (
    <group>
      <Box size={[1.6, 0.05, 0.8]} radius={0.02} color={C.oak} position={[0, 0.75, 0]} />
      {legs.map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.045, 0.73, 0.045]} radius={0.015} color={C.ink} position={[x, 0.365, z]} />
      ))}
    </group>
  );
}

function Monitor() {
  return (
    <group>
      <Box size={[0.24, 0.014, 0.16]} radius={0.007} color={C.ink} position={[0, 0.007, 0]} />
      <Box size={[0.05, 0.14, 0.024]} radius={0.01} color={C.ink} position={[0, 0.085, -0.025]} />
      <Box size={[0.62, 0.37, 0.03]} radius={0.014} color={C.ink} position={[0, 0.295, 0]} />
    </group>
  );
}

const KEY_ROWS = 4;
const KEY_COLS = 13;
const KEY_PITCH = 0.029;

function Keyboard() {
  const keysRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(0.024, 0.012, 0.024, 2, 0.004), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: C.cream, roughness: 0.85 }), []);

  useLayoutEffect(() => {
    const keys = keysRef.current;
    if (!keys) return;
    const dummy = new Object3D();
    let i = 0;
    for (let row = 0; row < KEY_ROWS; row++) {
      for (let col = 0; col < KEY_COLS; col++) {
        dummy.position.set((col - (KEY_COLS - 1) / 2) * KEY_PITCH, 0.024, (row - 2) * KEY_PITCH);
        dummy.updateMatrix();
        keys.setMatrixAt(i++, dummy.matrix);
      }
    }
    keys.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <Box size={[0.42, 0.018, 0.14]} radius={0.008} color={C.ink} position={[0, 0.009, 0]} />
      <instancedMesh ref={keysRef} args={[geometry, material, KEY_ROWS * KEY_COLS]} />
      <Box size={[0.16, 0.012, 0.024]} radius={0.004} color={C.cream} position={[0, 0.024, 2 * KEY_PITCH]} />
    </group>
  );
}

const MUG_PROFILE: [number, number][] = [
  [0, 0],
  [0.04, 0],
  [0.044, 0.004],
  [0.045, 0.095],
  [0.041, 0.096],
  [0.04, 0.012],
  [0, 0.012],
];

function Mug() {
  return (
    <group>
      <Lathe profile={MUG_PROFILE} color={C.terracotta} />
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 32]} />
        <Clay color={C.coffee} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]}>
        <torusGeometry args={[0.024, 0.007, 12, 24, Math.PI]} />
        <Clay color={C.terracotta} />
      </mesh>
    </group>
  );
}

const LAMP_BASE_PROFILE: [number, number][] = [
  [0, 0],
  [0.07, 0],
  [0.076, 0.005],
  [0.076, 0.013],
  [0.07, 0.019],
  [0, 0.019],
];
const SHADE_PROFILE: [number, number][] = [
  [0.011, 0.078],
  [0.016, 0.074],
  [0.024, 0.064],
  [0.05, 0.022],
  [0.058, 0.006],
  [0.06, 0],
];
const LAMP_POINTS = { base: v(0, 0.019, -0.02), elbow: v(0, 0.31, -0.1), head: v(0, 0.39, 0.11) };

/** Architect's lamp: weighted base, two arms with knuckles, a cone shade aimed at the desk. */
function Lamp() {
  const sceneStateRef = useSceneStateRef();
  const bulb = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const state = sceneStateRef.current;
    if (bulb.current) bulb.current.emissiveIntensity = 0.1 + state.lamp * lampFlicker(state) * 2.5;
  });

  return (
    <group>
      <Lathe profile={LAMP_BASE_PROFILE} color={C.ink} />
      <Segment from={LAMP_POINTS.base} to={LAMP_POINTS.elbow} radius={0.0075} color={C.ink} />
      <Segment from={LAMP_POINTS.elbow} to={LAMP_POINTS.head} radius={0.0075} color={C.ink} />
      {[LAMP_POINTS.base, LAMP_POINTS.elbow, LAMP_POINTS.head].map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.014, 20, 20]} />
          <Clay color={C.terracotta} />
        </mesh>
      ))}
      <group position={LAMP_POINTS.head} rotation={[-0.55, 0, 0]}>
        <Lathe profile={SHADE_PROFILE} color={C.ink} position={[0, -0.072, 0]} />
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.019, 20, 20]} />
          <meshStandardMaterial
            ref={bulb}
            color={themeColors.lamp}
            emissive={themeColors.lamp}
            emissiveIntensity={0.1}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

const POT_PROFILE: [number, number][] = [
  [0, 0],
  [0.045, 0],
  [0.056, 0.07],
  [0.062, 0.072],
  [0.062, 0.088],
  [0.054, 0.088],
  [0.05, 0.075],
  [0, 0.075],
];

/**
 * Potted cactus. The plant hangs off a "sway" group pivoting at the soil, and a
 * "bloom" flower sits closed on top; DeskObject animates both by name.
 */
function Cactus() {
  const petals = Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2);
  return (
    <group>
      <Lathe profile={POT_PROFILE} color={C.terracotta} />
      <mesh position={[0, 0.079, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.051, 32]} />
        <Clay color={C.soil} />
      </mesh>
      <group name="sway" position={[0, SOIL, 0]}>
        <Segment from={v(0, 0.1 - SOIL, 0)} to={v(0, 0.215 - SOIL, 0)} radius={0.029} color={C.sageDeep} />
        <Segment from={v(0.02, 0.15 - SOIL, 0)} to={v(0.055, 0.15 - SOIL, 0)} radius={0.013} color={C.sageDeep} />
        <Segment from={v(0.055, 0.15 - SOIL, 0)} to={v(0.055, 0.19 - SOIL, 0)} radius={0.013} color={C.sageDeep} />
        <Segment from={v(-0.02, 0.125 - SOIL, 0.004)} to={v(-0.048, 0.125 - SOIL, 0.004)} radius={0.011} color={C.sageDeep} />
        <Segment from={v(-0.048, 0.125 - SOIL, 0.004)} to={v(-0.048, 0.158 - SOIL, 0.004)} radius={0.011} color={C.sageDeep} />
        <group name="bloom" position={[0, 0.242 - SOIL, 0]} scale={0} visible={false}>
          {petals.map((a) => (
            <mesh key={a} position={[Math.cos(a) * 0.017, 0.006, Math.sin(a) * 0.017]} rotation={[0, -a, 0.45]} scale={[1, 0.42, 0.78]}>
              <sphereGeometry args={[0.017, 16, 12]} />
              <Clay color={C.blossom} />
            </mesh>
          ))}
          <mesh position={[0, 0.011, 0]}>
            <sphereGeometry args={[0.009, 12, 10]} />
            <Clay color={C.pollen} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
/** Height of the cactus soil, where the plant bends from. */
const SOIL = 0.08;

/** Task chair: five-star base on casters, gas lift, cushioned seat and a reclined back on a spine. */
function Chair() {
  const hub = v(0, 0.075, 0);
  const feet = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 10;
    return v(Math.cos(a) * 0.27, 0.05, Math.sin(a) * 0.27);
  });
  return (
    <group>
      {feet.map((foot, i) => (
        <group key={i}>
          <Segment from={hub} to={foot} radius={0.013} color={C.ink} />
          <mesh position={[foot.x, 0.022, foot.z]}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <Clay color={C.ink} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.032, 0.038, 0.05, 24]} />
        <Clay color={C.ink} />
      </mesh>
      <Segment from={hub} to={v(0, 0.4, 0)} radius={0.017} color={C.ink} />
      <Box size={[0.22, 0.03, 0.22]} radius={0.01} color={C.ink} position={[0, 0.405, 0]} />

      {/* Seat */}
      <Box size={[0.48, 0.075, 0.46]} radius={0.034} color={C.sage} position={[0, 0.455, 0]} />

      {/* Spine and back. The back reclines away from the seat (positive X rotation). */}
      <Segment from={v(0, 0.415, 0.1)} to={v(0, 0.415, 0.25)} radius={0.016} color={C.ink} />
      <Segment from={v(0, 0.415, 0.25)} to={v(0, 0.72, 0.25)} radius={0.016} color={C.ink} />
      <Box size={[0.45, 0.46, 0.06]} radius={0.04} color={C.sage} position={[0, 0.84, 0.235]} rotation={[0.12, 0, 0]} />
    </group>
  );
}

export const standIns: Record<StandInId, () => React.JSX.Element> = {
  desk: Desk,
  monitor: Monitor,
  keyboard: Keyboard,
  mug: Mug,
  lamp: Lamp,
  cactus: Cactus,
  chair: Chair,
};
