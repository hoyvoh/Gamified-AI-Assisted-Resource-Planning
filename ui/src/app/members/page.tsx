import Link from "next/link";

import { MemberListTable } from "@/features/analysis-chamber/components/member-list-table";

export default function MembersPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs text-white/30 transition hover:text-white/60"
          >
            ← Launcher
          </Link>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Analysis Chamber
        </p>
        <h1 className="mt-1 font-display text-2xl uppercase tracking-wider text-white/90">
          Members
        </h1>

        <div className="mt-6">
          <MemberListTable />
        </div>
      </div>
    </main>
  );
}
