"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import {
  DOSSIER_SCREEN_CHAPTERS,
  DOSSIER_SCREEN_MOTION,
} from "@/features/dossier/constants/dossier-screen.constants";
import type { SceneDirection } from "@/features/dossier/types/dossier-screen.types";

interface UseDossierSceneControllerReturn {
  activeIndex: number;
  boundaryTick: number;
  direction: SceneDirection;
  rootRef: React.RefObject<HTMLDivElement | null>;
  setActiveIndex: (index: number) => void;
}

const LAST_CHAPTER_INDEX = DOSSIER_SCREEN_CHAPTERS.length - 1;
const KEYBOARD_NEXT_KEYS = new Set(["ArrowDown", "PageDown", "Space"]);
const KEYBOARD_PREV_KEYS = new Set(["ArrowUp", "PageUp"]);
const SCROLL_REGION_SELECTOR = '[data-dossier-scroll-region="true"]';

const canScrollPanel = (element: HTMLElement, direction: SceneDirection): boolean => {
  const hasScrollableContent = element.scrollHeight > element.clientHeight + 1;

  if (!hasScrollableContent) {
    return false;
  }

  if (direction === "down") {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  return element.scrollTop > 1;
};

const getScrollRegion = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest(SCROLL_REGION_SELECTOR);
};

export const useDossierSceneController = (): UseDossierSceneControllerReturn => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const lockReleaseRef = useRef<ReturnType<typeof gsap.delayedCall> | null>(null);
  const activeIndexRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndexState] = useState(0);
  const [direction, setDirection] = useState<SceneDirection>("down");
  const [boundaryTick, setBoundaryTick] = useState(0);

  const releaseLock = () => {
    lockRef.current = false;
    lockReleaseRef.current = null;
  };

  const startLock = () => {
    lockRef.current = true;
    lockReleaseRef.current?.kill();
    lockReleaseRef.current = gsap.delayedCall(
      DOSSIER_SCREEN_MOTION.chapterLockMs / 1000,
      releaseLock,
    );
  };

  const navigateToIndex = (nextIndex: number, nextDirection: SceneDirection) => {
    const currentIndex = activeIndexRef.current;

    if (lockRef.current) {
      return;
    }

    if (nextIndex < 0 || nextIndex > LAST_CHAPTER_INDEX) {
      setDirection(nextDirection);
      setBoundaryTick((currentTick) => currentTick + 1);
      startLock();
      return;
    }

    if (nextIndex === currentIndex) {
      return;
    }

    setDirection(nextDirection);
    setActiveIndexState(nextIndex);
    activeIndexRef.current = nextIndex;
    startLock();
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const rootElement = rootRef.current;

    if (!rootElement) {
      return;
    }

    const handleDirectionalInput = (
      nextDirection: SceneDirection,
      sourceTarget: EventTarget | null,
    ) => {
      const scrollRegion = getScrollRegion(sourceTarget);

      if (scrollRegion && canScrollPanel(scrollRegion, nextDirection)) {
        return;
      }

      const currentIndex = activeIndexRef.current;
      navigateToIndex(
        nextDirection === "down" ? currentIndex + 1 : currentIndex - 1,
        nextDirection,
      );
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < DOSSIER_SCREEN_MOTION.chapterThreshold) {
        return;
      }

      const nextDirection: SceneDirection = event.deltaY > 0 ? "down" : "up";
      const scrollRegion = getScrollRegion(event.target);

      if (scrollRegion && canScrollPanel(scrollRegion, nextDirection)) {
        return;
      }

      event.preventDefault();
      handleDirectionalInput(nextDirection, event.target);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;

      if (startY === null || currentY === undefined) {
        return;
      }

      const deltaY = startY - currentY;

      if (Math.abs(deltaY) < DOSSIER_SCREEN_MOTION.chapterThreshold) {
        return;
      }

      const nextDirection: SceneDirection = deltaY > 0 ? "down" : "up";
      const scrollRegion = getScrollRegion(event.target);

      if (scrollRegion && canScrollPanel(scrollRegion, nextDirection)) {
        return;
      }

      event.preventDefault();
      touchStartYRef.current = currentY;
      handleDirectionalInput(nextDirection, event.target);
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (KEYBOARD_NEXT_KEYS.has(event.code)) {
        event.preventDefault();
        handleDirectionalInput("down", event.target);
        return;
      }

      if (KEYBOARD_PREV_KEYS.has(event.code)) {
        event.preventDefault();
        handleDirectionalInput("up", event.target);
      }
    };

    rootElement.addEventListener("wheel", handleWheel, { passive: false });
    rootElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    rootElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    rootElement.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      rootElement.removeEventListener("wheel", handleWheel);
      rootElement.removeEventListener("touchstart", handleTouchStart);
      rootElement.removeEventListener("touchmove", handleTouchMove);
      rootElement.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      lockReleaseRef.current?.kill();
    };
  }, []);

  const stableSetActiveIndex = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, LAST_CHAPTER_INDEX));
    const currentIndex = activeIndexRef.current;

    if (boundedIndex === currentIndex) {
      return;
    }

    setDirection(boundedIndex > currentIndex ? "down" : "up");
    setActiveIndexState(boundedIndex);
    activeIndexRef.current = boundedIndex;
    startLock();
  };

  return {
    activeIndex,
    boundaryTick,
    direction,
    rootRef,
    setActiveIndex: stableSetActiveIndex,
  };
};
