"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type {
  Group,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { Box3, Color, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useEffect, useMemo, useRef } from "react";

import { normalizeAnalysisStatus, type AnalysisStatus } from "@/types/organization";

export interface CharacterModelConfig {
  src: string;
  targetHeight: number;
  pedestalOffset: number;
  baseRotationY: number;
  hideMeshNames?: string[];
  preferredAnimation?: string | null;
}

interface CharacterModelProps {
  color: string;
  confidence: number;
  status: AnalysisStatus;
  config: CharacterModelConfig;
  onReady?: () => void;
}

const STATUS_EMISSIVE_INTENSITY: Record<AnalysisStatus, number> = {
  not_analyzed: 0.08,
  analyzing: 0.42,
  completed: 0.24,
  failed: 0.3,
};

export const CHARACTER_MODEL_DEFAULT_CONFIG: CharacterModelConfig = {
  src: "/models/character.glb",
  targetHeight: 2.02,
  pedestalOffset: -0.96,
  baseRotationY: 0,
  hideMeshNames: ["Cube"],
  preferredAnimation: null,
};

const isLitMaterial = (
  material: Material,
): material is MeshStandardMaterial | MeshPhysicalMaterial =>
  "emissive" in material && "emissiveIntensity" in material;

const resolveAnimationName = (
  availableNames: string[],
  preferredAnimation: string | null | undefined,
): string | null => {
  if (preferredAnimation && availableNames.includes(preferredAnimation)) {
    return preferredAnimation;
  }

  return availableNames[0] ?? null;
};

const getFitTransform = (
  scene: Object3D,
  targetHeight: number,
  pedestalOffset: number,
) => {
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  const center = new Vector3();

  box.getSize(size);
  box.getCenter(center);

  const safeHeight = size.y > 0 ? size.y : 1;
  const scale = targetHeight / safeHeight;
  const groundedY = pedestalOffset - box.min.y * scale;

  return {
    scale,
    position: new Vector3(-center.x * scale, groundedY, -center.z * scale),
  };
};

export const CharacterModel = ({
  color,
  confidence,
  status,
  config,
  onReady,
}: CharacterModelProps) => {
  const resolvedStatus = normalizeAnalysisStatus(status);
  const mergedConfig = {
    ...CHARACTER_MODEL_DEFAULT_CONFIG,
    ...config,
  };
  const modelGroupRef = useRef<Group | null>(null);
  const gltf = useGLTF(mergedConfig.src);
  const clonedScene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const fitTransform = useMemo(
    () =>
      getFitTransform(
        clonedScene,
        mergedConfig.targetHeight,
        mergedConfig.pedestalOffset,
      ),
    [clonedScene, mergedConfig.targetHeight, mergedConfig.pedestalOffset],
  );
  const { actions } = useAnimations(gltf.animations, modelGroupRef);
  const emissiveColor = useMemo(() => new Color(color), [color]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      const mesh = child as Mesh;

      if (!("isMesh" in mesh) || !mesh.isMesh) {
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (mergedConfig.hideMeshNames?.includes(mesh.name)) {
        mesh.visible = false;
      }

      const material = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;

      if (material && isLitMaterial(material)) {
        material.emissive = emissiveColor.clone();
        material.emissiveIntensity =
          STATUS_EMISSIVE_INTENSITY[resolvedStatus] * 0.6;
      }
    });
  }, [clonedScene, emissiveColor, mergedConfig.hideMeshNames, resolvedStatus]);

  useEffect(() => {
    const animationName = resolveAnimationName(
      gltf.animations.map((clip) => clip.name),
      mergedConfig.preferredAnimation,
    );

    if (!animationName) {
      return;
    }

    const action = actions[animationName];

    if (!action) {
      return;
    }

    action.reset();
    action.fadeIn(0.35);
    action.play();

    return () => {
      action.fadeOut(0.25);
      action.stop();
    };
  }, [actions, gltf.animations, mergedConfig.preferredAnimation]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const speed =
      resolvedStatus === "analyzing"
        ? 1.9
        : resolvedStatus === "failed"
          ? 1.15
          : 0.7;
    const pulse =
      1 +
      Math.sin(time * speed) * (resolvedStatus === "analyzing" ? 0.024 : 0.01);

    if (!modelGroupRef.current) {
      return;
    }

    modelGroupRef.current.scale.setScalar(fitTransform.scale * pulse);
    modelGroupRef.current.rotation.y =
      mergedConfig.baseRotationY + Math.sin(time * 0.45) * 0.12;
    modelGroupRef.current.position.x = fitTransform.position.x;
    modelGroupRef.current.position.y =
      fitTransform.position.y + Math.sin(time * 0.6) * 0.025;
    modelGroupRef.current.position.z = fitTransform.position.z;

    modelGroupRef.current.traverse((child) => {
      const mesh = child as Mesh;

      if (!("isMesh" in mesh) || !mesh.isMesh) {
        return;
      }

      const material = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;

      if (material && isLitMaterial(material)) {
        material.emissive.copy(emissiveColor);
        material.emissiveIntensity =
          STATUS_EMISSIVE_INTENSITY[resolvedStatus] +
          Math.sin(time * speed) *
            (resolvedStatus === "analyzing" ? 0.12 : 0.04) +
          confidence * 0.05;
      }
    });
  });

  return (
    <group ref={modelGroupRef}>
      <primitive object={clonedScene} />
    </group>
  );
};
