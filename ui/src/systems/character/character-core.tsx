"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import type { AnalysisStatus } from "@/types/organization";
import {
  CharacterModel,
  CHARACTER_MODEL_DEFAULT_CONFIG,
} from "@/systems/character/character-model";
import { CharacterParticleAura } from "@/systems/character/character-particle-aura";
import {
  AnimatedGroupRef,
  STATUS_COLORS,
} from "@/systems/character/character-shared";

interface CharacterCoreProps {
  status: AnalysisStatus;
  confidence: number;
  onModelReady?: () => void;
}

export const CharacterCore = ({
  status,
  confidence,
  onModelReady,
}: CharacterCoreProps) => {
  const bodyGroupRef = useRef<AnimatedGroupRef | null>(null);

  const color = STATUS_COLORS[status];

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = Math.sin(time * 0.25) * 0.1;
      bodyGroupRef.current.position.y = Math.sin(time * 0.7) * 0.012;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      <CharacterParticleAura
        color={color}
        confidence={confidence}
        status={status}
      />

      <group ref={bodyGroupRef}>
        <CharacterModel
          color={color}
          confidence={confidence}
          config={CHARACTER_MODEL_DEFAULT_CONFIG}
          onReady={onModelReady}
          status={status}
        />
      </group>
    </group>
  );
};
