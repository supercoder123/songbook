"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Play, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DragSongList } from "@/components/setlist/drag-song-list";
import { useSetlistStore } from "@/stores/setlist-store";
import { useSongStore } from "@/stores/song-store";
import type { SetlistItem } from "@/types/setlist";

export default function SetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const setlist = useSetlistStore((s) => s.getById(id));
  const update = useSetlistStore((s) => s.update);
  const songs = useSongStore((s) => s.songs);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!setlist) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Setlist not found</p>
      </div>
    );
  }

  const availableSongs = songs.filter(
    (s) =>
      !setlist.items.some((i) => i.songId === s.id) &&
      (s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase()))
  );
  const playableItems = setlist.items.filter((item) =>
    songs.some((song) => song.id === item.songId)
  );

  const handleReorder = async (items: SetlistItem[]) => {
    await update(id, { items });
  };

  const handleAdd = async (songId: string) => {
    const items = [
      ...setlist.items,
      { songId, order: setlist.items.length },
    ];
    await update(id, { items });
    setAddOpen(false);
  };

  const handleRemove = async (songId: string) => {
    const items = setlist.items
      .filter((i) => i.songId !== songId)
      .map((item, order) => ({ ...item, order }));
    await update(id, { items });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{setlist.name}</h1>
          <p className="text-muted-foreground">{setlist.items.length} songs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Song
          </Button>
          <Link
            href={`/sets/${id}/perform`}
            className={cn(
              buttonVariants(),
              playableItems.length === 0 && "pointer-events-none opacity-50"
            )}
            aria-disabled={playableItems.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Perform Set
          </Link>
        </div>
      </div>

      <DragSongList
        items={setlist.items}
        songs={songs}
        onReorder={handleReorder}
        onRemove={handleRemove}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add songs</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {availableSongs.map((song) => (
              <button
                key={song.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"
                onClick={() => handleAdd(song.id)}
              >
                <span className="font-medium">{song.title}</span>
                <span className="text-sm text-muted-foreground">{song.artist}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
