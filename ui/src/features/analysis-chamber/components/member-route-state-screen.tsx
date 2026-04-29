import Image from "next/image";
import Link from "next/link";

import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

type RouteStateAction = {
  href: string;
  label: string;
};

type ImagePresentation = "inline" | "poster";

type MemberRouteStateScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: RouteStateAction;
  secondaryAction?: RouteStateAction;
  imageSrc?: string;
  imageAlt?: string;
  imagePresentation?: ImagePresentation;
  overline?: string;
  footerLabel?: string;
};

export function MemberRouteStateScreen({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt = "",
  imagePresentation = "inline",
  overline = "Citadel Recovery Route",
  footerLabel = "Citadel Archives",
}: MemberRouteStateScreenProps) {
  const isPosterImage = imagePresentation === "poster";

  return (
    <main
      className="min-h-screen overflow-hidden px-4 py-6 md:px-8"
      style={{
        backgroundColor: MEDIEVAL_THEME.backgrounds.pageBase,
        backgroundImage: MEDIEVAL_THEME.gradients.page,
        color: MEDIEVAL_THEME.premiumNoir.pageText,
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1606px] flex-col">
        <header
          className="flex items-center justify-between gap-6 border-b px-1 py-3"
          style={{ borderColor: MEDIEVAL_THEME.premiumNoir.divider }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
          >
            {eyebrow}
          </p>
          <p
            className="text-right font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeMeta }}
          >
            {overline}
          </p>
        </header>

        <section className="relative flex flex-1 items-center py-14 md:py-20">
          <div
            className="absolute inset-x-0 top-5 h-px"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${MEDIEVAL_THEME.premiumNoir.heroGlow}, transparent)`,
            }}
          />

          <div
            className="relative w-full overflow-visible rounded-[28px] border px-7 py-9 shadow-[0_40px_110px_rgba(0,0,0,0.58)] sm:px-10 md:px-14 md:py-12 lg:min-h-[296px]"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.heroBorder,
              background:
                "linear-gradient(180deg, rgba(22,24,31,0.94), rgba(12,10,13,0.97))",
              boxShadow: `0 0 0 1px ${MEDIEVAL_THEME.premiumNoir.heroInnerBorder}, 0 40px 110px rgba(0,0,0,0.58)`,
            }}
          >
            <div className="relative z-10 max-w-3xl lg:max-w-[56%]">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(216, 175, 99, 0.58)" }}
              >
                Realm State: Missing
              </p>

              <h1
                className="mt-5 font-body-serif text-4xl leading-none drop-shadow-[0_0_20px_rgba(216,175,99,0.22)] md:text-6xl"
                style={{ color: MEDIEVAL_THEME.premiumNoir.heroHeading }}
              >
                {title}
              </h1>

              <p
                className="mt-6 max-w-2xl font-body-serif text-lg leading-8 md:text-[1.625rem]"
                style={{ color: MEDIEVAL_THEME.premiumNoir.heroBody }}
              >
                {description}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <RouteStateLink action={primaryAction} variant="primary" />
                {secondaryAction ? (
                  <RouteStateLink action={secondaryAction} variant="secondary" />
                ) : null}
              </div>
            </div>

            {imageSrc ? (
              <RouteStateImage
                alt={imageAlt}
                isPosterImage={isPosterImage}
                src={imageSrc}
              />
            ) : null}
          </div>
        </section>

        <footer
          className="border-t px-1 py-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.footer }}
          >
            {footerLabel}
          </p>
        </footer>
      </div>
    </main>
  );
}

function RouteStateLink({
  action,
  variant,
}: {
  action: RouteStateAction;
  variant: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={action.href}
      className="inline-flex min-h-[54px] items-center justify-center rounded-md border px-6 py-3 text-center font-mono text-xs uppercase tracking-[0.22em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-w-[210px]"
      style={{
        borderColor: isPrimary
          ? "rgba(224, 185, 105, 0.86)"
          : "rgba(216, 175, 99, 0.36)",
        backgroundImage: isPrimary
          ? MEDIEVAL_THEME.gradients.primaryButton
          : "linear-gradient(180deg, rgba(22,24,31,0.1), rgba(12,10,13,0.1))",
        boxShadow: isPrimary
          ? "inset 0 1px 0 rgba(255,255,255,0.35)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        color: isPrimary
          ? MEDIEVAL_THEME.text.inverse
          : "rgba(242, 229, 203, 0.84)",
      }}
    >
      {action.label}
    </Link>
  );
}

function RouteStateImage({
  alt,
  isPosterImage,
  src,
}: {
  alt: string;
  isPosterImage: boolean;
  src: string;
}) {
  const posterClassName =
    "pointer-events-none relative z-0 mx-auto -mb-14 mt-8 h-auto w-[min(76vw,390px)] object-contain object-bottom drop-shadow-[0_28px_44px_rgba(0,0,0,0.72)] lg:absolute lg:-bottom-7 lg:right-[4%] lg:mt-0 lg:w-[500px] xl:w-[560px]";
  const inlineClassName =
    "relative z-0 mx-auto mt-8 h-auto w-[min(72vw,340px)] object-contain object-bottom drop-shadow-[0_24px_44px_rgba(0,0,0,0.65)] lg:absolute lg:bottom-0 lg:right-12 lg:mt-0 lg:w-[360px]";

  return (
    <div className="pointer-events-none">
      <div
        className="absolute bottom-16 right-[5%] hidden h-72 w-72 rounded-full opacity-35 blur-3xl lg:block motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(216,175,99,0.22) 0%, rgba(216,175,99,0.09) 38%, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-3 right-[2%] hidden h-[430px] w-28 rounded-full opacity-55 blur-3xl lg:block"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(242,203,127,0.13) 34%, rgba(142,118,82,0.1) 62%, transparent 100%)",
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
        className="absolute -bottom-5 right-[9%] hidden h-24 w-[480px] rounded-[999px] opacity-30 blur-xl lg:block motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(233,221,208,0.1) 32%, rgba(216,175,99,0.08) 50%, rgba(233,221,208,0.08) 68%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 right-[8%] hidden h-12 w-56 rounded-[999px] blur-2xl lg:block"
        style={{ background: "rgba(216, 175, 99, 0.13)" }}
      />
      <Image
        src={src}
        alt={alt}
        width={520}
        height={520}
        priority
        className={isPosterImage ? posterClassName : inlineClassName}
      />
    </div>
  );
}
