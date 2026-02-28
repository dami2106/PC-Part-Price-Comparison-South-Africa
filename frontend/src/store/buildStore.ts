import { create } from "zustand";
import type { Build, BuildComponent } from "../types";
import { saveBuild } from "../api/client";

interface BuildStore {
  build: Build | null;
  saving: boolean;
  lastSaved: Date | null;
  setBuild: (build: Build) => void;
  setName: (name: string) => void;
  setComponent: (category: string, component: BuildComponent | null) => void;
  removeComponent: (category: string) => void;
  totalPrice: () => number;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(build: Build, set: (partial: Partial<BuildStore>) => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    set({ saving: true });
    try {
      await saveBuild(build);
      set({ saving: false, lastSaved: new Date() });
    } catch {
      set({ saving: false });
    }
  }, 600);
}

export const useBuildStore = create<BuildStore>((set, get) => ({
  build: null,
  saving: false,
  lastSaved: null,

  setBuild: (build) => set({ build }),

  setName: (name) => {
    const { build } = get();
    if (!build) return;
    const updated = { ...build, name };
    set({ build: updated });
    scheduleSave(updated, set);
  },

  setComponent: (category, component) => {
    const { build } = get();
    if (!build) return;
    const updated: Build = {
      ...build,
      components: { ...build.components, [category]: component },
    };
    set({ build: updated });
    scheduleSave(updated, set);
  },

  removeComponent: (category) => {
    const { build } = get();
    if (!build) return;
    const components = { ...build.components };
    delete components[category];
    const updated: Build = { ...build, components };
    set({ build: updated });
    scheduleSave(updated, set);
  },

  totalPrice: () => {
    const { build } = get();
    if (!build) return 0;
    return Object.values(build.components)
      .filter(Boolean)
      .reduce((sum, c) => sum + (c?.price ?? 0), 0);
  },
}));
