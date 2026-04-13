"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

import {
  DOSSIER_PARTICLE_AURA,
} from "@/features/dossier/constants/dossier.constants";
import { normalizeAnalysisStatus, type AnalysisStatus } from "@/types/organization";
import type {
  AnimatedGroupRef,
  BasicMaterialRef,
} from "@/systems/character/character-shared";

interface ParticleMaterialRef extends BasicMaterialRef {
  size: number;
}

interface ParticlePointsRef {
  material: ParticleMaterialRef;
}

interface CharacterParticleAuraProps {
  color: string;
  confidence: number;
  status: AnalysisStatus;
}

const STATUS_SPEED_MULTIPLIER: Record<AnalysisStatus, number> = {
  not_analyzed: 0.78,
  analyzing: 1.42,
  completed: 1,
  failed: 0.9,
};

const STATUS_OPACITY_MULTIPLIER: Record<AnalysisStatus, number> = {
  not_analyzed: 0.72,
  analyzing: 1.08,
  completed: 1,
  failed: 0.82,
};

const getLerpValue = (start: number, end: number, ratio: number) =>
  start + (end - start) * ratio;

export const CharacterParticleAura = ({
  color,
  confidence,
  status,
}: CharacterParticleAuraProps) => {
  const resolvedStatus = normalizeAnalysisStatus(status);
  const particleGroupRef = useRef<AnimatedGroupRef | null>(null);
  const particleRef = useRef<ParticlePointsRef | null>(null);

  const particleConfig = useMemo(() => {
    const normalizedConfidence = Math.min(Math.max(confidence, 0), 1);
    const count = Math.round(
      getLerpValue(
        DOSSIER_PARTICLE_AURA.minCount,
        DOSSIER_PARTICLE_AURA.maxCount,
        normalizedConfidence,
      ),
    );
    const radius = getLerpValue(
      DOSSIER_PARTICLE_AURA.minRadius,
      DOSSIER_PARTICLE_AURA.maxRadius,
      normalizedConfidence,
    );
    const height = getLerpValue(
      DOSSIER_PARTICLE_AURA.minHeight,
      DOSSIER_PARTICLE_AURA.maxHeight,
      normalizedConfidence,
    );

    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      const orbitAngle = progress * Math.PI * 2 * 2.6;
      const radialBias = 0.72 + (index % 7) * 0.06;
      const verticalWave = Math.sin(progress * Math.PI * 3.5) * 0.26;
      const particleRadius = radius * radialBias;

      positions[index * 3] = Math.cos(orbitAngle) * particleRadius;
      positions[index * 3 + 1] =
        -0.2 + progress * height + verticalWave;
      positions[index * 3 + 2] = Math.sin(orbitAngle) * particleRadius * 0.82;
    }

    return {
      count,
      positions,
      speed: getLerpValue(
        DOSSIER_PARTICLE_AURA.minSpeed,
        DOSSIER_PARTICLE_AURA.maxSpeed,
        normalizedConfidence,
      ),
      opacity:
        DOSSIER_PARTICLE_AURA.pointOpacity *
        STATUS_OPACITY_MULTIPLIER[resolvedStatus],
    };
  }, [confidence, resolvedStatus]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const rotationSpeed =
      particleConfig.speed * STATUS_SPEED_MULTIPLIER[resolvedStatus];

    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y = elapsedTime * rotationSpeed;
      particleGroupRef.current.rotation.z =
        Math.sin(elapsedTime * 0.24) * 0.16;
    }

    if (particleRef.current) {
      particleRef.current.material.opacity =
        particleConfig.opacity +
        Math.sin(elapsedTime * 1.4) * 0.04;
      particleRef.current.material.size =
        DOSSIER_PARTICLE_AURA.pointSize +
        Math.sin(elapsedTime * 1.1) * 0.002;
    }
  });

  return (
    <group ref={particleGroupRef} position={[0, -0.18, 0]}>
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[particleConfig.positions, 3]}
            attach="attributes-position"
            count={particleConfig.count}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          opacity={particleConfig.opacity}
          size={DOSSIER_PARTICLE_AURA.pointSize}
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
};
