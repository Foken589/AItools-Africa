import {
  FileText,
  Image,
  PenTool,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import ToolCard from "./ToolCard";

const tools = [
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Ask questions, brainstorm ideas, learn concepts, and get things done with an intelligent AI assistant.",
    category: "AI Assistant",
    accent: "green" as const,
  },
  {
    icon: FileText,
    title: "PDF Assistant",
    description:
      "Upload documents, understand complex information, summarize content, and find answers faster.",
    category: "Documents",
    accent: "gold" as const,
  },
  {
    icon: UserRoundCheck,
    title: "CV Builder",
    description:
      "Create professional CVs tailored to the opportunities you want to pursue.",
    category: "Career",
    accent: "green" as const,
  },
  {
    icon: PenTool,
    title: "Writing Assistant",
    description:
      "Write clearer emails, reports, proposals, essays, and professional content in less time.",
    category: "Productivity",
    accent: "gold" as const,
    href: "/tools/writing",
  },
  {
    icon: Image,
    title: "Image Tools",
    description:
      "Turn ideas into visuals and work with images using practical AI-powered tools.",
    category: "Creative",
    accent: "green" as const,
  },
];

export default function ToolsSection() {
  return (
    <section
      id="tools"
      className="relative overflow-hidden bg-[#080B0F] py-28"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[#20E39A]/[0.035] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#20E39A]">
            Explore the toolbox
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            One platform.
            <br />
            <span className="text-white/45">
              Many ways to get more done.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/45">
            Practical AI tools for the things you actually do — from
            understanding documents to creating content and building your
            career.
          </p>
        </div>

        {/* Tools grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              category={tool.category}
              accent={tool.accent}
              href={tool.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
