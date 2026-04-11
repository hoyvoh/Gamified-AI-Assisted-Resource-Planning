"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

interface DossierLayerMotionOptions {
  isOpen: boolean;
  axis: "x" | "y";
  panelOffset: number;
  panelBlur: number;
  panelScaleFrom: number;
  backdropDuration: number;
  panelEnterDuration: number;
  panelExitDuration: number;
  itemOffset: number;
  itemDuration: number;
  itemStagger: number;
}

interface DossierLayerMotionReturn {
  backdropRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMounted: boolean;
  panelRef: React.RefObject<HTMLElement | null>;
  registerItem: (index: number) => (node: HTMLDivElement | null) => void;
}

const getPanelAxisState = (
  axis: DossierLayerMotionOptions["axis"],
  offset: number,
) => {
  if (axis === "x") {
    return { x: offset, y: 0 };
  }

  return { x: 0, y: offset };
};

export const useDossierLayerMotion = ({
  isOpen,
  axis,
  panelOffset,
  panelBlur,
  panelScaleFrom,
  backdropDuration,
  panelEnterDuration,
  panelExitDuration,
  itemOffset,
  itemDuration,
  itemStagger,
}: DossierLayerMotionOptions): DossierLayerMotionReturn => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const containerNode = containerRef.current;
    const backdropNode = backdropRef.current;
    const panelNode = panelRef.current;
    const itemNodes = itemRefs.current.filter(
      (node): node is HTMLDivElement => node !== null,
    );

    if (!isMounted || !containerNode || !backdropNode || !panelNode) {
      return;
    }

    const panelAxisState = getPanelAxisState(axis, panelOffset);
    const itemAxisState = getPanelAxisState(axis, itemOffset);

    if (isOpen) {
      gsap.set(containerNode, { pointerEvents: "auto" });
      gsap.set(backdropNode, { opacity: 0 });
      gsap.set(panelNode, {
        opacity: 0,
        ...panelAxisState,
        scale: panelScaleFrom,
        filter: `blur(${panelBlur}px)`,
      });
      gsap.set(itemNodes, {
        opacity: 0,
        ...itemAxisState,
      });

      const enterTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      enterTimeline
        .to(backdropNode, {
          opacity: 1,
          duration: backdropDuration,
        })
        .to(
          panelNode,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: panelEnterDuration,
          },
          "<+0.03",
        )
        .to(
          itemNodes,
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: itemDuration,
            stagger: itemStagger,
          },
          "<+0.06",
        );

      return () => {
        enterTimeline.kill();
      };
    }

    const exitTimeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(containerNode, { pointerEvents: "none" });
        setIsMounted(false);
      },
    });

    exitTimeline
      .to(itemNodes, {
        opacity: 0,
        ...getPanelAxisState(axis, itemOffset * 0.65),
        duration: itemDuration * 0.75,
        stagger: 0.03,
      })
      .to(
        panelNode,
        {
          opacity: 0,
          ...panelAxisState,
          scale: panelScaleFrom,
          filter: `blur(${panelBlur}px)`,
          duration: panelExitDuration,
        },
        "<",
      )
      .to(
        backdropNode,
        {
          opacity: 0,
          duration: backdropDuration,
        },
        "<",
      );

    return () => {
      exitTimeline.kill();
    };
  }, [
    axis,
    backdropDuration,
    isMounted,
    isOpen,
    itemDuration,
    itemOffset,
    itemStagger,
    panelBlur,
    panelEnterDuration,
    panelExitDuration,
    panelOffset,
    panelScaleFrom,
  ]);

  return {
    backdropRef,
    containerRef,
    isMounted,
    panelRef,
    registerItem: (index: number) => (node: HTMLDivElement | null) => {
      itemRefs.current[index] = node;
    },
  };
};
