import Link from "next/link";

import { cn } from "@/lib/utils";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  getWarRoomAction,
  getWarRoomStatusDisplay,
} from "@/features/analysis-chamber/lib/members-war-room";

const STATUS_TONE_STYLE = {
  active: MEDIEVAL_THEME.status.active,
  danger: MEDIEVAL_THEME.status.danger,
  idle: MEDIEVAL_THEME.status.idle,
  ready: MEDIEVAL_THEME.status.ready,
  unknown: MEDIEVAL_THEME.status.unknown,
} as const;

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
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
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
        className="overflow-hidden border"
        style={{
          borderColor: MEDIEVAL_THEME.premiumNoir.divider,
          backgroundImage: MEDIEVAL_THEME.gradients.ledger,
          color: MEDIEVAL_THEME.text.primary,
          boxShadow: MEDIEVAL_THEME.effects.panelShadow,
        }}
      >
        <div
          className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(150px,0.9fr)_140px] border-b px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] lg:grid"
          aria-hidden="true"
          style={{
            borderColor: MEDIEVAL_THEME.premiumNoir.divider,
            backgroundImage: MEDIEVAL_THEME.gradients.ledgerHeader,
            color: MEDIEVAL_THEME.premiumNoir.chromeLabel,
          }}
        >
          <span>Champion</span>
          <span>House</span>
          <span>Calling</span>
          <span>Campaign State</span>
          <span className="text-right">Order</span>
        </div>

        <div className="divide-y" style={{ borderColor: MEDIEVAL_THEME.premiumNoir.divider }}>
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
          : "",
      )}
      style={{
        backgroundImage: isSelected
          ? MEDIEVAL_THEME.gradients.selectedRow
          : MEDIEVAL_THEME.gradients.hoverRow,
      }}
    >
      {isSelected ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundImage: "linear-gradient(180deg,#cfad6f,#8a6d3a)" }}
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="min-w-0 cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ["--tw-ring-offset-color" as string]: MEDIEVAL_THEME.backgrounds.panelBottom }}
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-9 shrink-0 place-items-center border font-mono text-xs font-semibold [clip-path:polygon(10%_0,90%_0,90%_72%,50%_100%,10%_72%)]"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.divider,
              backgroundImage:
                "linear-gradient(180deg,rgba(216,175,99,0.18),rgba(24,26,33,0.30))",
              color: MEDIEVAL_THEME.accents.brassBright,
            }}
          >
            {member.displayName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block font-body-serif text-xl leading-6" style={{ color: MEDIEVAL_THEME.text.primary }}>
              {member.displayName}
            </span>
            <span className="mt-1 block truncate font-mono text-[11px]" style={{ color: MEDIEVAL_THEME.text.muted }}>
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
          className="inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          style={{
            borderColor: STATUS_TONE_STYLE[status.tone].border,
            background: STATUS_TONE_STYLE[status.tone].background,
            color: STATUS_TONE_STYLE[status.tone].text,
          }}
        >
          {status.label}
        </span>
        <p className="mt-1 text-xs leading-5" style={{ color: MEDIEVAL_THEME.text.soft }}>
          {status.meaning}
        </p>
      </div>

      <div className="lg:text-right">
        <Link
          href={action.href}
          className="inline-flex min-h-9 items-center justify-center border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: MEDIEVAL_THEME.premiumNoir.divider,
            backgroundImage: MEDIEVAL_THEME.gradients.secondaryButton,
            color: MEDIEVAL_THEME.text.secondary,
            ["--tw-ring-offset-color" as string]: MEDIEVAL_THEME.backgrounds.panelBottom,
          }}
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
        style={{ color: MEDIEVAL_THEME.text.dim }}
      >
        {label}
      </p>
      <p
        className="truncate text-sm"
        style={{ color: MEDIEVAL_THEME.text.secondary }}
      >
        {value}
      </p>
    </div>
  );
}
