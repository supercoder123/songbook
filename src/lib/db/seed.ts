import { songRepository, setlistRepository } from "@/lib/repositories";
import { SAMPLE_SONGS, getSampleSetlist } from "@/data/sample-songs";

export async function seedDatabaseIfEmpty(): Promise<void> {
  // Check if we've already seeded before to avoid re-seeding default songs when user clears all data
  if (typeof window !== "undefined") {
    const alreadySeeded = localStorage.getItem("songbook_seeded");
    if (alreadySeeded === "true") {
      return;
    }
  }

  const count = await songRepository.count();
  if (count > 0) {
    if (typeof window !== "undefined") {
      localStorage.setItem("songbook_seeded", "true");
    }
    return;
  }

  const createdSongs = [];
  for (const song of SAMPLE_SONGS) {
    const created = await songRepository.create(song);
    createdSongs.push(created);
  }

  if (createdSongs.length >= 3) {
    await setlistRepository.create(
      getSampleSetlist(createdSongs.map((s) => s.id))
    );
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("songbook_seeded", "true");
  }
}
