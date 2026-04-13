import { Suspense } from "react";

import { DossierPageContent } from "@/app/dossier/dossier-page-content";

export default function DossierPage() {
  return (
    <Suspense fallback={null}>
      <DossierPageContent />
    </Suspense>
  );
}
