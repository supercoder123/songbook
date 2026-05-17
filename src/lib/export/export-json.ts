import { songRepository, setlistRepository, settingsRepository } from "@/lib/repositories";
import type { BackupData } from "./schemas";

export async function exportAllData(): Promise<BackupData> {
  const [songs, setlists, settings] = await Promise.all([
    songRepository.getAll(),
    setlistRepository.getAll(),
    settingsRepository.get(),
  ]);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    songs,
    setlists,
    settings,
  };
}

export async function downloadBackup(): Promise<void> {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `songbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
