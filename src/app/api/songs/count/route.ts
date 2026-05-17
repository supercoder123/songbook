import { postgresSongRepository } from "@/lib/repositories/postgres-song-repository";

export async function GET() {
  try {
    return Response.json({ count: await postgresSongRepository.count() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to count songs" },
      { status: 500 }
    );
  }
}
