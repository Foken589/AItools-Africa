import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type ToolCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  accent: "green" | "gold";
  href?: string;
};

export default function ToolCard({
  icon: Icon,
  title,
  description,
  category,
  accent,
  href,
}: ToolCardProps) {
  const isGreen = accent === "green";

  const content = <>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[70px] transition-opacity duration-300 group-hover:opacity-100 ${
          isGreen ? "bg-[#20E39A]/10" : "bg-[#F5B942]/10"
        } opacity-0`}
      />

      {/* Top row */}
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
            isGreen
              ? "border-[#20E39A]/20 bg-[#20E39A]/10"
              : "border-[#F5B942]/20 bg-[#F5B942]/10"
          }`}
        >
          <Icon
            size={21}
            className={isGreen ? "text-[#20E39A]" : "text-[#F5B942]"}
          />
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-white/[0.06]">
          {href ? <ArrowUpRight size={17} className="text-emerald-300" /> : <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-white/55">Coming soon</span>}
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-auto pt-10">
        <p
          className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${
            isGreen ? "text-[#20E39A]" : "text-[#F5B942]"
          }`}
        >
          {category}
        </p>

        <h3 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
          {description}
        </p>
      </div>
  </>;
  const className = "group relative flex min-h-[250px] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.045]";
  return href ? <Link href={href} aria-label={`Open ${title}`} className={className}>{content}</Link> : <article aria-label={`${title}, coming soon`} className={className}>{content}</article>;
}
