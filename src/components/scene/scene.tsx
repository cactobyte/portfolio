"use client";

import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, N8AO, Outline, Selection, SMAA } from "@react-three/postprocessing";
import { Suspense, useRef, type RefObject } from "react";
import type { Group } from "three";
import { site } from "@/src/config/site";
import { useTheme } from "../theme";
import { CameraRig, type ProgressSource, type TiltSource } from "./camera-rig";
import { DeskObject } from "./desk-object";
import { Lighting } from "./lighting";
import { SceneStateContext, ScreenPortalContext, type SceneState } from "./scene-state";

export type SceneProps = {
  progress: ProgressSource;
  /** Render loop runs only while the hero is on screen. */
  active: boolean;
  reduced: boolean;
  /** Phones: lower DPR, smaller shadows, no post-processing. */
  lowPower: boolean;
  deviceTilt: TiltSource | null;
  idleSway: boolean;
  onFocusScreen: () => void;
  /** Fires after the first frame is drawn, to swap out the poster. */
  onReady: () => void;
  /** See CameraRig. */
  topInset: number;
  /** Positioned over the canvas; the monitor's HTML mounts here. */
  screenPortal: RefObject<HTMLDivElement | null>;
};

/** The tilt pivots around the middle of the desktop rather than the floor. */
const PIVOT: [number, number, number] = [0, 0.9, 0];

/** The 3D desk hero. Loaded lazily; see components/hero.tsx. */
export default function Scene(props: SceneProps) {
  const { progress, active, reduced, lowPower, deviceTilt, idleSway, onFocusScreen, onReady, topInset, screenPortal } =
    props;
  const { theme } = useTheme();
  const tiltGroupRef = useRef<Group>(null);
  const sceneStateRef = useRef<SceneState>({
    night: theme === "night" ? 1 : 0,
    lamp: theme === "night" ? 1 : 0,
    lampOnAt: -1,
    progress: 0,
  });

  return (
    <Canvas
      flat
      shadows="percentage"
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: site.scene.camera.fov, near: 0.05, far: 30, position: site.scene.camera.keyframes[0].position }}
      gl={{ antialias: lowPower, powerPreference: "high-performance" }}
    >
      <SceneStateContext.Provider value={sceneStateRef}>
        <ScreenPortalContext.Provider value={screenPortal}>
          <Lighting night={theme === "night"} reduced={reduced} shadowMapSize={lowPower ? 1024 : 2048} />
          <CameraRig
            progress={progress}
            tiltGroupRef={tiltGroupRef}
            deviceTilt={deviceTilt}
            idleSway={idleSway}
            reduced={reduced}
            topInset={topInset}
          />
          <Selection>
            <group ref={tiltGroupRef} position={PIVOT}>
              <group position={[-PIVOT[0], -PIVOT[1], -PIVOT[2]]}>
                <Suspense fallback={null}>
                  {site.scene.objects.map((object) => (
                    <DeskObject key={object.id} object={object} onFocusScreen={onFocusScreen} reduced={reduced} />
                  ))}
                  <ContactShadows
                    position={[0, 0.001, 0]}
                    scale={4}
                    blur={2.4}
                    far={1.2}
                    opacity={0.42}
                    resolution={lowPower ? 256 : 512}
                    frames={1}
                  />
                  <FirstFrame onReady={onReady} />
                </Suspense>
              </group>
            </group>
            {!lowPower && (
              <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
                <N8AO halfRes aoRadius={0.35} distanceFalloff={0.6} intensity={2.2} quality="medium" />
                <Outline blur edgeStrength={4} visibleEdgeColor={0x1e1f1c} hiddenEdgeColor={0x1e1f1c} width={1200} />
                <SMAA />
              </EffectComposer>
            )}
          </Selection>
        </ScreenPortalContext.Provider>
      </SceneStateContext.Provider>
    </Canvas>
  );
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}
