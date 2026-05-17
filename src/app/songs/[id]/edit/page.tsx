"use client";

import { useParams } from "next/navigation";
import { SongEditor } from "@/components/song/song-editor";
import { useSongStore } from "@/stores/song-store";

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const song = useSongStore((s) => s.getById(id));

  if (!song) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Song not found</p>
      </div>
    );
  }

  return <SongEditor song={song} />;
}
