"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { getAllMembersAcrossOrgs } from "@/features/analysis-chamber/api/analysis-chamber-api";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import type { AnalysisStatus } from "@/types/organization";

// ─── Status display config ────────────────────────────────────────────────────

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  completed: "Completed",
  analyzing: "Analyzing...",
  not_analyzed: "Not analyzed",
  failed: "Failed",
};

const STATUS_DOT: Record<AnalysisStatus, string> = {
  completed: "bg-green-400",
  analyzing: "bg-blue-400 animate-pulse",
  not_analyzed: "bg-white/20",
  failed: "bg-red-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MemberListTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["members-list"],
    queryFn: getAllMembersAcrossOrgs,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <p className="font-mono text-sm text-white/40">Loading members...</p>
    );
  }

  if (isError) {
    return (
      <p className="font-mono text-sm text-red-400">
        Failed to load members. Is the backend running?
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border border-white/10 p-8 text-center">
        <p className="text-sm text-white/40">No members found.</p>
        <Link
          href="/"
          className="mt-3 inline-block font-mono text-xs text-white/50 underline hover:text-white/80"
        >
          Create members from the launcher →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {["Member", "GitHub", "Team", "Role", "Status", "Last scan", ""].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-white/40"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((member) => (
            <MemberRow key={member.memberId} member={member} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: FlatMemberRow }) {
  return (
    <tr className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]">
      <td className="px-4 py-3 font-medium text-white/90">
        {member.displayName}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-white/50">
        {member.externalId ?? "—"}
      </td>
      <td className="px-4 py-3 text-white/60">{member.teamName}</td>
      <td className="px-4 py-3 text-white/60">{member.roleName ?? "—"}</td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[member.analysisStatus]}`}
          />
          <span className="text-white/60">
            {STATUS_LABEL[member.analysisStatus]}
          </span>
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-white/40">
        {member.lastAnalysisAt ? member.lastAnalysisAt.slice(0, 10) : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/members/${member.memberId}/scan`}
          className="rounded border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60 transition hover:border-white/30 hover:text-white/90"
        >
          Open Lobby
        </Link>
      </td>
    </tr>
  );
}
