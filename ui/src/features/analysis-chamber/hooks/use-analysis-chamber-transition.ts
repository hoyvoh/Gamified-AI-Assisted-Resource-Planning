"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type TransitionDirection = "forward" | "backward" | "neutral";

const ROUTE_ORDER = [
  "/profile/",
  "/competency",
  "/kpt",
  "/cases",
  "/journey",
] as const;

const getRouteIndex = (pathname: string) => {
  if (pathname.endsWith("/competency")) {
    return 1;
  }
  if (pathname.endsWith("/kpt")) {
    return 2;
  }
  if (pathname.endsWith("/cases")) {
    return 3;
  }
  if (pathname.endsWith("/journey")) {
    return 4;
  }

  return 0;
};

export const useAnalysisChamberTransition = () => {
  const pathname = usePathname();
  const previousIndexRef = useRef(getRouteIndex(pathname));
  const [direction, setDirection] = useState<TransitionDirection>("neutral");

  useEffect(() => {
    const nextIndex = getRouteIndex(pathname);
    const previousIndex = previousIndexRef.current;

    if (nextIndex === previousIndex) {
      setDirection("neutral");
      return;
    }

    setDirection(nextIndex > previousIndex ? "forward" : "backward");
    previousIndexRef.current = nextIndex;
  }, [pathname]);

  return useMemo(
    () => ({
      direction,
      routeIndex: getRouteIndex(pathname),
      routeKey: ROUTE_ORDER[getRouteIndex(pathname)],
    }),
    [direction, pathname],
  );
};
