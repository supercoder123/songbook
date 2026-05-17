import type { ISongRepository } from "./types";
import type { CreateSongInput, Song } from "@/types/song";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Song API request failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export class SongApiRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    return parseJsonResponse<Song[]>(await fetch("/api/songs", { cache: "no-store" }));
  }

  async getById(id: string): Promise<Song | null> {
    const response = await fetch(`/api/songs/${id}`, { cache: "no-store" });
    if (response.status === 404) return null;
    return parseJsonResponse<Song>(response);
  }

  async create(song: CreateSongInput): Promise<Song> {
    return parseJsonResponse<Song>(
      await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      })
    );
  }

  async update(id: string, patch: Partial<Song>): Promise<Song> {
    return parseJsonResponse<Song>(
      await fetch(`/api/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
    );
  }

  async delete(id: string): Promise<void> {
    await parseJsonResponse<{ ok: true }>(
      await fetch(`/api/songs/${id}`, { method: "DELETE" })
    );
  }

  async duplicate(id: string): Promise<Song> {
    return parseJsonResponse<Song>(
      await fetch(`/api/songs/${id}/duplicate`, { method: "POST" })
    );
  }

  async count(): Promise<number> {
    const { count } = await parseJsonResponse<{ count: number }>(
      await fetch("/api/songs/count", { cache: "no-store" })
    );
    return count;
  }
}

export const songApiRepository = new SongApiRepository();
