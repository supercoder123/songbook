"use client";

import { create } from "zustand";
import type { Song } from "@/types/song";

interface PerformanceState {
  activeSong: Song | null;
  transposeOffset: number;
  fontSize: number;
  chordSize: number;
  lineSpacing: number;
  currentSectionIndex: number;
  sectionPagination: boolean;
  showNotes: boolean;
  fitToScreen: boolean;
  autoScrollPlaying: boolean;
  autoScrollSpeed: number;
  useBpmSpeed: boolean;
  setActiveSong: (song: Song | null) => void;
  setTransposeOffset: (offset: number) => void;
  setFontSize: (size: number) => void;
  setChordSize: (size: number) => void;
  setLineSpacing: (spacing: number) => void;
  setCurrentSectionIndex: (index: number) => void;
  nextSection: (max: number) => void;
  prevSection: () => void;
  setSectionPagination: (enabled: boolean) => void;
  setShowNotes: (show: boolean) => void;
  setFitToScreen: (fit: boolean) => void;
  setAutoScrollPlaying: (playing: boolean) => void;
  setAutoScrollSpeed: (speed: number) => void;
  setUseBpmSpeed: (use: boolean) => void;
  reset: () => void;
  registerPedalHandler?: (handler: (action: "next" | "prev" | "play") => void) => void;
}

const defaults = {
  transposeOffset: 0,
  fontSize: 20,
  chordSize: 14,
  lineSpacing: 1.5,
  currentSectionIndex: 0,
  sectionPagination: true,
  showNotes: false,
  fitToScreen: false,
  autoScrollPlaying: false,
  autoScrollSpeed: 40,
  useBpmSpeed: false,
};

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  activeSong: null,
  ...defaults,

  setActiveSong: (song) =>
    set({ activeSong: song, currentSectionIndex: 0, transposeOffset: 0 }),

  setTransposeOffset: (offset) => set({ transposeOffset: offset }),
  setFontSize: (size) => set({ fontSize: size }),
  setChordSize: (size) => set({ chordSize: size }),
  setLineSpacing: (spacing) => set({ lineSpacing: spacing }),
  setCurrentSectionIndex: (index) => set({ currentSectionIndex: index }),

  nextSection: (max) =>
    set((s) => ({
      currentSectionIndex: Math.min(s.currentSectionIndex + 1, max - 1),
    })),

  prevSection: () =>
    set((s) => ({
      currentSectionIndex: Math.max(s.currentSectionIndex - 1, 0),
    })),

  setSectionPagination: (enabled) => set({ sectionPagination: enabled }),
  setShowNotes: (show) => set({ showNotes: show }),
  setFitToScreen: (fit) => set({ fitToScreen: fit }),
  setAutoScrollPlaying: (playing) => set({ autoScrollPlaying: playing }),
  setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),
  setUseBpmSpeed: (use) => set({ useBpmSpeed: use }),

  reset: () => set({ activeSong: null, ...defaults }),
}));
