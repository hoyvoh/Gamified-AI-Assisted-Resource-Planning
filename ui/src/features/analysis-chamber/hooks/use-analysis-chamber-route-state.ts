"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AnalysisChamberQueryState } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";

export const useAnalysisChamberRouteState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const state = useMemo<AnalysisChamberQueryState>(
    () => ({
      category: searchParams.get("category"),
      dimension: searchParams.get("dimension"),
      caseId: searchParams.get("case"),
      milestone: searchParams.get("milestone"),
      drawer: searchParams.get("drawer"),
      highlight: searchParams.get("highlight"),
    }),
    [searchParams],
  );

  const updateQuery = useCallback(
    (
      patch: Partial<AnalysisChamberQueryState>,
      history: "push" | "replace" = "replace",
    ) => {
      const next = new URLSearchParams(searchParams.toString());

      const apply = (key: string, value: string | null | undefined) => {
        if (!value) {
          next.delete(key);
          return;
        }

        next.set(key, value);
      };

      if ("category" in patch) apply("category", patch.category);
      if ("dimension" in patch) apply("dimension", patch.dimension);
      if ("caseId" in patch) apply("case", patch.caseId);
      if ("milestone" in patch) apply("milestone", patch.milestone);
      if ("drawer" in patch) apply("drawer", patch.drawer);
      if ("highlight" in patch) apply("highlight", patch.highlight);

      const target = next.toString()
        ? `${pathname}?${next.toString()}`
        : pathname;

      if (history === "push") {
        router.push(target, { scroll: false });
        return;
      }

      router.replace(target, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    state,
    updateQuery,
  };
};
