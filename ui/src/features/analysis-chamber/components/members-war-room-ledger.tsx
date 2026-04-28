import Link from "next/link";

import { cn } from "@/lib/utils";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  getWarRoomAction,
  getWarRoomStatusDisplay,
} from "@/features/analysis-chamber/lib/members-war-room";

const STATUS_TONE_CLASS = {
  active: "border-[#617495]/44 bg-[#1d2430] text-[#b7c6dc]",
  danger: "border-[#8f4538]/46 bg-[#281613] text-[#e4aea2]",
  idle: "border-[#8f826d]/32 bg-[#241c14] text-[#d6c6a7]",
  ready: "border-[#4d684f]/46 bg-[#172019] text-[#bad1bd]",
  unknown: "border-[#b68a44]/34 bg-[#261d14] text-[#ead9b7]",
};

type MembersWarRoomLedgerProps = {
  members: FlatMemberRow[];
  selectedMemberId: string;
  onSelectMember: (member: FlatMemberRow) => void;
};

export function MembersWarRoomLedger({
  members,
  selectedMemberId,
  onSelectMember,
}: MembersWarRoomLedgerProps) {
  return (
    <section aria-labelledby="campaign-ledger-title">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(209, 172, 103, 0.72)" }}
          >
            Campaign Ledger
          </p>
          <h2
            id="campaign-ledger-title"
            className="font-body-serif text-2xl"
            style={{ color: MEDIEVAL_THEME.text.primary }}
          >
            War Council Ledger
          </h2>
        </div>
      </div>

      <div
        className="overflow-hidden border text-[#f3e3c1]"
        style={{
          borderColor: "rgba(161, 119, 55, 0.28)",
          backgroundImage: MEDIEVAL_THEME.gradients.ledger,
          color: MEDIEVAL_THEME.text.primary,
          boxShadow: MEDIEVAL_THEME.effects.panelShadow,
        }}
      >
        <div
          className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(150px,0.9fr)_140px] border-b px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] lg:grid"
          aria-hidden="true"
          style={{
            borderColor: "rgba(111, 82, 39, 0.45)",
            backgroundImage: MEDIEVAL_THEME.gradients.ledgerHeader,
            color: "rgba(212, 188, 144, 0.72)",
          }}
        >
          <span>Champion</span>
          <span>House</span>
          <span>Calling</span>
          <span>Campaign State</span>
          <span className="text-right">Order</span>
        </div>

        <div className="divide-y divide-[#6c5027]/28">
          {members.map((member) => (
            <LedgerRow
              key={member.memberId}
              member={member}
              isSelected={member.memberId === selectedMemberId}
              onSelect={() => onSelectMember(member)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type LedgerRowProps = {
  member: FlatMemberRow;
  isSelected: boolean;
  onSelect: () => void;
};

function LedgerRow({ member, isSelected, onSelect }: LedgerRowProps) {
  const status = getWarRoomStatusDisplay(member.analysisStatus);
  const action = getWarRoomAction(member.memberId, member.analysisStatus);

  return (
    <article
      className={cn(
        "relative grid gap-3 px-4 py-4 transition-colors lg:grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(150px,0.9fr)_140px] lg:items-center",
        isSelected
          ? "shadow-[inset_0_1px_0_rgba(245,228,190,0.05)]"
          : "hover:bg-[linear-gradient(90deg,rgba(112,79,34,0.14),rgba(27,20,15,0.72)_16%,rgba(18,14,11,0.94)_100%)]",
      )}
      style={{
        backgroundImage: isSelected
          ? MEDIEVAL_THEME.gradients.selectedRow
          : MEDIEVAL_THEME.gradients.idleRow,
      }}
    >
      {isSelected ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,#caa35c,#7f5a28)]"
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="min-w-0 cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#9e7540]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18120d]"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-9 shrink-0 place-items-center border border-[#8d6a36]/40 bg-[linear-gradient(180deg,rgba(163,121,54,0.18),rgba(29,22,15,0.3))] font-mono text-xs font-semibold text-[#e3c480] [clip-path:polygon(10%_0,90%_0,90%_72%,50%_100%,10%_72%)]">
            {member.displayName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block font-body-serif text-xl leading-6 text-[#f3e3c1]">
              {member.displayName}
            </span>
            <span className="mt-1 block truncate font-mono text-[11px] text-[#b89d71]/72">
              {member.externalId ?? "No external handle"}
            </span>
          </span>
        </div>
      </button>

      <LedgerMobileLabel label="House" value={member.teamName} />
      <LedgerMobileLabel
        label="Calling"
        value={member.roleName ?? "Unassigned"}
      />

      <div>
        <span
          className={cn(
            "inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
            STATUS_TONE_CLASS[status.tone],
          )}
        >
          {status.label}
        </span>
        <p className="mt-1 text-xs leading-5 text-[#bfa987]/72">
          {status.meaning}
        </p>
      </div>

      <div className="lg:text-right">
        <Link
          href={action.href}
          className="inline-flex min-h-9 items-center justify-center border border-[#8d6934]/45 bg-[linear-gradient(180deg,#2d2116,#211811)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e9d3a6] transition hover:border-[#b78a45]/60 hover:bg-[linear-gradient(180deg,#3a2b1b,#281d13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d7542]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18120d]"
        >
          {action.label}
        </Link>
      </div>
    </article>
  );
}

type LedgerMobileLabelProps = {
  label: string;
  value: string;
};

function LedgerMobileLabel({ label, value }: LedgerMobileLabelProps) {
  return (
    <div className="min-w-0">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] lg:hidden"
        style={{ color: "rgba(179, 146, 98, 0.62)" }}
      >
        {label}
      </p>
      <p
        className="truncate text-sm"
        style={{ color: "rgba(228, 211, 178, 0.86)" }}
      >
        {value}
      </p>
    </div>
  );
}
