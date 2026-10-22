import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
} from "lucide-react";

const productLinks = [
  { label: "AI Assistant", href: "#tools" },
  { label: "PDF Assistant", href: "#tools" },
  { label: "CV Builder", href: "#tools" },
  { label: "Writing Assistant", href: "#tools" },
];

const companyLinks = [
  { label: "About", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-white/[0.08] bg-[#080B0F]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#20E39A]/30 bg-[#20E39A]/10">
                <span className="text-lg font-bold text-[#20E39A]">
                  A
                </span>
              </div>

              <div>
                <div className="text-lg font-semibold text-white">
                  AItools
                </div>

                <div className="text-[10px] font-medium tracking-[0.25em] text-[#F5B942]">
                  AFRICA
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-6 text-white/40">
              Practical AI tools designed to help African students,
              professionals, creators, and businesses do more.
            </p>

            {/* Contact links */}
            <div className="mt-7 flex items-center gap-3">
              <Link href="/contact" aria-label="Contact support" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition hover:border-white/20 hover:text-white"><Mail size={16} /></Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Product
            </h3>

            <div className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/40 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Company
            </h3>

            <div className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/40 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Ready to start?
            </h3>

            <p className="mt-5 text-sm leading-6 text-white/40">
              Try AItools Africa for free and discover what you can build.
            </p>

            <Link
              href="/signup"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#20E39A]"
            >
              Get started

              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.08] pt-7 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AItools Africa. All rights
            reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-white/50"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white/50"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
