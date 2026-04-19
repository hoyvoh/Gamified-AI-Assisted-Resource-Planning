import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";

type QueryPatch = Partial<{
  category: string | null;
  dimension: string | null;
  caseId: string | null;
  milestone: string | null;
  drawer: string | null;
  highlight: string | null;
}>;

const ROUTE_SEGMENTS: Record<AnalysisChamberRouteKey, string> = {
  overview: "",
  competency: "/competency",
  kpt: "/kpt",
  cases: "/cases",
  journey: "/journey",
};

export const buildAnalysisChamberRouteHref = (
  memberId: string,
  route: AnalysisChamberRouteKey,
  query?: QueryPatch,
) => {
  const params = new URLSearchParams();

  const apply = (key: string, value: string | null | undefined) => {
    if (!value) {
      return;
    }

    params.set(key, value);
  };

  apply("category", query?.category);
  apply("dimension", query?.dimension);
  apply("case", query?.caseId);
  apply("milestone", query?.milestone);
  apply("drawer", query?.drawer);
  apply("highlight", query?.highlight);

  const pathname = `/profile/${memberId}${ROUTE_SEGMENTS[route]}`;
  const search = params.toString();

  return search ? `${pathname}?${search}` : pathname;
};
