"use client";

import type { ChamberKptItem } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { KptColumn } from "@/features/analysis-chamber/components/stages/kpt-column";
import { useAnalysisChamberKptData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { KPT_TOKENS } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

import type { KptColumnKey } from "./kpt-card";

const COLUMNS: Array<{
  key: KptColumnKey;
  tokens: (typeof KPT_TOKENS)["keep"] | (typeof KPT_TOKENS)["problem"] | (typeof KPT_TOKENS)["try"];
}> = [
  { key: "Keep", tokens: KPT_TOKENS.keep },
  { key: "Problem", tokens: KPT_TOKENS.problem },
  { key: "Try", tokens: KPT_TOKENS.try },
];

export const KptStageShell = ({ memberId }: { memberId: string }) => {
  const kpt = useAnalysisChamberKptData(memberId);

  const itemsByKey: Record<KptColumnKey, ChamberKptItem[]> = {
    Keep: kpt.data?.keepItems ?? [],
    Problem: kpt.data?.problemItems ?? [],
    Try: kpt.data?.tryItems ?? [],
  };

  return (
    <section className="dossier-scroll h-full px-4 pb-6 pt-4 md:px-5">
      <div className="grid h-full gap-4 xl:grid-cols-3">
        {COLUMNS.map(({ key, tokens }) => (
          <KptColumn
            key={key}
            columnKey={key}
            items={itemsByKey[key]}
            memberId={memberId}
            tokens={tokens}
          />
        ))}
      </div>
    </section>
  );
};
