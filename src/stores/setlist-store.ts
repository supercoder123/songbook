"use client";

import { create } from "zustand";
import { setlistRepository } from "@/lib/repositories";
import type { Setlist, CreateSetlistInput, SetlistItem } from "@/types/setlist";

interface SetlistState {
  setlists: Setlist[];
  loading: boolean;
  initialized: boolean;
  loadAll: () => Promise<void>;
  create: (input: CreateSetlistInput) => Promise<Setlist>;
  update: (id: string, patch: Partial<Setlist>) => Promise<Setlist>;
  remove: (id: string) => Promise<void>;
  reorderItems: (id: string, items: SetlistItem[]) => Promise<void>;
  addSong: (setlistId: string, songId: string) => Promise<void>;
  getById: (id: string) => Setlist | undefined;
}

export const useSetlistStore = create<SetlistState>((set, get) => ({
  setlists: [],
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true });
    const setlists = await setlistRepository.getAll();
    set({ setlists, loading: false, initialized: true });
  },

  create: async (input) => {
    const setlist = await setlistRepository.create(input);
    set((s) => ({ setlists: [setlist, ...s.setlists] }));
    return setlist;
  },

  update: async (id, patch) => {
    const setlist = await setlistRepository.update(id, patch);
    set((s) => ({
      setlists: s.setlists.map((item) => (item.id === id ? setlist : item)),
    }));
    return setlist;
  },

  remove: async (id) => {
    await setlistRepository.delete(id);
    set((s) => ({ setlists: s.setlists.filter((item) => item.id !== id) }));
  },

  reorderItems: async (id, items) => {
    await get().update(id, { items });
  },

  addSong: async (setlistId, songId) => {
    const setlist = get().getById(setlistId);
    if (!setlist) return;
    if (setlist.items.some((i) => i.songId === songId)) return;
    const items = [
      ...setlist.items,
      { songId, order: setlist.items.length },
    ];
    await get().update(setlistId, { items });
  },

  getById: (id) => get().setlists.find((s) => s.id === id),
}));
