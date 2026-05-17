import { postgresSongRepository } from "@/lib/repositories/postgres-song-repository";

interface SongRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, ctx: SongRouteContext) {
  try {
    const { id } = await ctx.params;
    return Response.json(await postgresSongRepository.duplicate(id), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to duplicate song";
    return Response.json(
      { error: message },
      { status: message.startsWith("Song not found") ? 404 : 500 }
    );
  }
}
