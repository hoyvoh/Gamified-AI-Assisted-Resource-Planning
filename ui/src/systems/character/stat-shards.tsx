"use client";

import type { RefObject } from "react";

import type { AnalysisStatus } from "@/types/organization";
import type {
  AnimatedGroupRef,
  AnimatedMeshRef,
} from "@/systems/character/character-shared";

interface StatShardsProps {
  color: string;
  status: AnalysisStatus;
  trailGroupRef: RefObject<AnimatedGroupRef | null>;
  lineRefs: RefObject<Array<AnimatedMeshRef | null>>;
}

export const StatShards = ({
  color,
  status,
  trailGroupRef,
  lineRefs,
}: StatShardsProps) => {
  const shardOpacity = status === "failed" ? 0.18 : 0.12;

  return (
    <>
      <group ref={trailGroupRef}>
        {[0, 1, 2].map((index) => (
          <mesh
            key={`trail-${index}`}
            position={[0, -0.55 + index * 0.3, -0.8 + index * 0.2]}
            rotation={[Math.PI / 2.2, index * 0.45, 0]}
            ref={(node: AnimatedMeshRef | null) => {
              lineRefs.current[index] = node;
            }}
          >
            <torusGeometry args={[0.85 + index * 0.12, 0.004, 8, 80]} />
            <meshBasicMaterial color={color} opacity={shardOpacity} transparent depthWrite={false} />
          </mesh>
        ))}
      </group>

      {[-1, 1].map((direction) => (
        <mesh
          key={`plate-${direction > 0 ? "right" : "left"}`}
          position={[direction * 0.96, 0.28, -0.12]}
          rotation={[0.18, direction * 0.4, direction * 0.24]}
        >
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial color={color} opacity={0.34} transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};
