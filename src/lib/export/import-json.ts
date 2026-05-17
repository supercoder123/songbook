import { db } from "@/lib/db/client";
import { backupSchema, type BackupData } from "./schemas";
import { DEFAULT_SETTINGS } from "@/types/settings";

export type ImportMode = "merge" | "replace";

export function parseBackupJson(json: string): BackupData {
  const parsed = JSON.parse(json);
  return backupSchema.parse(parsed);
}

export async function importBackup(
  data: BackupData,
  mode: ImportMode
): Promise<{ songs: number; setlists: number }> {
  const songsResponse = await fetch("/api/songs/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songs: data.songs, mode }),
  });

  if (!songsResponse.ok) {
    throw new Error("Could not import songs into Postgres");
  }

  const songsResult = (await songsResponse.json()) as { count: number };

  if (mode === "replace") {
    await db.transaction("rw", db.setlists, db.settings, async () => {
      await db.setlists.clear();
      await db.settings.clear();
    });
  }

  await db.transaction("rw", db.setlists, db.settings, async () => {
    if (mode === "merge") {
      for (const setlist of data.setlists) {
        await db.setlists.put(setlist);
      }
    } else {
      await db.setlists.bulkPut(data.setlists);
    }
    if (data.settings) {
      await db.settings.put(data.settings);
    } else if (mode === "replace") {
      await db.settings.put(DEFAULT_SETTINGS);
    }
  });

  return { songs: songsResult.count, setlists: data.setlists.length };
}
