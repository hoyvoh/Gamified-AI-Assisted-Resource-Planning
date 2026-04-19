"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

interface AnalysisChamberLauncherProps {
  initialMemberId?: string;
}

export const AnalysisChamberLauncher = ({
  initialMemberId = "",
}: AnalysisChamberLauncherProps) => {
  const router = useRouter();
  const [memberId, setMemberId] = useState(initialMemberId);
  const normalizedMemberId = useMemo(() => memberId.trim(), [memberId]);
  const canOpen = normalizedMemberId.length > 0;

  const openChamber = () => {
    if (!canOpen) {
      return;
    }

    router.push(`/profile/${encodeURIComponent(normalizedMemberId)}`);
  };

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        openChamber();
      }}
    >
      <label className="sr-only" htmlFor="member-id">
        Member ID
      </label>
      <input
        className="min-h-12 flex-1 rounded-md border border-white/10 bg-white/5 px-4 text-sm text-text-primary outline-none transition placeholder:text-text-dim focus:border-white/30"
        id="member-id"
        onChange={(event) => setMemberId(event.target.value)}
        placeholder="member-id-from-seed-output"
        value={memberId}
      />
      <button
        className="min-h-12 rounded-md border border-white/10 bg-white/5 px-5 font-display text-xs uppercase tracking-[0.16em] text-text-primary transition duration-300 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={!canOpen}
        type="submit"
      >
        Open analysis chamber
      </button>
    </form>
  );
};
