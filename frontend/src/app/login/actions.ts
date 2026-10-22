"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function credentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." } as const;
  if (password.length < 8 || password.length > 128) return { error: "Password must be between 8 and 128 characters." } as const;
  return { email, password } as const;
}

function safeDestination(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : "/dashboard";
}

function authErrorMessage(message: string, mode: "login" | "signup") {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect. Check your details and try again.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Instant sign-in is not enabled for this project yet. In Supabase, turn off Confirm email in the Email provider settings.";
  }
  if (normalized.includes("database error saving new user") || normalized.includes("database error querying schema")) {
    return "Supabase could not complete account creation. This can be caused by a failing database trigger or Auth configuration; check the Supabase Auth logs and database logs.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (mode === "signup" && (normalized.includes("already registered") || normalized.includes("already been registered"))) {
    return "If an account already exists for this email, sign in or reset its password.";
  }
  return mode === "login"
    ? "Unable to sign in. Check your details and verify the Supabase project settings."
    : "Unable to create the account. Check the Supabase Auth logs and project settings, then try again.";
}

export async function login(formData: FormData) {
  const input = credentials(formData);
  if ("error" in input) return input;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { error: authErrorMessage(error.message, "login") };
  redirect(safeDestination(formData.get("next")));
}

export async function signup(formData: FormData) {
  const input = credentials(formData);
  if ("error" in input) return input;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(input);
  if (error) return { error: authErrorMessage(error.message, "signup") };
  if (data.session) redirect(safeDestination(formData.get("next")));
  return { error: "Supabase created the account but did not start a session. Turn off Confirm email in the Supabase Email provider settings to allow immediate sign-in." };
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?next=/reset-password", siteUrl).toString(),
  });
  if (error) return { error: "We could not send a reset link. Please try again shortly." };
  return { success: "If an account exists for that email, a password reset link has been sent." };
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 128) return { error: "Password must be between 8 and 128 characters." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "This reset link is invalid or has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Unable to update your password. Request a new reset link and try again." };
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
