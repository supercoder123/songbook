"use client";

import { create } from "zustand";
import { songRepository } from "@/lib/repositories";
import type { Song, CreateSongInput } from "@/types/song";

interface SongFilters {
  search: string;
  tag: string | null;
  favoritesOnly: boolean;
}

interface SongState {
  songs: Song[];
  loading: boolean;
  initialized: boolean;
  filters: SongFilters;
  loadAll: () => Promise<void>;
  create: (input: CreateSongInput) => Promise<Song>;
  update: (id: string, patch: Partial<Song>) => Promise<Song>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<Song>;
  toggleFavorite: (id: string) => Promise<void>;
  setFilters: (filters: Partial<SongFilters>) => void;
  getFilteredSongs: () => Song[];
  getById: (id: string) => Song | undefined;
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  loading: false,
  initialized: false,
  filters: { search: "", tag: null, favoritesOnly: false },

  loadAll: async () => {
    set({ loading: true });
    const songs = await songRepository.getAll();
    set({ songs, loading: false, initialized: true });
  },

  create: async (input) => {
    const song = await songRepository.create(input);
    set((s) => ({ songs: [song, ...s.songs] }));
    return song;
  },

  update: async (id, patch) => {
    const song = await songRepository.update(id, patch);
    set((s) => ({
      songs: s.songs.map((item) => (item.id === id ? song : item)),
    }));
    return song;
  },

  remove: async (id) => {
    await songRepository.delete(id);
    set((s) => ({ songs: s.songs.filter((item) => item.id !== id) }));
  },

  duplicate: async (id) => {
    const song = await songRepository.duplicate(id);
    set((s) => ({ songs: [song, ...s.songs] }));
    return song;
  },

  toggleFavorite: async (id) => {
    const song = get().songs.find((s) => s.id === id);
    if (!song) return;
    await get().update(id, { favorite: !song.favorite });
  },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  getFilteredSongs: () => {
    const { songs, filters } = get();
    const q = filters.search.toLowerCase().trim();
    return songs.filter((song) => {
      if (filters.favoritesOnly && !song.favorite) return false;
      if (filters.tag && !song.tags.includes(filters.tag)) return false;
      if (!q) return true;
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  },

  getById: (id) => get().songs.find((s) => s.id === id),
}));
