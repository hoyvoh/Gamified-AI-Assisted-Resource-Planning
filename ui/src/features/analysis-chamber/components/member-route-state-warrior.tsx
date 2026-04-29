"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import gsap from "gsap";

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

type MemberRouteStateWarriorProps = {
  alt: string;
  isPosterImage: boolean;
  rootId: string;
  src: string;
};

export function MemberRouteStateWarrior({
  alt,
  isPosterImage,
  rootId,
  src,
}: MemberRouteStateWarriorProps) {
  const reducedMotion = usePrefersReducedMotion();
  const warriorRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const fogLayerOneRef = useRef<HTMLDivElement | null>(null);
  const fogLayerTwoRef = useRef<HTMLDivElement | null>(null);
  const swordGlowRef = useRef<HTMLDivElement | null>(null);
  const shimmerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const textNodes = root.querySelectorAll<HTMLElement>('[data-route-reveal-group="copy"] > *');
    const buttonNodes = root.querySelectorAll<HTMLElement>('[data-route-reveal-group="actions"] > *');

    const ctx = gsap.context(() => {
      gsap.set(textNodes, { opacity: 0, y: 18 });
      gsap.set(buttonNodes, { opacity: 0, y: 14 });
      gsap.set('[data-route-reveal="panel"]', { opacity: 0, y: 18 });

      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      timeline
        .to('[data-route-reveal="panel"]', { opacity: 1, y: 0, duration: 0.52 }, 0.08)
        .to(textNodes, { opacity: 1, y: 0, duration: 0.42, stagger: 0.08 }, 0.2)
        .to(
          warriorRef.current,
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.68,
            ease: "power3.out",
          },
          0.34,
        )
        .to(buttonNodes, { opacity: 1, y: 0, duration: 0.34, stagger: 0.08 }, 0.52)
        .fromTo(
          swordGlowRef.current,
          { opacity: 0.22, scaleY: 0.92 },
          {
            opacity: 0.74,
            scaleY: 1.06,
            duration: 0.54,
            ease: "sine.out",
          },
          0.68,
        )
        .to(
          swordGlowRef.current,
          {
            opacity: 0.34,
            scaleY: 1,
            duration: 0.9,
            ease: "sine.inOut",
          },
          1.04,
        );

      if (reducedMotion) return;

      gsap.to(warriorRef.current, {
        y: -2,
        scale: 1.008,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(auraRef.current, {
        opacity: 0.42,
        scale: 1.03,
        duration: 5.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(fogLayerOneRef.current, {
        xPercent: 4,
        opacity: 0.28,
        duration: 7.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(fogLayerTwoRef.current, {
        xPercent: -5,
        opacity: 0.22,
        duration: 8.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(swordGlowRef.current, {
        opacity: 0.46,
        scaleY: 1.03,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.set(shimmerRef.current, { opacity: 0, xPercent: -120 });
      gsap.to(shimmerRef.current, {
        xPercent: 120,
        opacity: 0.22,
        duration: 1.4,
        delay: 2.4,
        repeat: -1,
        repeatDelay: 6.4,
        ease: "power1.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, [reducedMotion, rootId]);

  const sceneClassName = isPosterImage
    ? "pointer-events-none relative z-0 mx-auto -mb-14 mt-8 h-auto w-[min(76vw,390px)] lg:absolute lg:-bottom-7 lg:right-[4%] lg:mt-0 lg:w-[500px] xl:w-[560px]"
    : "pointer-events-none relative z-0 mx-auto mt-8 h-auto w-[min(72vw,340px)] lg:absolute lg:bottom-0 lg:right-12 lg:mt-0 lg:w-[360px]";

  return (
    <div className="pointer-events-none">
      <div
        ref={auraRef}
        className="absolute bottom-6 right-[6%] hidden h-[360px] w-[360px] rounded-full opacity-30 blur-3xl lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(216,175,99,0.2) 0%, rgba(216,175,99,0.08) 38%, transparent 72%)",
        }}
      />
      <div className="absolute bottom-8 right-[7%] hidden h-[380px] w-[380px] items-center justify-center opacity-22 lg:flex">
        <svg
          aria-hidden="true"
          className="citadel-sigil-spin h-full w-full"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="154" stroke="rgba(216,175,99,0.18)" strokeWidth="2" strokeDasharray="8 18" />
          <circle cx="200" cy="200" r="128" stroke="rgba(242,229,203,0.08)" strokeWidth="1.5" strokeDasharray="4 14" />
          <path
            d="M200 70 L226 122 L282 126 L242 168 L254 224 L200 196 L146 224 L158 168 L118 126 L174 122 Z"
            stroke="rgba(216,175,99,0.14)"
            strokeWidth="1.5"
          />
          <circle cx="200" cy="200" r="84" stroke="rgba(216,175,99,0.1)" strokeWidth="1" />
        </svg>
      </div>
      <div
        className="absolute bottom-3 right-[2%] hidden h-[430px] w-28 rounded-full opacity-55 blur-3xl lg:block"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(242,203,127,0.13) 34%, rgba(142,118,82,0.1) 62%, transparent 100%)",
        }}
      />
      <div
        ref={fogLayerOneRef}
        className="absolute -bottom-7 right-[4%] hidden h-18 w-[440px] rounded-[999px] opacity-24 blur-2xl lg:block"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(233,221,208,0.12) 30%, rgba(216,175,99,0.12) 52%, rgba(233,221,208,0.08) 72%, transparent 100%)",
        }}
      />
      <div
        ref={fogLayerTwoRef}
        className="absolute -bottom-1 right-[10%] hidden h-14 w-[360px] rounded-[999px] opacity-18 blur-xl lg:block"
        style={{
          background:
            "radial-gradient(ellipse, rgba(242,229,203,0.16) 0%, rgba(216,175,99,0.08) 38%, transparent 74%)",
        }}
      />
      <div
        className="absolute -bottom-9 right-[7%] hidden h-16 w-[430px] rounded-[999px] opacity-75 blur-2xl lg:block"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.42) 42%, transparent 74%)",
        }}
      />
      <div
        className="absolute bottom-0 right-[8%] hidden h-12 w-56 rounded-[999px] blur-2xl lg:block"
        style={{ background: "rgba(216, 175, 99, 0.13)" }}
      />
      <div
        ref={warriorRef}
        data-route-reveal="warrior"
        className={sceneClassName}
        style={{ opacity: 0, transform: "translateX(16px) scale(0.975)" }}
      >
        <div
          ref={swordGlowRef}
          className="citadel-sword-glow-idle absolute bottom-[10%] left-[43%] z-10 hidden h-[54%] w-10 -translate-x-1/2 rounded-[999px] opacity-30 blur-xl lg:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,245,212,0) 0%, rgba(255,238,194,0.34) 14%, rgba(216,175,99,0.55) 46%, rgba(216,175,99,0.18) 84%, rgba(255,245,212,0) 100%)",
          }}
        />
        <div
          ref={shimmerRef}
          className="absolute inset-y-[12%] left-[20%] z-20 hidden w-[22%] -skew-x-[18deg] rounded-[999px] blur-md lg:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,243,222,0.28) 35%, rgba(255,243,222,0.1) 65%, rgba(255,255,255,0) 100%)",
            mixBlendMode: "screen",
          }}
        />
        <Image
          src={src}
          alt={alt}
          width={520}
          height={520}
          priority
          className="relative h-auto w-full object-contain object-bottom drop-shadow-[0_28px_44px_rgba(0,0,0,0.72)]"
        />
      </div>
    </div>
  );
}
