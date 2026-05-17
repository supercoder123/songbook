import { postgresSongRepository } from "@/lib/repositories/postgres-song-repository";
import { updateSongSchema } from "@/lib/export/schemas";

interface SongRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, ctx: SongRouteContext) {
  try {
    const { id } = await ctx.params;
    const song = await postgresSongRepository.getById(id);
    if (!song) return Response.json({ error: "Song not found" }, { status: 404 });

    return Response.json(song);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load song" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, ctx: SongRouteContext) {
  try {
    const { id } = await ctx.params;
    const patch = updateSongSchema.parse(await request.json());
    return Response.json(await postgresSongRepository.update(id, patch));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update song";
    return Response.json(
      { error: message },
      { status: message.startsWith("Song not found") ? 404 : 400 }
    );
  }
}

export async function DELETE(_request: Request, ctx: SongRouteContext) {
  try {
    const { id } = await ctx.params;
    await postgresSongRepository.delete(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete song" },
      { status: 500 }
    );
  }
}
