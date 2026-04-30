"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { getAllMembersAcrossOrgs } from "@/features/analysis-chamber/api/analysis-chamber-api";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

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
  not_analyzed: "",
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
      <p className="font-mono text-sm" style={{ color: MEDIEVAL_THEME.text.muted }}>
        Loading members...
      </p>
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
      <div
        className="rounded-md border p-8 text-center"
        style={{
          borderColor: MEDIEVAL_THEME.premiumNoir.divider,
          background: MEDIEVAL_THEME.gradients.shell,
        }}
      >
        <p className="text-sm" style={{ color: MEDIEVAL_THEME.text.muted }}>
          No members found.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block font-mono text-xs underline transition"
          style={{ color: MEDIEVAL_THEME.text.soft }}
        >
          Create members from the launcher →
        </Link>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-md border"
      style={{
        borderColor: MEDIEVAL_THEME.premiumNoir.divider,
        background: MEDIEVAL_THEME.gradients.shell,
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="border-b"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.divider,
              background: MEDIEVAL_THEME.gradients.ledgerHeader,
            }}
          >
            {["Member", "GitHub", "Team", "Role", "Status", "Last scan", ""].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
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
    <tr
      className="border-b transition-colors last:border-0"
      style={{
        borderColor: "rgba(255,255,255,0.05)",
        backgroundImage: MEDIEVAL_THEME.gradients.idleRow,
      }}
    >
      <td className="px-4 py-3 font-medium" style={{ color: MEDIEVAL_THEME.text.primary }}>
        {member.displayName}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: MEDIEVAL_THEME.text.muted }}>
        {member.externalId ?? "—"}
      </td>
      <td className="px-4 py-3" style={{ color: MEDIEVAL_THEME.text.soft }}>{member.teamName}</td>
      <td className="px-4 py-3" style={{ color: MEDIEVAL_THEME.text.soft }}>{member.roleName ?? "—"}</td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[member.analysisStatus]}`}
            style={
              member.analysisStatus === "not_analyzed"
                ? { background: "rgba(233, 221, 208, 0.24)" }
                : undefined
            }
          />
          <span style={{ color: MEDIEVAL_THEME.text.soft }}>
            {STATUS_LABEL[member.analysisStatus]}
          </span>
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: MEDIEVAL_THEME.text.dim }}>
        {member.lastAnalysisAt ? member.lastAnalysisAt.slice(0, 10) : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/members/${member.memberId}/scan`}
          className="rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition"
          style={{
            borderColor: MEDIEVAL_THEME.premiumNoir.divider,
            color: MEDIEVAL_THEME.text.soft,
            backgroundImage: MEDIEVAL_THEME.gradients.secondaryButton,
          }}
        >
          Open Lobby
        </Link>
      </td>
    </tr>
  );
}
