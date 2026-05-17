"use client";

import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SongCard } from "@/components/song/song-card";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { useSongStore } from "@/stores/song-store";
import { toast } from "sonner";

export default function LibraryPage() {
  const { filters, setFilters, getFilteredSongs, toggleFavorite, duplicate, remove } =
    useSongStore();
  const songs = getFilteredSongs();

  const allTags = Array.from(new Set(useSongStore.getState().songs.flatMap((s) => s.tags)));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">{songs.length} songs</p>
        </div>
        <Link href="/songs/new" className={cn(buttonVariants())}>
          Add Song
        </Link>
      </div>

      <div className="mb-6 space-y-3">
        <SearchBar
          value={filters.search}
          onChange={(search) => setFilters({ search })}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
          >
            <Star className="mr-1 h-3 w-3" />
            Favorites
          </Button>
          <Button
            variant={filters.tag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ tag: null })}
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={filters.tag === tag ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-24 justify-center px-3"
              onClick={() => setFilters({ tag })}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No songs found"
          description="Add your first worship song or adjust your filters."
          action={
            <Link href="/songs/new" className={cn(buttonVariants())}>
              Add Song
            </Link>
          }
        />
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
        >
          {songs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              index={index}
              onToggleFavorite={() => toggleFavorite(song.id)}
              onDuplicate={async () => {
                await duplicate(song.id);
                toast.success("Song duplicated");
              }}
              onDelete={async () => {
                await remove(song.id);
                toast.success("Song deleted");
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
