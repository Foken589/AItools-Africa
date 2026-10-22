import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#080B0F] pt-20">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-20 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#20E39A]/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="absolute right-[-180px] top-[35%] -z-10 h-[350px] w-[350px] rounded-full bg-[#F5B942]/5 blur-[100px]"
      />

      {/* Subtle geometric pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-20 lg:px-8">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Main Hero Content */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#20E39A]/20 bg-[#20E39A]/5 px-4 py-2">
              <Sparkles size={14} className="text-[#20E39A]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#20E39A]">
                Africa&apos;s AI Toolbox
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Powerful AI tools.
              <br />

              <span className="bg-gradient-to-r from-[#20E39A] via-[#20E39A] to-[#F5B942] bg-clip-text text-transparent">
                Built for Africa.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              Create, learn, work, and automate with practical AI tools
              designed to help African students, professionals, creators,
              and businesses get more done.
            </p>

            {/* CTA buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#20E39A] px-6 py-3.5 text-sm font-semibold text-[#080B0F] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#35f0aa] hover:shadow-[0_0_35px_rgba(32,227,154,0.2)]"
              >
                Start Creating

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="#tools"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white/80 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Explore Tools
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/35">
              <span>✦ Simple to use</span>
              <span>✦ Affordable</span>
              <span>✦ Built with Africa in mind</span>
            </div>
          </div>

          {/* Floating Tool Preview */}
          <div className="relative hidden min-h-[500px] lg:block">

            {/* Main glow */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#20E39A]/10 blur-[90px]"
            />

            {/* Center AI card */}
            <div className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20E39A]/10">
                    <WandSparkles
                      size={19}
                      className="text-[#20E39A]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Assistant
                    </p>

                    <p className="text-xs text-white/35">
                      Ready to help
                    </p>
                  </div>
                </div>

                <span className="h-2 w-2 rounded-full bg-[#20E39A] shadow-[0_0_12px_rgba(32,227,154,0.8)]" />
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-sm leading-6 text-white/65">
                  What can I help you create today?
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span className="flex-1 text-xs text-white/25">
                  Ask anything...
                </span>

                <ArrowRight
                  size={15}
                  className="text-[#20E39A]"
                />
              </div>
            </div>

            {/* PDF card */}
            <div className="absolute left-0 top-20 w-52 rotate-[-5deg] rounded-2xl border border-white/10 bg-[#11161C]/90 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5B942]/10">
                  <FileText size={17} className="text-[#F5B942]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    PDF Assistant
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Summarize documents
                  </p>
                </div>
              </div>
            </div>

            {/* Writing card */}
            <div className="absolute bottom-20 right-0 w-52 rotate-[5deg] rounded-2xl border border-white/10 bg-[#11161C]/90 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#20E39A]/10">
                  <Sparkles size={17} className="text-[#20E39A]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Writing Assistant
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Write better. Faster.
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute right-16 top-8 h-2 w-2 rounded-full bg-[#F5B942]" />
            <div className="absolute bottom-12 left-20 h-1.5 w-1.5 rounded-full bg-[#20E39A]" />
          </div>
        </div>
      </div>
    </section>
  );
}
