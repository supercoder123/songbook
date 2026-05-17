import { z } from "zod";
import { postgresSongRepository } from "@/lib/repositories/postgres-song-repository";
import { songSchema } from "@/lib/export/schemas";

const importSongsSchema = z.object({
  mode: z.enum(["merge", "replace"]),
  songs: z.array(songSchema),
});

export async function POST(request: Request) {
  try {
    const input = importSongsSchema.parse(await request.json());
    const count = await postgresSongRepository.importAll(input.songs, input.mode);
    return Response.json({ count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to import songs" },
      { status: 400 }
    );
  }
}
