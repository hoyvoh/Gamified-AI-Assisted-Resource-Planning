import type { DossierTab } from "@/features/dossier/types/dossier.types";

export type SceneDirection = "up" | "down";

export interface DossierChapterDefinition {
  accentColor: string;
  description: string;
  icon: string;
  id: DossierTab;
  title: string;
}
