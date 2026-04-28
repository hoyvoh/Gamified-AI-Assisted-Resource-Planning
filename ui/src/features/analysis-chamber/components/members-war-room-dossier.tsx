import Link from "next/link";

import { cn } from "@/lib/utils";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  formatWarRoomDate,
  getWarRoomAction,
  getWarRoomStatusDisplay,
} from "@/features/analysis-chamber/lib/members-war-room";

const STATUS_TONE_CLASS = {
  active: "border-[#617495]/42 text-[#b7c6dc] bg-[#18202c]",
  danger: "border-[#8f4538]/45 text-[#e4aea2] bg-[#241412]",
  idle: "border-[#8f826d]/30 text-[#d5c6a8] bg-[#231b14]",
  ready: "border-[#4d684f]/45 text-[#bad1bd] bg-[#172019]",
  unknown: "border-[#b68a44]/30 text-[#ead9b7] bg-[#261d14]",
};

type MembersWarRoomDossierProps = {
  member: FlatMemberRow;
};

export function MembersWarRoomDossier({ member }: MembersWarRoomDossierProps) {
  const status = getWarRoomStatusDisplay(member.analysisStatus);
  const action = getWarRoomAction(member.memberId, member.analysisStatus);

  return (
    <aside
      aria-labelledby="royal-dossier-title"
      className="border border-[#9f773d]/28 bg-[linear-gradient(180deg,rgba(29,20,14,0.96),rgba(14,11,9,0.98))] p-5 text-[#f1e1bf] shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-8"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d1ac67]/72">
        Royal Dossier
      </p>
      <h2
        id="royal-dossier-title"
        className="mt-2 font-body-serif text-3xl leading-8 text-[#f4e6c8]"
      >
        {member.displayName}
      </h2>
      <p className="mt-2 font-mono text-xs text-[#d8c19b]/46">
        {member.externalId ?? "No external handle"}
      </p>

      <div
        className={cn(
          "mt-5 border px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
          STATUS_TONE_CLASS[status.tone],
        )}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-current/60">
          Campaign State
        </p>
        <p className="mt-1 font-body-serif text-2xl leading-none">
          {status.label}
        </p>
        <p className="mt-2 text-sm leading-6 text-current/70">
          {status.meaning}
        </p>
      </div>

      <dl className="mt-5 space-y-4">
        <DossierField label="House" value={member.teamName} />
        <DossierField label="Calling" value={member.roleName ?? "Unassigned"} />
        <DossierField
          label="Last Campaign"
          value={formatWarRoomDate(member.lastAnalysisAt)}
        />
        <DossierField label="Next Order" value={action.recommendation} />
      </dl>

      <Link
        href={action.href}
        className="mt-6 inline-flex min-h-10 w-full items-center justify-center border border-[#b89254]/44 bg-[linear-gradient(180deg,#d8b362,#c79a49)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#24170c] transition hover:bg-[linear-gradient(180deg,#e2bf78,#d0a454)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89254]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18120d]"
      >
        {action.label}
      </Link>
    </aside>
  );
}

type DossierFieldProps = {
  label: string;
  value: string;
};

function DossierField({ label, value }: DossierFieldProps) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#d1ac67]/54">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-[#ecdec3]/82">{value}</dd>
    </div>
  );
}
