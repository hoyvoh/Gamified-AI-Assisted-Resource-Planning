"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
} from "@/features/dossier/constants/dossier.constants";

const SkeletonBar = ({
  className,
}: {
  className: string;
}) => (
  <div
    className={`animate-pulse rounded-full ${className}`}
    style={{
      background:
        "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(122,230,255,0.08), rgba(255,255,255,0.04))",
    }}
  />
);

export const DossierSurfaceSkeleton = () => {
  return (
    <div className="space-y-3">
      <div
        className="rounded-[18px] border px-4 py-4 backdrop-blur-xl"
        style={{
          borderColor: DOSSIER_COLORS.panelBorder,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))",
        }}
      >
        <p
          className="font-mono text-[8px] uppercase tracking-[0.22em]"
          style={{ color: CONTRAST.textTertiary }}
        >
          Loading Surface
        </p>
        <div className="mt-3 space-y-2.5">
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-8 w-[82%]" />
          <SkeletonBar className="h-3 w-[66%]" />
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-[16px] border px-4 py-4 backdrop-blur-xl"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.018))",
            }}
          >
            <SkeletonBar className="h-3 w-20" />
            <div className="mt-3 space-y-2">
              <SkeletonBar className="h-3 w-[92%]" />
              <SkeletonBar className="h-3 w-[76%]" />
              <SkeletonBar className="h-3 w-[84%]" />
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-[16px] border px-4 py-4 backdrop-blur-xl"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.018))",
        }}
      >
        <SkeletonBar className="h-3 w-24" />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-[14px] border px-3 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.018)",
              }}
            >
              <SkeletonBar className="h-2.5 w-14" />
              <SkeletonBar className="mt-3 h-5 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
