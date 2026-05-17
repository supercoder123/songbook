import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db/client";
import type { ISongRepository } from "./types";
import type { Song, CreateSongInput } from "@/types/song";

const SCHEMA_VERSION = 1;

export class IndexedDBSongRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    return db.songs.orderBy("updatedAt").reverse().toArray();
  }

  async getById(id: string): Promise<Song | null> {
    return (await db.songs.get(id)) ?? null;
  }

  async create(input: CreateSongInput): Promise<Song> {
    const now = new Date().toISOString();
    const song: Song = {
      ...input,
      id: uuidv4(),
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
    };
    await db.songs.add(song);
    return song;
  }

  async update(id: string, patch: Partial<Song>): Promise<Song> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Song not found: ${id}`);
    const updated: Song = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.songs.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.songs.delete(id);
  }

  async duplicate(id: string): Promise<Song> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Song not found: ${id}`);
    const { id: _id, createdAt, updatedAt, ...rest } = existing;
    return this.create({
      ...rest,
      title: `${rest.title} (Copy)`,
      favorite: false,
    });
  }

  async count(): Promise<number> {
    return db.songs.count();
  }
}

export const songRepository = new IndexedDBSongRepository();
