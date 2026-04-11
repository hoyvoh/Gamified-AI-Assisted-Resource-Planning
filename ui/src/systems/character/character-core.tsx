"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import type { AnalysisStatus } from "@/types/organization";
import { CharacterAuraLayer } from "@/systems/character/character-aura-layer";
import { CharacterParticleAura } from "@/systems/character/character-particle-aura";
import {
  AnimatedGroupRef,
  AnimatedMeshRef,
  EmissiveMaterialRef,
  STATUS_COLORS,
} from "@/systems/character/character-shared";
import { StatShards } from "@/systems/character/stat-shards";

interface CharacterCoreProps {
  status: AnalysisStatus;
  confidence: number;
}

export const CharacterCore = ({ status, confidence }: CharacterCoreProps) => {
  const bodyGroupRef = useRef<AnimatedGroupRef | null>(null);
  const torsoRef = useRef<AnimatedMeshRef<EmissiveMaterialRef> | null>(null);
  const headRef = useRef<AnimatedMeshRef<EmissiveMaterialRef> | null>(null);
  const haloRef = useRef<AnimatedMeshRef | null>(null);
  const baseDiscRef = useRef<AnimatedMeshRef | null>(null);
  const progressRingRef = useRef<AnimatedMeshRef | null>(null);
  const trailGroupRef = useRef<AnimatedGroupRef | null>(null);
  const auraRefs = useRef<Array<AnimatedMeshRef | null>>([]);
  const lineRefs = useRef<Array<AnimatedMeshRef | null>>([]);

  const color = STATUS_COLORS[status];

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const speed = status === "analyzing" ? 1.9 : status === "failed" ? 1.15 : 0.7;
    const glow = status === "analyzing" ? 1.7 : status === "completed" ? 1.05 : status === "failed" ? 1.25 : 0.5;

    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = Math.sin(time * 0.25) * 0.1;
      bodyGroupRef.current.position.y = Math.sin(time * 0.7) * 0.04;
    }

    if (torsoRef.current) {
      const pulse = 1 + Math.sin(time * speed) * (status === "analyzing" ? 0.05 : 0.02);
      torsoRef.current.scale.setScalar(pulse);
      torsoRef.current.material.emissiveIntensity = glow + Math.sin(time * speed) * 0.12;
    }

    if (headRef.current) {
      headRef.current.position.y = 1.62 + Math.sin(time * speed * 0.75) * 0.03;
      headRef.current.material.emissiveIntensity = glow * 0.65;
    }

    auraRefs.current.forEach((ring, index) => {
      if (!ring) {
        return;
      }

      ring.rotation.z = time * speed * (0.15 + index * 0.05) * (index % 2 === 0 ? 1 : -1);
      ring.material.opacity =
        (0.14 + index * 0.04) * (status === "completed" ? 0.95 : status === "failed" ? 0.85 : 1);
    });

    if (haloRef.current) {
      haloRef.current.material.opacity =
        0.08 +
        Math.sin(time * (status === "failed" ? 1.3 : 0.9)) *
          (status === "failed" ? 0.03 : 0.015) +
        confidence * 0.12;
      haloRef.current.scale.setScalar(1 + Math.sin(time * 0.7) * 0.03);
    }

    if (baseDiscRef.current) {
      baseDiscRef.current.material.opacity =
        0.08 + Math.sin(time * speed) * 0.02 + (status === "completed" ? confidence * 0.03 : 0);
    }

    if (progressRingRef.current) {
      progressRingRef.current.visible = status === "analyzing";
      progressRingRef.current.rotation.z = -time * 1.8;
      progressRingRef.current.material.opacity = status === "analyzing" ? 0.75 : 0;
    }

    if (trailGroupRef.current) {
      trailGroupRef.current.rotation.y = time * 0.18;
    }

    lineRefs.current.forEach((line, index) => {
      if (!line) {
        return;
      }

      line.position.y = -0.5 + index * 0.28 + Math.sin(time * 0.9 + index) * 0.05;
      line.material.opacity = 0.12 + Math.sin(time * 1.1 + index) * 0.04;
    });
  });

  return (
    <group position={[0, -0.15, 0]}>
      <CharacterParticleAura
        color={color}
        confidence={confidence}
        status={status}
      />

      <StatShards
        color={color}
        lineRefs={lineRefs}
        status={status}
        trailGroupRef={trailGroupRef}
      />

      <mesh ref={baseDiscRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[1.45, 40]} />
        <meshBasicMaterial color={color} opacity={0.08} transparent depthWrite={false} />
      </mesh>

      <group ref={bodyGroupRef}>
        <CharacterAuraLayer
          auraRefs={auraRefs}
          color={color}
          confidence={confidence}
          haloRef={haloRef}
          progressRingRef={progressRingRef}
          status={status}
        />

        <mesh ref={torsoRef} position={[0, 0.08, 0]}>
          <capsuleGeometry args={[0.38, 0.98, 10, 18]} />
          <meshStandardMaterial
            color="#0f1b25"
            emissive={color}
            emissiveIntensity={0.82}
            metalness={0.5}
            roughness={0.44}
            transparent
            opacity={0.88}
          />
        </mesh>

        <mesh position={[0, 0.1, 0.08]} scale={[0.42, 0.8, 0.34]}>
          <capsuleGeometry args={[0.32, 0.74, 10, 14]} />
          <meshBasicMaterial color={color} opacity={0.22 + confidence * 0.1} transparent depthWrite={false} />
        </mesh>

        <mesh ref={headRef} position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.33, 18, 18]} />
          <meshStandardMaterial
            color="#101c27"
            emissive={color}
            emissiveIntensity={0.56}
            metalness={0.18}
            roughness={0.54}
            wireframe
          />
        </mesh>
      </group>
    </group>
  );
};
