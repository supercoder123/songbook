"use client";

import { create } from "zustand";
import { settingsRepository } from "@/lib/repositories";
import type { AppSettings } from "@/types/settings";

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,

  load: async () => {
    set({ loading: true });
    const settings = await settingsRepository.get();
    set({ settings, loading: false });
  },

  update: async (patch) => {
    const settings = await settingsRepository.update(patch);
    set({ settings });
    if (patch.theme) {
      applyTheme(patch.theme);
    }
  },
}));

export function applyTheme(theme: AppSettings["theme"]) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}
