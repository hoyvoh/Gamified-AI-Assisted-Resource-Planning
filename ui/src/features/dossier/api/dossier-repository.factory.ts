import { createHttpDossierRepository } from "@/features/dossier/api/http-dossier.repository";
import { createMockDossierRepository } from "@/features/dossier/api/dossier-mock.repository";
import { shouldUseMockDossierData } from "@/features/dossier/config/dossier-runtime.config";
import type { DossierRepository } from "@/features/dossier/api/dossier.repository";

let instance: DossierRepository | null = null;

export const getDossierRepository = (): DossierRepository => {
  if (!instance) {
    instance = shouldUseMockDossierData()
      ? createMockDossierRepository()
      : createHttpDossierRepository();
  }
  return instance;
};
