import Link from "next/link";
import { UpdatePasswordForm } from "@/app/forgot-password/reset-form";

export default function ResetPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#070b0b] px-6"><div className="w-full max-w-md"><h1 className="mb-3 text-center text-3xl font-bold text-white">Choose a new password</h1><p className="mb-8 text-center text-white/55">Use at least 8 characters for your new password.</p><UpdatePasswordForm /><Link href="/login" className="mt-6 block text-center text-sm text-emerald-300">Back to sign in</Link></div></main>;
}
