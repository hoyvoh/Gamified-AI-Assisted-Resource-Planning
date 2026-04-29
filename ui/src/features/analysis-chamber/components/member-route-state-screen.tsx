import Image from "next/image";
import Link from "next/link";

import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

type RouteStateAction = {
  href: string;
  label: string;
};

export function MemberRouteStateScreen({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt,
  overline,
  footerLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: RouteStateAction;
  secondaryAction?: RouteStateAction;
  imageSrc?: string;
  imageAlt?: string;
  overline?: string;
  footerLabel?: string;
}) {
  return (
    <main
      className="min-h-screen overflow-hidden px-4 py-6 md:px-8"
      style={{ background: MEDIEVAL_THEME.gradients.page }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header
          className="flex items-center justify-between border-b px-1 py-3"
          style={{ borderColor: MEDIEVAL_THEME.premiumNoir.divider }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
          >
            {eyebrow}
          </p>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeMeta }}
          >
            {overline ?? "Citadel Recovery Route"}
          </p>
        </header>

        <section className="relative mt-8 flex flex-1 items-center">
          <div
            className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${MEDIEVAL_THEME.premiumNoir.heroGlow}, transparent)`,
            }}
          />
          <div
            className="grid w-full items-center gap-8 rounded-[32px] border px-6 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_100px_rgba(0,0,0,0.55)] md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_420px]"
            style={{
              borderColor: MEDIEVAL_THEME.premiumNoir.heroBorder,
              background: MEDIEVAL_THEME.premiumNoir.heroSurface,
              boxShadow: `0 0 0 1px ${MEDIEVAL_THEME.premiumNoir.heroInnerBorder}, 0 40px 100px rgba(0,0,0,0.55)`,
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(216, 175, 99, 0.55)" }}
              >
                Realm State: Missing
              </p>
              <h1
                className="mt-4 font-serif text-4xl leading-[0.95] drop-shadow-[0_0_18px_rgba(216,175,99,0.22)] md:text-6xl"
                style={{ color: MEDIEVAL_THEME.premiumNoir.heroHeading }}
              >
                {title}
              </h1>
              <p
                className="mt-5 max-w-xl text-base leading-8 md:text-lg"
                style={{ color: MEDIEVAL_THEME.premiumNoir.heroBody }}
              >
                {description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryAction.href}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-sm border px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                  style={{
                    borderColor: "rgba(224, 185, 105, 0.8)",
                    backgroundImage: MEDIEVAL_THEME.gradients.primaryButton,
                    color: MEDIEVAL_THEME.text.inverse,
                  }}
                >
                  {primaryAction.label}
                </Link>
                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-sm border bg-transparent px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] transition hover:bg-amber-200/6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                    style={{
                      borderColor: "rgba(216, 175, 99, 0.3)",
                      color: "rgba(242, 229, 203, 0.82)",
                    }}
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>

            {imageSrc ? (
              <div className="relative mx-auto flex w-full max-w-[360px] items-end justify-center self-end lg:justify-end">
                <div
                  className="absolute bottom-0 h-10 w-44 rounded-[999px] blur-2xl"
                  style={{ background: "rgba(216, 175, 99, 0.12)" }}
                />
                <Image
                  src={imageSrc}
                  alt={imageAlt ?? ""}
                  width={420}
                  height={540}
                  priority
                  className="relative h-auto max-h-[520px] w-auto object-contain object-bottom drop-shadow-[0_24px_44px_rgba(0,0,0,0.65)]"
                />
              </div>
            ) : null}
          </div>
        </section>

        <footer
          className="mt-6 border-t px-1 py-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: MEDIEVAL_THEME.premiumNoir.footer }}
          >
            {footerLabel ?? "Citadel Archives"}
          </p>
        </footer>
      </div>
    </main>
  );
}
