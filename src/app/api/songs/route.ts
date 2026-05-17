import { postgresSongRepository } from "@/lib/repositories/postgres-song-repository";
import { createSongSchema } from "@/lib/export/schemas";

export async function GET() {
  try {
    return Response.json(await postgresSongRepository.getAll());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = createSongSchema.parse(await request.json());
    return Response.json(await postgresSongRepository.create(input), { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create song" },
      { status: 400 }
    );
  }
}
