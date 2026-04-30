"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getAllMembersAcrossOrgs } from "@/features/analysis-chamber/api/analysis-chamber-api";
import { MembersWarRoomDossier } from "@/features/analysis-chamber/components/members-war-room-dossier";
import { MembersWarRoomLedger } from "@/features/analysis-chamber/components/members-war-room-ledger";
import { MembersWarRoomStateStrip } from "@/features/analysis-chamber/components/members-war-room-state-strip";
import {
  getWarRoomCounters,
  sortWarRoomMembers,
} from "@/features/analysis-chamber/lib/members-war-room";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export function MembersWarRoom() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["members-list"],
    queryFn: getAllMembersAcrossOrgs,
    staleTime: 30_000,
  });

  const sortedMembers = useMemo(() => sortWarRoomMembers(data ?? []), [data]);
  const counters = useMemo(
    () => getWarRoomCounters(sortedMembers),
    [sortedMembers],
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const selectedMember =
    sortedMembers.find((member) => member.memberId === selectedMemberId) ??
    sortedMembers[0] ??
    null;

  if (isLoading) {
    return <MembersWarRoomLoading />;
  }

  if (isError) {
    return <MembersWarRoomError />;
  }

  if (sortedMembers.length === 0) {
    return <MembersWarRoomEmpty />;
  }

  return (
    <div className="space-y-6">
      <MembersWarRoomStateStrip counters={counters} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <MembersWarRoomLedger
          members={sortedMembers}
          selectedMemberId={selectedMember?.memberId ?? ""}
          onSelectMember={(member) => setSelectedMemberId(member.memberId)}
        />
        {selectedMember ? (
          <MembersWarRoomDossier member={selectedMember} />
        ) : null}
      </div>
    </div>
  );
}

function MembersWarRoomLoading() {
  return (
    <div className="space-y-6" aria-label="Loading members">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse border"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.divider,
              backgroundImage: MEDIEVAL_THEME.gradients.shell,
            }}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="border p-4"
          style={{
            borderColor: MEDIEVAL_THEME.premiumNoir.divider,
            backgroundImage: MEDIEVAL_THEME.gradients.ledger,
          }}
        >
          <div
            className="mb-4 h-8 w-52 animate-pulse"
            style={{ backgroundColor: "rgba(216, 175, 99, 0.15)" }}
          />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse"
                style={{ backgroundColor: "rgba(216, 175, 99, 0.12)" }}
              />
            ))}
          </div>
        </div>
        <div
          className="h-80 animate-pulse border"
          style={{
            borderColor: MEDIEVAL_THEME.premiumNoir.divider,
            backgroundImage: MEDIEVAL_THEME.gradients.shell,
          }}
        />
      </div>
    </div>
  );
}

function MembersWarRoomError() {
  return (
    <div
      className="border p-8"
      style={{
        borderColor: MEDIEVAL_THEME.status.danger.border,
        backgroundImage: MEDIEVAL_THEME.gradients.shell,
        color: MEDIEVAL_THEME.text.primary,
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ color: MEDIEVAL_THEME.status.danger.text }}
      >
        Council records unavailable
      </p>
      <h2 className="mt-3 font-body-serif text-3xl">
        Backend connection failed
      </h2>
      <p
        className="mt-2 max-w-xl text-sm leading-6"
        style={{ color: MEDIEVAL_THEME.text.soft }}
      >
        The roster could not be loaded. Check that the backend is running and
        reachable, then refresh this page.
      </p>
    </div>
  );
}

function MembersWarRoomEmpty() {
  return (
    <div
      className="border p-8 text-center"
      style={{
        borderColor: MEDIEVAL_THEME.premiumNoir.divider,
        backgroundImage: MEDIEVAL_THEME.gradients.shell,
        color: MEDIEVAL_THEME.text.primary,
      }}
    >
      <p className="font-body-serif text-2xl">
        No champions are on the roster.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition"
        style={{
          borderColor: MEDIEVAL_THEME.premiumNoir.divider,
          color: MEDIEVAL_THEME.text.soft,
          backgroundImage: MEDIEVAL_THEME.gradients.secondaryButton,
        }}
      >
        Return To Launcher
      </Link>
    </div>
  );
}
