"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const storageKey = "aitools-africa-theme";
const themeChangeEvent = "aitools-africa-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(themeChangeEvent, onChange);
  return () => window.removeEventListener(themeChangeEvent, onChange);
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const initial: Theme = saved === "light" || saved === "dark"
      ? saved
      : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.dataset.theme = initial;
    window.dispatchEvent(new Event(themeChangeEvent));
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(storageKey, next);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === "light"}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="fixed bottom-5 right-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#101619] text-[#20E39A] shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
    >
      {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  );
}
