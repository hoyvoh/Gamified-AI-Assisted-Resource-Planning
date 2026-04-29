import Link from "next/link";

import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

import type { FlatMemberRow } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  formatWarRoomDate,
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

type MembersWarRoomDossierProps = {
  member: FlatMemberRow;
};

export function MembersWarRoomDossier({ member }: MembersWarRoomDossierProps) {
  const status = getWarRoomStatusDisplay(member.analysisStatus);
  const action = getWarRoomAction(member.memberId, member.analysisStatus);

  return (
    <aside
      aria-labelledby="royal-dossier-title"
      className="border p-5 lg:sticky lg:top-8"
      style={{
        borderColor: MEDIEVAL_THEME.premiumNoir.divider,
        backgroundImage: MEDIEVAL_THEME.gradients.shell,
        color: MEDIEVAL_THEME.text.primary,
        boxShadow: MEDIEVAL_THEME.effects.panelShadow,
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
      >
        Member Brief
      </p>
      <h2
        id="royal-dossier-title"
        className="mt-2 font-body-serif text-3xl leading-8"
        style={{ color: MEDIEVAL_THEME.text.heading }}
      >
        {member.displayName}
      </h2>
      <p
        className="mt-2 font-mono text-xs"
        style={{ color: MEDIEVAL_THEME.text.muted }}
      >
        {member.externalId ?? "No external handle"}
      </p>

      <div
        className="mt-5 border px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
        style={{
          borderColor: STATUS_TONE_STYLE[status.tone].border,
          color: STATUS_TONE_STYLE[status.tone].text,
          background: STATUS_TONE_STYLE[status.tone].background,
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-current/60">
          Scan Status
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
          label="Last Scan"
          value={formatWarRoomDate(member.lastAnalysisAt)}
        />
        <DossierField label="Next Action" value={action.recommendation} />
      </dl>

      <Link
        href={action.href}
        className="mt-6 inline-flex min-h-10 w-full items-center justify-center border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b89254]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18120d]"
        style={{
          borderColor: MEDIEVAL_THEME.premiumNoir.divider,
          backgroundImage: MEDIEVAL_THEME.gradients.primaryButton,
          color: MEDIEVAL_THEME.text.inverse,
        }}
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
      <dt
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-sm leading-6"
        style={{ color: MEDIEVAL_THEME.text.secondary }}
      >
        {value}
      </dd>
    </div>
  );
}
