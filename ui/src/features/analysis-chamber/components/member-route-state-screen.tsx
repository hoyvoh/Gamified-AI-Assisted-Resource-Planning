import Image from "next/image";
import Link from "next/link";

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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(217,173,93,0.15),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(36,54,79,0.18),transparent_28%),linear-gradient(180deg,#090607,#12151c)] px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-amber-200/10 px-1 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/45">
            {eyebrow}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/28">
            {overline ?? "Citadel Recovery Route"}
          </p>
        </header>

        <section className="relative mt-8 flex flex-1 items-center">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />
          <div className="grid w-full items-center gap-8 rounded-[32px] border border-amber-200/14 bg-[linear-gradient(180deg,rgba(24,26,33,0.94),rgba(13,10,11,0.96))] px-6 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_100px_rgba(0,0,0,0.55)] md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="relative z-10 max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/55">
                Realm State: Missing
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-[0.95] text-[#d8af63] drop-shadow-[0_0_18px_rgba(216,175,99,0.22)] md:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/68 md:text-lg">
                {description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryAction.href}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-sm border border-[#e0b969]/80 bg-[linear-gradient(135deg,#f2cb7f,#d6a759)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-[#2c2012] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                >
                  {primaryAction.label}
                </Link>
                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-sm border border-amber-200/30 bg-transparent px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-amber-100/82 transition hover:border-amber-100/45 hover:bg-amber-200/6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>

            {imageSrc ? (
              <div className="relative mx-auto flex w-full max-w-[360px] items-end justify-center self-end lg:justify-end">
                <div className="absolute bottom-0 h-10 w-44 rounded-[999px] bg-amber-200/12 blur-2xl" />
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

        <footer className="mt-6 border-t border-white/8 px-1 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/24">
            {footerLabel ?? "Citadel Archives"}
          </p>
        </footer>
      </div>
    </main>
  );
}
