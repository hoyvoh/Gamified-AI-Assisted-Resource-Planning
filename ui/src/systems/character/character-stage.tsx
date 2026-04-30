"use client";

import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { ColorRepresentation } from "three";

import type { AnalysisStatus } from "@/types/organization";
import { CHARACTER_MOTION } from "@/systems/character/character-system.constants";
import { CharacterCore } from "@/systems/character/character-core";
import type { CharacterModelConfig } from "@/systems/character/character-model";

interface CharacterStageProps {
  accentColor?: string;
  confidence: number;
  status: AnalysisStatus;
  isFocusMode: boolean;
  stageMode?: "hero" | "portrait";
}

interface CharacterCameraRigProps {
  isFocusMode: boolean;
  stageMode: "hero" | "portrait";
  targetLookAt: {
    x: number;
    y: number;
    z: number;
  };
}

const DEFAULT_CAMERA = {
  x: 0,
  y: 0.8,
  z: 4.1,
} as const;

const FOCUS_CAMERA = {
  x: 0,
  y: 0.94,
  z: 3.5,
} as const;

const PORTRAIT_CAMERA = {
  x: 0,
  y: 0.64,
  z: 5.15,
} as const;

const CHARACTER_LOOK_AT = {
  x: 0,
  y: 0.28,
  z: 0,
} as const;

const TRANSPARENT_CLEAR: ColorRepresentation = "#000000";

const STAGE_PRESETS = {
  hero: {
    auraScale: 1,
    cameraFov: 34,
    canvasShellClassName: "absolute inset-x-0 bottom-0 top-4 xl:top-5",
    modelConfig: undefined,
    stageClassName:
      "pointer-events-none relative flex min-h-140 flex-1 overflow-visible pt-4 xl:h-full xl:min-h-[calc(100vh-150px)] xl:pt-5",
    targetLookAt: CHARACTER_LOOK_AT,
  },
  portrait: {
    auraScale: 0.68,
    cameraFov: 24,
    canvasShellClassName: "absolute inset-0",
    modelConfig: {
      pedestalOffset: -0.8,
      targetHeight: 1.7,
    } satisfies Partial<CharacterModelConfig>,
    orthographicZoom: 66,
    stageClassName:
      "pointer-events-none relative h-full min-h-0 w-full overflow-hidden",
    targetLookAt: {
      x: 0,
      y: 0.22,
      z: 0,
    },
  },
} as const;

const HeroStageFallback = () => (
  <group position={[0, 0.2, 0]}>
    <mesh position={[0, -0.05, 0]}>
      <capsuleGeometry args={[0.42, 1.35, 12, 20]} />
      <meshBasicMaterial
        color="#99fff2"
        opacity={0.1}
        transparent
        depthWrite={false}
      />
    </mesh>
  </group>
);

const CharacterCameraRig = ({
  isFocusMode,
  stageMode,
  targetLookAt,
}: CharacterCameraRigProps) => {
  const { camera } = useThree();

  useEffect(() => {
    const target =
      stageMode === "portrait"
        ? PORTRAIT_CAMERA
        : isFocusMode
          ? FOCUS_CAMERA
          : DEFAULT_CAMERA;

    const tween = gsap.to(camera.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: CHARACTER_MOTION.cameraFocusDuration,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
      },
    });

    return () => {
      tween.kill();
    };
  }, [camera, isFocusMode, stageMode, targetLookAt]);

  return null;
};

export const CharacterStage = ({
  accentColor = "#99fff2",
  confidence,
  status,
  isFocusMode,
  stageMode = "hero",
}: CharacterStageProps) => {
  const loadingVeilRef = useRef<HTMLDivElement | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const handleModelReady = useCallback(() => {
    setIsModelReady(true);
  }, []);

  useEffect(() => {
    if (!loadingVeilRef.current) {
      return;
    }

    gsap.to(loadingVeilRef.current, {
      opacity: isModelReady ? 0 : 1,
      duration: isModelReady ? 0.5 : 0.2,
      ease: "power2.out",
      overwrite: true,
    });
  }, [isModelReady]);

  const preset = STAGE_PRESETS[stageMode];
  const cameraPosition =
    stageMode === "portrait"
      ? ([PORTRAIT_CAMERA.x, PORTRAIT_CAMERA.y, PORTRAIT_CAMERA.z] as [
          number,
          number,
          number,
        ])
      : ([0, 0.72, 4.1] as [number, number, number]);
  const isPortraitMode = stageMode === "portrait";
  const cameraConfig = isPortraitMode
    ? {
        position: cameraPosition,
        zoom: STAGE_PRESETS.portrait.orthographicZoom,
      }
    : {
        fov: preset.cameraFov,
        position: cameraPosition,
      };

  return (
    <section className={preset.stageClassName}>
      <div className={preset.canvasShellClassName}>
        <Canvas
          camera={cameraConfig}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(TRANSPARENT_CLEAR, 0);
          }}
          orthographic={isPortraitMode}
          style={{ background: "transparent", pointerEvents: "none" }}
        >
          <CharacterCameraRig
            isFocusMode={isFocusMode}
            stageMode={stageMode}
            targetLookAt={preset.targetLookAt}
          />
          <ambientLight intensity={1.1} />
          <directionalLight
            color="#ffe7cf"
            intensity={2.2}
            position={[0, 3, 3]}
          />
          <directionalLight
            color={accentColor}
            intensity={2.8}
            position={[1.4, 0.6, 2.6]}
          />
          <pointLight
            color={accentColor}
            intensity={12}
            position={[0, -0.1, 2.1]}
          />
          <pointLight color="#ffd7ab" intensity={8} position={[-1.2, 1.8, 2]} />
          <Suspense fallback={<HeroStageFallback />}>
            <CharacterCore
              auraScale={preset.auraScale}
              confidence={confidence}
              modelConfig={preset.modelConfig}
              onModelReady={handleModelReady}
              status={status}
            />
          </Suspense>
        </Canvas>
      </div>

      <div
        className="pointer-events-none absolute inset-x-[10%] bottom-[12%] top-[12%] z-1 rounded-[50%] bg-[radial-gradient(circle,rgba(98,240,229,0.04)_0%,rgba(63,211,255,0.02)_30%,rgba(5,7,13,0)_78%)] blur-3xl"
        ref={loadingVeilRef}
        style={{
          background: `radial-gradient(circle, ${accentColor}14 0%, rgba(63,211,255,0.02) 30%, rgba(5,7,13,0) 78%)`,
        }}
      />
    </section>
  );
};
