import { create } from "zustand";

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
}

const stored = localStorage.getItem("pc-parts-theme");
const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const initialDark = stored ? stored === "dark" : prefersDark;

if (initialDark) document.documentElement.classList.add("dark");

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: initialDark,
  toggle: () =>
    set((state) => {
      const next = !state.dark;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("pc-parts-theme", next ? "dark" : "light");
      return { dark: next };
    }),
}));
