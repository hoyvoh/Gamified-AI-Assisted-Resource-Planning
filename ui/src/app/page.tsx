import { AnalysisChamberLauncher } from "@/features/analysis-chamber/components/analysis-chamber-launcher";
import { PUBLIC_DEMO_MEMBER_ID } from "@/lib/config/env";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-xl text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-text-dim">
          Gamified 3D Intelligence System
        </p>
        <h1 className="mt-4 font-display text-4xl uppercase text-text-primary">
          Analysis Chamber
        </h1>
        <p className="mt-3 text-text-secondary">
          Open the analysis chamber to inspect a member profile, competency
          constellation, journey map, and KPT reflection.
        </p>
      </div>

      <AnalysisChamberLauncher initialMemberId={PUBLIC_DEMO_MEMBER_ID} />
    </main>
  );
}
