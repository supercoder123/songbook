import { db } from "@/lib/db/client";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { ISettingsRepository } from "./types";
import type { AppSettings } from "@/types/settings";

export class IndexedDBSettingsRepository implements ISettingsRepository {
  async get(): Promise<AppSettings> {
    const existing = await db.settings.get("app-settings");
    if (existing) return existing;
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const updated = { ...current, ...patch, id: "app-settings" as const };
    await db.settings.put(updated);
    return updated;
  }
}

export const settingsRepository = new IndexedDBSettingsRepository();
