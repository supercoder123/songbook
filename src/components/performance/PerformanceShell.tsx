"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignJustify,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Settings2,
  StickyNote,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ChordRenderer } from "@/components/chord/ChordRenderer";
import { TransposeControls } from "./TransposeControls";
import { AutoScrollControls } from "./AutoScrollControls";
import { usePerformanceStore } from "@/stores/performance-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { parseSongBlocks } from "@/lib/chord/parser";
import type { Song } from "@/types/song";
import { cn } from "@/lib/utils";

interface PerformanceShellProps {
  song: Song;
  performanceNotes?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function PerformanceShell({
  song,
  performanceNotes,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PerformanceShellProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [viewMode, setViewMode] = useState<"pages" | "full">("pages");
  const settings = useSettingsStore((s) => s.settings);

  const {
    transposeOffset,
    showNotes,
    fitToScreen,
    autoScrollPlaying,
    autoScrollSpeed,
    useBpmSpeed,
    setTransposeOffset,
    setShowNotes,
    setFitToScreen,
    setAutoScrollPlaying,
    setAutoScrollSpeed,
    setUseBpmSpeed,
  } = usePerformanceStore();

  const FONT_SIZE = 19;
  const CHORD_SIZE = 13;
  const LINE_SPACING = 1.3;

  const blocks = parseSongBlocks(song.content || "");
  const totalPages = blocks.length;

  const goNext = useCallback(() => {
    if (viewMode !== "pages") return;
    if (pageIndex < totalPages - 1) {
      setDirection(1);
      setPageIndex((p) => p + 1);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else {
      onNext?.();
    }
  }, [viewMode, pageIndex, totalPages, onNext]);

  const goPrev = useCallback(() => {
    if (viewMode !== "pages") return;
    if (pageIndex > 0) {
      setDirection(-1);
      setPageIndex((p) => p - 1);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else {
      onPrev?.();
    }
  }, [viewMode, pageIndex, onPrev]);

  useEffect(() => { setPageIndex(0); }, [song.id]);

  useAutoScroll({
    containerRef: scrollRef,
    playing: autoScrollPlaying,
    speed: autoScrollSpeed,
    useBpm: useBpmSpeed,
    bpm: song.bpm,
  });

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useKeyboardShortcuts([
    { key: " ", handler: () => setAutoScrollPlaying(!autoScrollPlaying) },
    { key: "Escape", handler: () => panelOpen ? setPanelOpen(false) : router.back() },
    { key: "ArrowRight", handler: goNext },
    { key: "ArrowLeft", handler: goPrev },
    { key: "+", handler: () => setTransposeOffset(transposeOffset + 1) },
    { key: "-", handler: () => setTransposeOffset(transposeOffset - 1) },
  ]);

  const accidentalPreference = settings?.accidentalPreference ?? "auto";
  const currentBlock = blocks[pageIndex];

  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    if (viewMode !== "pages") return;
    const x = e.clientX;
    const w = e.currentTarget.clientWidth;
    if (x < w / 2) goPrev();
    else goNext();
  }, [viewMode, goNext, goPrev]);

  function BlockView({ block }: { block: typeof blocks[0] }) {
    return (
      <div
        className={cn(
          "relative",
          block.type === "chorus" && "border-l-2 border-amber-400/60 pl-3 bg-amber-400/5 py-2 rounded-r",
          block.type === "bridge" && "border-l-2 border-purple-400/40 pl-3 bg-purple-400/5 py-2 rounded-r",
        )}
      >
        {block.type !== "normal" && (
          <div className={cn(
            "mb-1 text-[10px] font-bold uppercase tracking-widest",
            block.type === "chorus" && "text-amber-400/80",
            block.type === "bridge" && "text-purple-400/70",
            block.type === "verse" && "text-zinc-500",
          )}>
            {block.type}
          </div>
        )}
        <ChordRenderer
          content={block.rawContent}
          transpose={transposeOffset}
          accidentalPreference={accidentalPreference}
          chordSize={CHORD_SIZE}
          fontSize={FONT_SIZE}
          lineSpacing={LINE_SPACING}
          performance
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-x-hidden bg-zinc-950 text-zinc-100">

      {/* Page dot indicators (pages mode) */}
      {viewMode === "pages" && totalPages > 1 && (
        <div className="absolute top-3 left-0 right-0 z-20 flex justify-center gap-1 pointer-events-none">
          {blocks.map((_, i) => (
            <span
              key={i}
              className={cn("h-1 rounded-full transition-all duration-300",
                i === pageIndex ? "w-4 bg-amber-400" : "w-1.5 bg-zinc-700")}
            />
          ))}
        </div>
      )}

      {/* Tap zones (pages mode) */}
      {viewMode === "pages" && (
        <div className="absolute inset-0 z-[5] flex pointer-events-none">
          <div className="flex-1 pointer-events-auto" onClick={handleTap} />
          <div className="flex-1 pointer-events-auto" onClick={handleTap} />
        </div>
      )}

      {/* ── Main content ── */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-3 pt-8 pb-20 md:px-5",
          fitToScreen && viewMode === "pages" && "flex flex-col justify-center"
        )}
      >
        {showNotes && (song.notes || performanceNotes) && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            {performanceNotes && <p className="mb-1 font-medium">{performanceNotes}</p>}
            {song.notes && <p>{song.notes}</p>}
          </div>
        )}
        {(song.bpm || song.timeSignature) && (
          <div className="mb-3 flex gap-4 text-xs font-semibold tracking-wider text-zinc-600">
            {song.bpm && <span>{song.bpm} BPM</span>}
            {song.timeSignature && <span className="text-amber-500/60">{song.timeSignature}</span>}
          </div>
        )}

        {viewMode === "pages" && (
          <AnimatePresence mode="wait" initial={false}>
            {currentBlock && (
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <BlockView block={currentBlock} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {viewMode === "full" && (
          <div className="space-y-5">
            {blocks.map((block, i) => <BlockView key={i} block={block} />)}
          </div>
        )}
      </div>

      {/* ── Always-visible Controls button ── */}
      {!panelOpen && (
        <button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
          onClick={() => setPanelOpen(true)}
        >
          <span className="block h-0.5 w-5 rounded-full bg-zinc-900/40" />
          Controls
          <span className="block h-0.5 w-5 rounded-full bg-zinc-900/40" />
        </button>
      )}

      {/* ── Combined bottom panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-30 rounded-t-2xl bg-zinc-900 border-t border-zinc-800 shadow-2xl"
          >
            {/* Drag handle + close */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex-1" />
              <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto" />
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                  onClick={() => setPanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Row 1 — Song info + nav + actions */}
            <div className="flex items-center gap-2 px-3 pb-2 border-b border-zinc-800">
              {/* Back */}
              <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400" onClick={() => router.back()}>
                <X className="h-4 w-4" />
              </Button>

              {/* Song title/artist */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">{song.title}</p>
                <p className="truncate text-xs text-zinc-400">{song.artist}</p>
              </div>

              {/* Prev / Next song */}
              {hasPrev && (
                <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400" onClick={onPrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {hasNext && (
                <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400" onClick={onNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* View mode */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                title={viewMode === "pages" ? "Full song view" : "Page view"}
                onClick={() => setViewMode(m => m === "pages" ? "full" : "pages")}
              >
                {viewMode === "pages"
                  ? <AlignJustify className="h-4 w-4 text-zinc-400" />
                  : <BookOpen className="h-4 w-4 text-amber-400" />}
              </Button>

              {/* Notes toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setShowNotes(!showNotes)}
              >
                <StickyNote className={cn("h-4 w-4", showNotes ? "text-amber-500" : "text-zinc-400")} />
              </Button>

              {/* Fullscreen */}
              <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Row 2 — Transpose */}
            <div className="px-3 pt-2">
              <TransposeControls
                originalKey={song.originalKey}
                transposeOffset={transposeOffset}
                onTransposeChange={setTransposeOffset}
                accidentalPreference={accidentalPreference}
                compact
              />
            </div>

            {/* Row 3 — Autoscroll */}
            <div className="px-3 pt-2 pb-6">
              <AutoScrollControls
                playing={autoScrollPlaying}
                speed={autoScrollSpeed}
                useBpm={useBpmSpeed}
                bpm={song.bpm}
                onPlayingChange={setAutoScrollPlaying}
                onSpeedChange={setAutoScrollSpeed}
                onUseBpmChange={setUseBpmSpeed}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="bg-zinc-900 p-6 text-zinc-100">
          <SheetHeader>
            <SheetTitle>Display Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">Fit to screen</span>
              <Switch checked={fitToScreen} onCheckedChange={setFitToScreen} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
