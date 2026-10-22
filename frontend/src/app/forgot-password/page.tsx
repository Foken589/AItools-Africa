import Link from "next/link";
import { ForgotPasswordForm } from "./reset-form";

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#070b0b] px-6"><div className="w-full max-w-md"><h1 className="mb-3 text-center text-3xl font-bold text-white">Reset your password</h1><p className="mb-8 text-center text-white/55">We’ll send a secure reset link if an account matches that address.</p><ForgotPasswordForm /><Link href="/login" className="mt-6 block text-center text-sm text-emerald-300">Back to sign in</Link></div></main>;
}
