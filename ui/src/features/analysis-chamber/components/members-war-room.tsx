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
            className="h-24 animate-pulse border border-amber-200/10 bg-[#1b120c]/70"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-amber-200/15 bg-[#ead5a6] p-4">
          <div className="mb-4 h-8 w-52 animate-pulse bg-[#7b4d20]/15" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse bg-[#7b4d20]/12" />
            ))}
          </div>
        </div>
        <div className="h-80 animate-pulse border border-amber-200/15 bg-[#1b120c]/75" />
      </div>
    </div>
  );
}

function MembersWarRoomError() {
  return (
    <div className="border border-red-300/25 bg-[#1b120c]/88 p-8 text-amber-50">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-200/70">
        Council records unavailable
      </p>
      <h2 className="mt-3 font-body-serif text-3xl">
        Backend connection failed
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-amber-50/65">
        The roster could not be loaded. Check that the backend is running and
        reachable, then refresh this page.
      </p>
    </div>
  );
}

function MembersWarRoomEmpty() {
  return (
    <div className="border border-amber-200/20 bg-[#1b120c]/88 p-8 text-center text-amber-50">
      <p className="font-body-serif text-2xl">
        No champions are on the roster.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex border border-amber-200/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100/70 transition hover:border-amber-200/45 hover:text-amber-50"
      >
        Return To Launcher
      </Link>
    </div>
  );
}
