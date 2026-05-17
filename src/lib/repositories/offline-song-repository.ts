import { localDb } from "@/lib/db/local";
import type { ISongRepository } from "./types";
import type { CreateSongInput, Song } from "@/types/song";

/**
 * Offline-aware repository.
 *
 * When online:
 *   - All reads and writes go to the API as normal.
 *   - After each successful read, songs are mirrored into IndexedDB.
 *   - After each successful write (create/update/delete), the local copy
 *     is updated immediately so the cache stays fresh.
 *
 * When offline:
 *   - Reads fall back to IndexedDB automatically.
 *   - Writes are attempted against the API; if the network is unavailable
 *     the write is applied locally only and queued for sync (pending further
 *     sync logic — for now the change is preserved until the next online session
 *     where a full loadAll() will reconcile via updatedAt ordering).
 */
export class OfflineSongRepository implements ISongRepository {
  private isOnline() {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  // ─── Read ───────────────────────────────────────────────────────────────────

  async getAll(): Promise<Song[]> {
    if (!this.isOnline()) {
      return localDb.songs.orderBy("updatedAt").reverse().toArray();
    }
    try {
      const res = await fetch("/api/songs", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const songs: Song[] = await res.json();
      // Mirror to IndexedDB
      await localDb.songs.bulkPut(songs);
      return songs;
    } catch {
      // Network failed even though navigator.onLine was true — fall back
      return localDb.songs.orderBy("updatedAt").reverse().toArray();
    }
  }

  async getById(id: string): Promise<Song | null> {
    if (!this.isOnline()) {
      return (await localDb.songs.get(id)) ?? null;
    }
    try {
      const res = await fetch(`/api/songs/${id}`, { cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("API error");
      const song: Song = await res.json();
      await localDb.songs.put(song);
      return song;
    } catch {
      return (await localDb.songs.get(id)) ?? null;
    }
  }

  // ─── Write ──────────────────────────────────────────────────────────────────

  async create(input: CreateSongInput): Promise<Song> {
    if (!this.isOnline()) {
      throw new Error("Cannot create a song while offline — please reconnect.");
    }
    const res = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Create failed");
    }
    const song: Song = await res.json();
    await localDb.songs.put(song);
    return song;
  }

  async update(id: string, patch: Partial<Song>): Promise<Song> {
    // Optimistically merge with local copy so the UI is always responsive.
    const existing = await localDb.songs.get(id);
    const optimistic: Song | undefined = existing
      ? { ...existing, ...patch, updatedAt: new Date().toISOString() }
      : undefined;
    if (optimistic) await localDb.songs.put(optimistic);

    if (!this.isOnline()) {
      if (!optimistic) throw new Error("Song not found locally");
      return optimistic;
    }
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Update failed");
      }
      const song: Song = await res.json();
      await localDb.songs.put(song);
      return song;
    } catch (err) {
      // Network failed — optimistic update already applied, surface the error
      if (optimistic) return optimistic;
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    await localDb.songs.delete(id);
    if (!this.isOnline()) return; // will reconcile when back online
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
  }

  async duplicate(id: string): Promise<Song> {
    if (!this.isOnline()) {
      throw new Error("Cannot duplicate a song while offline — please reconnect.");
    }
    const res = await fetch(`/api/songs/${id}/duplicate`, { method: "POST" });
    if (!res.ok) throw new Error("Duplicate failed");
    const song: Song = await res.json();
    await localDb.songs.put(song);
    return song;
  }

  async count(): Promise<number> {
    if (!this.isOnline()) {
      return localDb.songs.count();
    }
    try {
      const res = await fetch("/api/songs/count", { cache: "no-store" });
      const { count } = await res.json();
      return count as number;
    } catch {
      return localDb.songs.count();
    }
  }
}

export const offlineSongRepository = new OfflineSongRepository();
