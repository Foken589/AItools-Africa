import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { logout } from "@/app/login/actions";

export default function Navbar({ user }: { user: { email: string } | null }) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#080B0F]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
            <span className="text-lg font-bold text-emerald-400">
              A
            </span>
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-semibold tracking-tight text-white">
              AItools
            </div>
            <div className="text-xs font-medium tracking-[0.25em] text-[#F5B942]">
              AFRICA
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#tools"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Tools
          </Link>

          <Link
            href="#features"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Features
          </Link>

          <Link
            href="#pricing"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Pricing
          </Link>

          <Link
            href="#features"
            className="text-sm text-white/70 transition hover:text-white"
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? <>
            <span className="hidden max-w-40 truncate text-xs text-white/60 sm:block" title={user.email}>{user.email}</span>
            <Link href="/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Dashboard</Link>
            <form action={logout}><button className="text-sm text-white/70 hover:text-white">Log out</button></form>
          </> : <>
            <Link href="/login" className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block">Login</Link>
            <Link href="/login?mode=signup" className="group flex items-center gap-2 rounded-full bg-[#20E39A] px-5 py-2.5 text-sm font-semibold text-[#080B0F] transition hover:scale-[1.02] hover:bg-[#35f0aa]">
              Get Started <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </>}
        </div>

      </nav>
    </header>
  );
}
