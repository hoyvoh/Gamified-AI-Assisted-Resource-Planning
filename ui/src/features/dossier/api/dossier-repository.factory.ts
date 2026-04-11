import { createMockDossierRepository } from "@/features/dossier/api/dossier-mock.repository";
import type { DossierRepository } from "@/features/dossier/api/dossier.repository";

let instance: DossierRepository | null = null;

export const getDossierRepository = (): DossierRepository => {
  if (!instance) {
    instance = createMockDossierRepository();
  }
  return instance;
};
