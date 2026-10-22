"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const tasks = [
  ["improve", "Improve my writing"],
  ["summarize", "Summarize text"],
  ["email", "Draft an email"],
  ["study", "Explain a study topic"],
] as const;

export default function WritingTool() {
  const router = useRouter();
  const [task, setTask] = useState<(typeof tasks)[number][0]>("improve");
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setOutput(""); setCopied(false); setPending(true);
    try {
      const response = await fetch("/api/tools/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, text }),
      });
      const result = await response.json() as { output?: string; remainingToday?: number; error?: string };
      if (!response.ok) {
        if (response.status === 401) { router.push(`/login?next=${encodeURIComponent("/tools/writing")}`); return; }
        throw new Error(result.error ?? "The request could not be completed.");
      }
      if (!result.output) throw new Error("The provider returned no text. Please retry.");
      setOutput(result.output);
      setRemaining(result.remainingToday ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be completed.");
    } finally { setPending(false); }
  }

  async function copyOutput() {
    try { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setError("Clipboard access is unavailable. Select and copy the output manually."); }
  }

  return <div className="mt-10 grid gap-6 lg:grid-cols-2">
    <form onSubmit={generate} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <label htmlFor="task" className="mb-2 block text-sm font-medium text-white/80">What do you need?</label>
      <select id="task" value={task} onChange={(event) => setTask(event.target.value as typeof task)} className="w-full rounded-xl border border-white/10 bg-[#101619] px-4 py-3 text-white focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
        {tasks.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <label htmlFor="source-text" className="mb-2 mt-5 block text-sm font-medium text-white/80">Your text or notes</label>
      <textarea id="source-text" value={text} onChange={(event) => setText(event.target.value)} minLength={3} maxLength={8000} required rows={12} placeholder="Paste text or describe what you want help with…" className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400" />
      <div className="mt-2 flex justify-between text-xs text-white/45"><span>Don’t include passwords or sensitive personal information.</span><span>{text.length}/8,000</span></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button disabled={pending || text.trim().length < 3} className="mt-5 w-full rounded-full bg-[#20E39A] px-5 py-3 text-sm font-semibold text-[#080B0F] transition hover:bg-[#35f0aa] disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Working…" : "Generate"}</button>
      <p className="mt-3 text-xs text-white/40">Signed-in accounts can make up to 5 successful requests per UTC day, with a short rate limit. This free allowance can be configured by the operator.</p>
      {remaining !== null && <p role="status" className="mt-2 text-xs text-emerald-200">{remaining} free {remaining === 1 ? "request" : "requests"} remaining today.</p>}
    </form>
    <section aria-live="polite" aria-busy={pending} className="min-h-80 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Result</h2>{output && <button type="button" onClick={copyOutput} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 hover:bg-white/5">{copied ? "Copied" : "Copy"}</button>}</div>
      {pending ? <p className="mt-6 animate-pulse text-sm text-white/55">Generating your result…</p> : output ? <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-white/85">{output}</pre> : <p className="mt-5 text-sm leading-6 text-white/45">Your result will appear here. Each successful request counts against the daily free allowance.</p>}
    </section>
  </div>;
}
