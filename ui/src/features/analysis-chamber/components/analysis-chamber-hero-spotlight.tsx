import { CharacterStage } from "@/systems/character/character-stage";
import { getStatusColor } from "@/systems/character/character-shared";
import type { AnalysisStatus } from "@/types/organization";

export const AnalysisChamberHeroSpotlight = ({
  confidence,
  status,
}: {
  confidence: number;
  status: AnalysisStatus;
}) => {
  const accentColor = getStatusColor(status);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible">
      {/* Aura glow — sized to character, not viewport — reduced for Dynasty Wars */}
      <div
        className="pointer-events-none absolute h-80 w-80 rounded-full blur-3xl"
        style={{
          background: `${accentColor}1c`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
        }}
      />
      {/* Secondary inner glow ring */}
      <div
        className="pointer-events-none absolute h-56 w-56 rounded-full blur-2xl"
        style={{
          background: `${accentColor}14`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
        }}
      />

      {/* Character — natural size, fits in 420px right column */}
      <div className="relative flex h-full w-full items-center justify-center overflow-visible">
        <div className="relative w-full overflow-visible">
          <CharacterStage
            accentColor={accentColor}
            confidence={confidence}
            isFocusMode
            status={status}
          />
          {/* Soft ground fade — shallow, blends into dark shell */}
          <div
            className="pointer-events-none absolute inset-x-[15%] bottom-0 h-16"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,23,18,0) 0%, rgba(30,23,18,0.75) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
