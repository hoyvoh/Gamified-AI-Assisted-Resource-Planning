export type AnalysisChamberRouteKey =
  | "overview"
  | "competency"
  | "kpt"
  | "cases"
  | "journey";

export type AnalysisChamberQueryState = {
  category: string | null;
  dimension: string | null;
  caseId: string | null;
  milestone: string | null;
  drawer: string | null;
  highlight: string | null;
};

export type AnalysisChamberRouteMeta = {
  key: AnalysisChamberRouteKey;
  label: string;
  shortLabel: string;
  artifact: string;
  artifactSymbol: string;
  description: string;
};
