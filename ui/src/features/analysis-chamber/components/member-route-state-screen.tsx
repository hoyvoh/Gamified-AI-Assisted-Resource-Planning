import Link from "next/link";

import { MemberRouteStateWarrior } from "@/features/analysis-chamber/components/member-route-state-warrior";
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
  const rootId = "member-route-state-screen";

  return (
    <main
      id={rootId}
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
            data-route-reveal="panel"
            className="relative w-full overflow-visible rounded-[28px] border px-7 py-9 shadow-[0_40px_110px_rgba(0,0,0,0.58)] sm:px-10 md:px-14 md:py-12 lg:min-h-[296px]"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.heroBorder,
              background:
                "linear-gradient(180deg, rgba(22,24,31,0.94), rgba(12,10,13,0.97))",
              boxShadow: `0 0 0 1px ${MEDIEVAL_THEME.premiumNoir.heroInnerBorder}, 0 40px 110px rgba(0,0,0,0.58)`,
            }}
          >
            <div data-route-reveal-group="copy" className="relative z-10 max-w-3xl lg:max-w-[56%]">
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

              <div data-route-reveal-group="actions" className="mt-9 flex flex-col gap-3 sm:flex-row">
                <RouteStateLink action={primaryAction} variant="primary" />
                {secondaryAction ? (
                  <RouteStateLink action={secondaryAction} variant="secondary" />
                ) : null}
              </div>
            </div>

            {imageSrc ? (
              <MemberRouteStateWarrior
                alt={imageAlt}
                isPosterImage={isPosterImage}
                rootId={rootId}
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
      className="group relative inline-flex min-h-[54px] items-center justify-center overflow-hidden rounded-md border px-6 py-3 text-center font-mono text-xs uppercase tracking-[0.22em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-w-[210px]"
      style={{
        borderColor: isPrimary
          ? "rgba(224, 185, 105, 0.86)"
          : "rgba(216, 175, 99, 0.36)",
        backgroundImage: isPrimary
          ? MEDIEVAL_THEME.gradients.primaryButton
          : "linear-gradient(180deg, rgba(22,24,31,0.1), rgba(12,10,13,0.1))",
        boxShadow: isPrimary
          ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 rgba(216,175,99,0)"
          : "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 rgba(216,175,99,0)",
        color: isPrimary
          ? MEDIEVAL_THEME.text.inverse
          : "rgba(242, 229, 203, 0.84)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[-35%] w-1/3 -skew-x-[20deg] opacity-0 transition duration-500 group-hover:left-[115%] group-hover:opacity-100"
        style={{
          background:
            isPrimary
              ? "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,245,220,0.38), rgba(255,255,255,0))"
              : "linear-gradient(90deg, rgba(255,255,255,0), rgba(216,175,99,0.16), rgba(255,255,255,0))",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          boxShadow: isPrimary
            ? "inset 0 0 22px rgba(255,245,220,0.12), 0 0 26px rgba(216,175,99,0.18)"
            : "inset 0 0 20px rgba(216,175,99,0.06), 0 0 18px rgba(216,175,99,0.14)",
        }}
      />
      <span className="relative z-10">{action.label}</span>
    </Link>
  );
}
