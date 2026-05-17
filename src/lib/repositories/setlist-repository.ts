import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db/client";
import type { ISetlistRepository } from "./types";
import type { Setlist, CreateSetlistInput } from "@/types/setlist";

export class IndexedDBSetlistRepository implements ISetlistRepository {
  async getAll(): Promise<Setlist[]> {
    return db.setlists.orderBy("updatedAt").reverse().toArray();
  }

  async getById(id: string): Promise<Setlist | null> {
    return (await db.setlists.get(id)) ?? null;
  }

  async create(input: CreateSetlistInput): Promise<Setlist> {
    const now = new Date().toISOString();
    const setlist: Setlist = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.setlists.add(setlist);
    return setlist;
  }

  async update(id: string, patch: Partial<Setlist>): Promise<Setlist> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Setlist not found: ${id}`);
    const updated: Setlist = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.setlists.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.setlists.delete(id);
  }
}

export const setlistRepository = new IndexedDBSetlistRepository();
