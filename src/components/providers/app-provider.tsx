"use client";

import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { seedDatabaseIfEmpty } from "@/lib/db/seed";
import { useSongStore } from "@/stores/song-store";
import { useSetlistStore } from "@/stores/setlist-store";
import { useSettingsStore, applyTheme } from "@/stores/settings-store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const loadSongs = useSongStore((s) => s.loadAll);
  const loadSetlists = useSetlistStore((s) => s.loadAll);
  const loadSettings = useSettingsStore((s) => s.load);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    async function init() {
      try {
        await seedDatabaseIfEmpty();
        await Promise.all([loadSongs(), loadSetlists(), loadSettings()]);
        setReady(true);
      } catch (error) {
        setInitError(
          error instanceof Error ? error.message : "Songbook could not start"
        );
      }
    }
    init();
  }, [loadSongs, loadSetlists, loadSettings]);

  useEffect(() => {
    if (settings?.theme) applyTheme(settings.theme);
  }, [settings?.theme]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-3 px-6 text-center">
          {initError ? (
            <>
              <p className="font-medium text-destructive">Songbook could not connect</p>
              <p className="text-sm text-muted-foreground">{initError}</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-muted-foreground">Loading Songbook...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {children}
      <Toaster richColors position="bottom-center" />
    </TooltipProvider>
  );
}
