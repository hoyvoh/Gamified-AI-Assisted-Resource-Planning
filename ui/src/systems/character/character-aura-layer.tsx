"use client";

import type { RefObject } from "react";

import type { AnalysisStatus } from "@/types/organization";
import type { AnimatedMeshRef } from "@/systems/character/character-shared";

interface CharacterAuraLayerProps {
  color: string;
  status: AnalysisStatus;
  confidence: number;
  haloRef: RefObject<AnimatedMeshRef | null>;
  progressRingRef: RefObject<AnimatedMeshRef | null>;
  auraRefs: RefObject<Array<AnimatedMeshRef | null>>;
}

export const CharacterAuraLayer = ({
  color,
  status,
  confidence,
  haloRef,
  progressRingRef,
  auraRefs,
}: CharacterAuraLayerProps) => {
  const auraOpacityBoost = status === "completed" ? confidence * 0.08 : 0;

  return (
    <>
      <mesh ref={progressRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.17, 0]}>
        <torusGeometry args={[1.05, 0.02, 10, 96]} />
        <meshBasicMaterial color="#3fd3ff" opacity={0} transparent depthWrite={false} />
      </mesh>

      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]}>
        <ringGeometry args={[1.14, 1.26, 96]} />
        <meshBasicMaterial color={color} opacity={0.1 + auraOpacityBoost} transparent depthWrite={false} />
      </mesh>

      {[0, 1].map((index) => (
        <mesh
          key={`aura-${index}`}
          position={[0, 0.25, 0]}
          rotation={[0.42 + index * 0.24, index * 0.3, 0.1 * index]}
          ref={(node: AnimatedMeshRef | null) => {
            auraRefs.current[index] = node;
          }}
        >
          <torusGeometry args={[0.92 + index * 0.3, 0.012 - index * 0.001, 10, 96]} />
          <meshBasicMaterial color={color} opacity={0.14 + index * 0.025} transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};
