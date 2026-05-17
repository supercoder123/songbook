import { songRepository, setlistRepository } from "@/lib/repositories";
import { SAMPLE_SONGS, getSampleSetlist } from "@/data/sample-songs";

export async function seedDatabaseIfEmpty(): Promise<void> {
  const count = await songRepository.count();
  if (count > 0) return;

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
}
