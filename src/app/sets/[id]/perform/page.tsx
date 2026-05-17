"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PerformanceShell } from "@/components/performance/PerformanceShell";
import { useSetlistStore } from "@/stores/setlist-store";
import { useSongStore } from "@/stores/song-store";
import { usePerformanceStore } from "@/stores/performance-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function PerformSetPage() {
  const { id } = useParams<{ id: string }>();
  const setlist = useSetlistStore((s) => s.getById(id));
  const getSong = useSongStore((s) => s.getById);
  const settings = useSettingsStore((s) => s.settings);
  const { setActiveSong, setFontSize, setChordSize, setLineSpacing, setSectionPagination, setTransposeOffset } =
    usePerformanceStore();

  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedItems = useMemo(
    () => (setlist ? [...setlist.items].sort((a, b) => a.order - b.order) : []),
    [setlist]
  );

  const playableItems = useMemo(
    () => sortedItems.filter((item) => getSong(item.songId)),
    [getSong, sortedItems]
  );

  const activeIndex =
    playableItems.length > 0
      ? Math.min(currentIndex, playableItems.length - 1)
      : 0;
  const currentItem = playableItems[activeIndex];
  const currentSong = currentItem ? getSong(currentItem.songId) : undefined;

  const loadSong = useCallback(
    (index: number) => {
      const item = playableItems[index];
      if (!item) return;
      const song = getSong(item.songId);
      if (!song) return;
      setActiveSong(song);
      setTransposeOffset(item.transposeOffset ?? 0);
      if (settings) {
        setFontSize(settings.defaultFontSize);
        setChordSize(settings.defaultChordSize);
        setLineSpacing(settings.defaultLineSpacing);
        setSectionPagination(settings.sectionPaginationDefault);
      }
    },
    [playableItems, getSong, setActiveSong, setTransposeOffset, settings, setFontSize, setChordSize, setLineSpacing, setSectionPagination]
  );

  useEffect(() => {
    loadSong(activeIndex);
  }, [activeIndex, loadSong]);

  useEffect(() => {
    return () => usePerformanceStore.getState().reset();
  }, []);

  if (!setlist || !currentSong || !currentItem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        {!setlist
          ? "Setlist not found"
          : setlist.items.length > 0
            ? "The songs in this setlist are missing from the shared library"
            : "No songs in setlist"}
      </div>
    );
  }

  return (
    <PerformanceShell
      song={currentSong}
      performanceNotes={currentItem.performanceNotes}
      hasPrev={activeIndex > 0}
      hasNext={activeIndex < playableItems.length - 1}
      onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
      onNext={() => setCurrentIndex((i) => Math.min(playableItems.length - 1, i + 1))}
    />
  );
}
