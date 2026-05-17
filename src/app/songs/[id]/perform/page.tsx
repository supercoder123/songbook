"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PerformanceShell } from "@/components/performance/PerformanceShell";
import { useSongStore } from "@/stores/song-store";
import { usePerformanceStore } from "@/stores/performance-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function PerformSongPage() {
  const { id } = useParams<{ id: string }>();
  const song = useSongStore((s) => s.getById(id));
  const settings = useSettingsStore((s) => s.settings);
  const { setActiveSong, setFontSize, setChordSize, setLineSpacing, setSectionPagination } =
    usePerformanceStore();

  useEffect(() => {
    if (song) {
      setActiveSong(song);
      if (settings) {
        setFontSize(settings.defaultFontSize);
        setChordSize(settings.defaultChordSize);
        setLineSpacing(settings.defaultLineSpacing);
        setSectionPagination(settings.sectionPaginationDefault);
      }
    }
    return () => usePerformanceStore.getState().reset();
  }, [song, settings, setActiveSong, setFontSize, setChordSize, setLineSpacing, setSectionPagination]);

  if (!song) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Song not found
      </div>
    );
  }

  return <PerformanceShell song={song} />;
}
