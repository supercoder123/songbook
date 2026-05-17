"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2, Smartphone, Share2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore, applyTheme } from "@/stores/settings-store";
import { useSongStore } from "@/stores/song-store";
import { useSetlistStore } from "@/stores/setlist-store";
import { downloadBackup } from "@/lib/export/export-json";
import { importBackup, parseBackupJson, type ImportMode } from "@/lib/export/import-json";
import { db } from "@/lib/db/client";

function InstallCard() {
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;
    setInstalled(standalone);
  }, []);

  if (installed) return null;

  const steps =
    platform === "ios"
      ? [
          { icon: <Share2 className="h-4 w-4 text-blue-400" />, text: <>Tap the <strong>Share</strong> button <Share2 className="inline h-3 w-3" /> at the bottom of Safari</> },
          { icon: <span className="text-lg">⬆️</span>, text: <>Scroll down in the sheet and tap <strong>"Add to Home Screen"</strong></> },
          { icon: <span className="text-lg">✓</span>, text: <>Tap <strong>"Add"</strong> — the app will appear on your home screen</> },
        ]
      : [
          { icon: <MoreVertical className="h-4 w-4 text-zinc-300" />, text: <>Tap the <strong>three-dot menu</strong> ⋮ in Chrome (top-right corner)</> },
          { icon: <Smartphone className="h-4 w-4 text-zinc-300" />, text: <>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong></> },
          { icon: <span className="text-lg">✓</span>, text: <>Tap <strong>"Add"</strong> — done! Works offline once installed.</> },
        ];

  return (
    <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl shadow" />
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-500" />
              Install as App
            </CardTitle>
            <CardDescription>Works offline · No app store · Feels native</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-500">
          {platform === "ios" ? "Safari on iPhone / iPad" : "Chrome on Android"}
        </p>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-zinc-950">
                {i + 1}
              </span>
              <span className="text-zinc-300 leading-snug">{step.text}</span>
            </li>
          ))}
        </ol>
        {platform === "other" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Open this page in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone) to install.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { settings, update } = useSettingsStore();
  const loadSongs = useSongStore((s) => s.loadAll);
  const loadSetlists = useSetlistStore((s) => s.loadAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const handleImport = async () => {
    if (!pendingImport) return;
    try {
      const data = parseBackupJson(pendingImport);
      const result = await importBackup(data, importMode);
      await Promise.all([loadSongs(), loadSetlists()]);
      toast.success(`Imported ${result.songs} songs and ${result.setlists} setlists`);
      setPendingImport(null);
    } catch {
      toast.error("Invalid backup file");
    }
  };

  const handleClear = async () => {
    await db.transaction("rw", db.songs, db.setlists, async () => {
      await db.songs.clear();
      await db.setlists.clear();
    });
    await Promise.all([loadSongs(), loadSetlists()]);
    setClearOpen(false);
    toast.success("All data cleared");
  };

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Default performance mode preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(theme) => {
                update({ theme: theme as typeof settings.theme });
                applyTheme(theme as typeof settings.theme);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Accidentals</Label>
            <Select
              value={settings.accidentalPreference}
              onValueChange={(v) =>
                update({ accidentalPreference: v as typeof settings.accidentalPreference })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="sharp">Sharps</SelectItem>
                <SelectItem value="flat">Flats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default font size: {settings.defaultFontSize}px</Label>
              <Slider
                className="mt-2"
                value={[settings.defaultFontSize]}
                min={16}
                max={48}
                step={2}
                onValueChange={(v) => update({ defaultFontSize: Array.isArray(v) ? v[0] : v })}
              />
          </div>

          <div className="flex items-center justify-between">
            <Label>Section pagination by default</Label>
            <Switch
              checked={settings.sectionPaginationDefault}
              onCheckedChange={(v) => update({ sectionPaginationDefault: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Install App ── */}
      <InstallCard />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Export or import your library as JSON</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => downloadBackup()}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              setPendingImport(text);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setClearOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all data
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Songbook v1 · Schema version {settings.schemaVersion} · Works offline after first load
      </p>

      <Dialog open={!!pendingImport} onOpenChange={() => setPendingImport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import backup</DialogTitle>
            <DialogDescription>Choose how to import your data</DialogDescription>
          </DialogHeader>
          <Select value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge with existing</SelectItem>
              <SelectItem value="replace">Replace all data</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all songs and setlists. Export a backup first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}