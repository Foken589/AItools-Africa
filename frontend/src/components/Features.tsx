import {
  BadgeDollarSign,
  Globe2,
  Layers3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Layers3,
    title: "Everything in one place",
    description:
      "Stop jumping between different AI websites. AItools Africa brings practical tools together in one simple platform.",
    accent: "green",
  },
  {
    icon: BadgeDollarSign,
    title: "Made to be affordable",
    description:
      "Access useful AI without requiring expensive subscriptions. Our goal is to make powerful technology accessible.",
    accent: "gold",
  },
  {
    icon: Sparkles,
    title: "Built for real problems",
    description:
      "We focus on tools that help you study, work, create, communicate, build, and solve everyday problems.",
    accent: "green",
  },
  {
    icon: Globe2,
    title: "Africa-first thinking",
    description:
      "Designed with the needs, realities, opportunities, and ambitions of African users in mind.",
    accent: "gold",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#0B1015] py-28"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute left-[-200px] top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[#20E39A]/[0.035] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F5B942]">
            Why AItools Africa
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            AI should work for you.
            <br />
            <span className="text-white/40">
              Not the other way around.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-white/45">
            We are building AItools Africa around one simple idea:
            powerful technology should be useful, accessible, and easy to
            understand.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isGreen = feature.accent === "green";

            return (
              <div
                key={feature.title}
                className="group relative bg-[#0B1015] p-7 transition-colors duration-300 hover:bg-white/[0.025]"
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                    isGreen
                      ? "border-[#20E39A]/20 bg-[#20E39A]/10"
                      : "border-[#F5B942]/20 bg-[#F5B942]/10"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isGreen
                        ? "text-[#20E39A]"
                        : "text-[#F5B942]"
                    }
                  />
                </div>

                {/* Content */}
                <h3 className="mt-7 text-base font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div
                  className={`mt-7 h-px w-8 transition-all duration-300 group-hover:w-14 ${
                    isGreen
                      ? "bg-[#20E39A]/50"
                      : "bg-[#F5B942]/50"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}