import "server-only";

import { count as sqlCount, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { assertPostgresConfigured, postgresDb } from "@/lib/db/postgres/client";
import { songs } from "@/lib/db/postgres/schema";
import type { ISongRepository } from "./types";
import type { CreateSongInput, Song } from "@/types/song";

const SCHEMA_VERSION = 1;
type SongRow = typeof songs.$inferSelect;

function toSong(row: SongRow): Song {
  return {
    ...row,
    bpm: row.bpm ?? undefined,
    timeSignature: row.timeSignature ?? undefined,
    youtubeUrl: row.youtubeUrl ?? undefined,
  };
}

export class PostgresSongRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    assertPostgresConfigured();
    const rows = await postgresDb.select().from(songs).orderBy(desc(songs.updatedAt));
    return rows.map(toSong);
  }

  async getById(id: string): Promise<Song | null> {
    assertPostgresConfigured();
    const [song] = await postgresDb
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);
    return song ? toSong(song) : null;
  }

  async create(input: CreateSongInput): Promise<Song> {
    assertPostgresConfigured();
    const now = new Date().toISOString();
    const song: Song = {
      ...input,
      id: uuidv4(),
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
    };

    await postgresDb.insert(songs).values(song);
    return song;
  }

  async update(id: string, patch: Partial<Song>): Promise<Song> {
    assertPostgresConfigured();
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Song not found: ${id}`);

    const updated: Song = {
      ...existing,
      ...patch,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Build explicit column map — Drizzle requires null (not undefined) for nullable columns.
    await postgresDb.update(songs).set({
      title: updated.title,
      artist: updated.artist,
      originalKey: updated.originalKey,
      currentKey: updated.currentKey,
      bpm: updated.bpm ?? null,
      timeSignature: updated.timeSignature ?? null,
      content: updated.content,
      notes: updated.notes ?? "",
      tags: updated.tags ?? [],
      favorite: updated.favorite,
      youtubeUrl: updated.youtubeUrl ?? null,
      updatedAt: updated.updatedAt,
      schemaVersion: updated.schemaVersion,
    }).where(eq(songs.id, id));

    return updated;
  }

  async delete(id: string): Promise<void> {
    assertPostgresConfigured();
    await postgresDb.delete(songs).where(eq(songs.id, id));
  }

  async duplicate(id: string): Promise<Song> {
    assertPostgresConfigured();
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Song not found: ${id}`);
    return this.create({
      title: `${existing.title} (Copy)`,
      artist: existing.artist,
      originalKey: existing.originalKey,
      currentKey: existing.currentKey,
      bpm: existing.bpm,
      timeSignature: existing.timeSignature,
      content: existing.content,
      notes: existing.notes,
      tags: existing.tags,
      favorite: false,
      youtubeUrl: existing.youtubeUrl,
    });
  }

  async count(): Promise<number> {
    assertPostgresConfigured();
    const [result] = await postgresDb.select({ count: sqlCount() }).from(songs);
    return result?.count ?? 0;
  }

  async importAll(importedSongs: Song[], mode: "merge" | "replace"): Promise<number> {
    assertPostgresConfigured();
    if (mode === "replace") {
      await postgresDb.delete(songs);
      if (importedSongs.length > 0) {
        await postgresDb.insert(songs).values(importedSongs);
      }
      return importedSongs.length;
    }

    for (const song of importedSongs) {
      await postgresDb
        .insert(songs)
        .values(song)
        .onConflictDoUpdate({ target: songs.id, set: song });
    }

    return importedSongs.length;
  }
}

export const postgresSongRepository = new PostgresSongRepository();
