"use client";

import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect } from "react";

import type { AnalysisStatus } from "@/types/organization";
import { DOSSIER_MOTION } from "@/features/dossier/constants/dossier.constants";
import { CharacterCore } from "@/systems/character/character-core";

interface CharacterStageProps {
  confidence: number;
  status: AnalysisStatus;
  isFocusMode: boolean;
}

interface CharacterCameraRigProps {
  isFocusMode: boolean;
}

const DEFAULT_CAMERA = {
  x: 0,
  y: 0.72,
  z: 4.1,
} as const;

const FOCUS_CAMERA = {
  x: 0,
  y: 0.84,
  z: 3.4,
} as const;

const CHARACTER_LOOK_AT = {
  x: 0,
  y: 0.2,
  z: 0,
} as const;

const CharacterCameraRig = ({ isFocusMode }: CharacterCameraRigProps) => {
  const { camera } = useThree();

  useEffect(() => {
    const target = isFocusMode ? FOCUS_CAMERA : DEFAULT_CAMERA;

    const tween = gsap.to(camera.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: DOSSIER_MOTION.cameraFocusDuration,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(
          CHARACTER_LOOK_AT.x,
          CHARACTER_LOOK_AT.y,
          CHARACTER_LOOK_AT.z,
        );
      },
    });

    return () => {
      tween.kill();
    };
  }, [camera, isFocusMode]);

  return null;
};

export const CharacterStage = ({
  confidence,
  status,
  isFocusMode,
}: CharacterStageProps) => {
  return (
    <section className="relative min-h-[34rem] pt-4 xl:min-h-[calc(100vh-180px)] xl:pt-6">
      <div className="absolute inset-x-0 bottom-0 top-4 xl:top-6">
        <div className="absolute inset-x-[14%] bottom-8 top-10 rounded-[50%] bg-[radial-gradient(circle,_rgba(96,238,226,0.16),_rgba(63,211,255,0.05)_34%,_transparent_68%)] blur-3xl" />
        <div className="absolute inset-x-[8%] bottom-10 top-0 bg-[radial-gradient(circle_at_50%_28%,_rgba(173,255,240,0.1),_transparent_22%),radial-gradient(circle_at_50%_80%,_rgba(63,211,255,0.08),_transparent_28%)]" />
        <div className="absolute inset-x-[30%] bottom-8 top-10 bg-[linear-gradient(180deg,rgba(191,255,247,0.08),rgba(63,211,255,0.03)_35%,transparent_80%)] blur-2xl" />
        <div className="absolute inset-x-[10%] bottom-12 top-12 bg-[radial-gradient(circle_at_50%_40%,_rgba(156,255,240,0.08),_transparent_30%),radial-gradient(circle_at_48%_76%,_rgba(63,211,255,0.12),_transparent_24%)] opacity-80" />
        <div className="absolute inset-x-[22%] bottom-0 h-28 rounded-[50%] bg-[radial-gradient(circle,_rgba(63,211,255,0.18),_rgba(28,91,118,0.08)_44%,_transparent_72%)] blur-2xl" />
      </div>

      <div className="absolute inset-x-0 bottom-0 top-4 xl:top-6">
        <Canvas camera={{ position: [0, 0.72, 4.1], fov: 34 }}>
          <CharacterCameraRig isFocusMode={isFocusMode} />
          <ambientLight intensity={1.1} />
          <directionalLight color="#ffe7cf" intensity={2.2} position={[0, 3, 3]} />
          <directionalLight color="#ff9c5f" intensity={2.8} position={[1.4, 0.6, 2.6]} />
          <pointLight color="#ff7c4d" intensity={12} position={[0, -0.1, 2.1]} />
          <pointLight color="#ffd7ab" intensity={8} position={[-1.2, 1.8, 2]} />
          <CharacterCore confidence={confidence} status={status} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-[18%] bottom-6 h-28 rounded-[50%] border border-white/10 bg-[radial-gradient(circle,_rgba(213,252,246,0.14),_rgba(9,25,36,0.16)_45%,_transparent_75%)] shadow-[0_18px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]" />
      <div className="pointer-events-none absolute inset-x-[25%] bottom-10 h-7 rounded-[50%] bg-[radial-gradient(circle,_rgba(140,247,232,0.34),_rgba(63,211,255,0.12)_58%,_transparent_90%)] blur-xl" />
      <div className="pointer-events-none absolute inset-x-[8%] bottom-4 flex justify-center">
        <div className="h-px w-[72%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </section>
  );
};
