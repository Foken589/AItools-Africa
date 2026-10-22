"use client";

import { useActionState } from "react";
import { requestPasswordReset, updatePassword } from "@/app/login/actions";

type State = { error?: string; success?: string };
const idle: State = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(async (_: State, formData: FormData): Promise<State> => requestPasswordReset(formData), idle);
  return <form action={action} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8"><label className="block text-sm text-white/80" htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none" />{state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}{state.success && <p role="status" className="text-sm text-emerald-200">{state.success}</p>}<button disabled={pending} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-black disabled:opacity-50">{pending ? "Sending…" : "Send reset link"}</button></form>;
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(async (_: State, formData: FormData): Promise<State> => updatePassword(formData), idle);
  return <form action={action} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8"><label className="block text-sm text-white/80" htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none" />{state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}<button disabled={pending} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-black disabled:opacity-50">{pending ? "Updating…" : "Update password"}</button></form>;
}
