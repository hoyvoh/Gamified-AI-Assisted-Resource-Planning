import { normalizeAnalysisStatus, type AnalysisStatus } from "@/types/organization";

export interface AnimatedVector {
  y: number;
  z: number;
}

export interface AnimatedScale {
  setScalar: (value: number) => void;
}

export interface BasicMaterialRef {
  opacity: number;
}

export interface EmissiveMaterialRef extends BasicMaterialRef {
  emissiveIntensity: number;
}

export interface AnimatedMeshRef<TMaterial extends BasicMaterialRef = BasicMaterialRef> {
  rotation: AnimatedVector;
  position: AnimatedVector;
  scale: AnimatedScale;
  material: TMaterial;
  visible?: boolean;
}

export interface AnimatedGroupRef {
  rotation: AnimatedVector;
  position: AnimatedVector;
}

export const STATUS_COLORS: Record<AnalysisStatus, string> = {
  not_analyzed: "#64748b",
  analyzing: "#3fd3ff",
  completed: "#2ee6a6",
  failed: "#ff5c5c",
};

export const getStatusColor = (status: string | null | undefined): string =>
  STATUS_COLORS[normalizeAnalysisStatus(status)];
