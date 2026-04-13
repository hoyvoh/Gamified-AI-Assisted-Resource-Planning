import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-xl text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-text-dim">
          Gamified 3D Intelligence System
        </p>
        <h1 className="mt-4 font-display text-4xl uppercase text-text-primary">
          Enter the dossier chamber
        </h1>
        <p className="mt-3 text-text-secondary">
          This branch is currently focused on the dossier experience. Use the
          entry point below to inspect the active member dossier instead of
          staying on a static placeholder screen.
        </p>
      </div>

      <Link
        className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-display uppercase tracking-[0.16em] text-text-primary transition duration-300 hover:-translate-y-0.5"
        href="/dossier?id=mem-001"
      >
        Open dossier
      </Link>
    </main>
  );
}
