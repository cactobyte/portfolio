"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, MathUtils, type AmbientLight, type DirectionalLight } from "three";
import { themeColors, useSceneStateRef } from "./scene-state";

const DAY_KEY = new Color("#FFF6EA");
const NIGHT_KEY = new Color("#8EA2D6");

/**
 * Soft studio lighting: a procedural environment (no HDR download) for the
 * clay look, one shadow-casting key light, and an ambient fill. In the night
 * theme everything dims and cools so the lamp and monitor carry the scene.
 */
type LightingProps = { night: boolean; reduced: boolean; shadowMapSize: number };

export function Lighting({ night, reduced, shadowMapSize }: LightingProps) {
  const sceneStateRef = useSceneStateRef();
  const ambient = useRef<AmbientLight>(null);
  const key = useRef<DirectionalLight>(null);

  // Switching on starts the bulb's flicker (skipped for reduced motion); switching off is instant.
  useEffect(() => {
    sceneStateRef.current.lampOnAt = night && !reduced ? performance.now() : -1;
  }, [night, reduced, sceneStateRef]);

  useFrame(({ scene }, dt) => {
    const state = sceneStateRef.current;
    // The bulb reaches full brightness in ~0.2s (and goes out faster); the room follows over ~0.8s.
    state.lamp = MathUtils.damp(state.lamp, night ? 1 : 0, night ? 14 : 24, dt);
    const n = (state.night = MathUtils.damp(state.night, night ? 1 : 0, 3.5, dt));
    if (ambient.current) ambient.current.intensity = MathUtils.lerp(0.55, 0.05, n);
    if (key.current) {
      key.current.intensity = MathUtils.lerp(2.1, 0.18, n);
      key.current.color.lerpColors(DAY_KEY, NIGHT_KEY, n);
    }
    scene.environmentIntensity = MathUtils.lerp(0.9, 0.08, n);
    if (scene.background instanceof Color) scene.background.lerpColors(themeColors.bg[0], themeColors.bg[1], n);
  });

  return (
    <>
      <color attach="background" args={[themeColors.bg[night ? 1 : 0].getHex()]} />
      <ambientLight ref={ambient} intensity={0.55} />
      <directionalLight
        ref={key}
        position={[-2.2, 3.4, 2.4]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={1.4}
        shadow-camera-bottom={-1.4}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#FFE6CC"
          position={[-5, 2, 2]}
          rotation-y={Math.PI / 2}
          scale={[6, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#E3EEF2"
          position={[5, 1.5, 3]}
          rotation-y={-Math.PI / 2}
          scale={[6, 3, 1]}
        />
      </Environment>
    </>
  );
}
