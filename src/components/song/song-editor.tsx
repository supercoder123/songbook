"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Info, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChordRenderer } from "@/components/chord/ChordRenderer";
import { parseSongBlocks } from "@/lib/chord/parser";
import { useSongStore } from "@/stores/song-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { Song, CreateSongInput } from "@/types/song";

interface SongEditorProps {
  song?: Song;
}

const defaultSong: CreateSongInput = {
  title: "",
  artist: "",
  originalKey: "C",
  currentKey: "C",
  content: "",
  notes: "",
  tags: [],
  favorite: false,
};

function stringifyMeta(form: CreateSongInput) {
  const lines = [];
  if (form.title) lines.push(`{title: ${form.title}}`);
  if (form.artist) lines.push(`{artist: ${form.artist}}`);
  if (form.originalKey) lines.push(`{key: ${form.originalKey}}`);
  if (form.bpm) lines.push(`{bpm: ${form.bpm}}`);
  if (form.timeSignature) lines.push(`{time: ${form.timeSignature}}`);
  if (form.tags?.length) lines.push(`{tags: ${form.tags.join(', ')}}`);
  if (form.youtubeUrl) lines.push(`{youtube: ${form.youtubeUrl}}`);
  if (form.notes) lines.push(`{notes: ${form.notes}}`);
  return lines.join('\n');
}

function parseMeta(metaString: string, existingForm: CreateSongInput): CreateSongInput {
  const result = { ...existingForm };
  const lines = metaString.split('\n');
  
  // reset values so removing a line clears it
  result.title = "";
  result.artist = "";
  result.originalKey = "C";
  result.currentKey = "C";
  result.bpm = undefined;
  result.timeSignature = undefined;
  result.tags = [];
  result.youtubeUrl = undefined;
  result.notes = "";

  for (const line of lines) {
    const match = line.match(/^\{([^:]+):\s*(.+)\}$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      if (key === 'title') result.title = value;
      else if (key === 'artist') result.artist = value;
      else if (key === 'key') {
        result.originalKey = value;
        result.currentKey = value;
      }
      else if (key === 'bpm') result.bpm = parseInt(value, 10) || undefined;
      else if (key === 'time' || key === 'timesignature' || key === 'style' || key === 'styles') result.timeSignature = value;
      else if (key === 'tags') result.tags = value.split(',').map(t => t.trim()).filter(Boolean);
      else if (key === 'youtube' || key === 'youtubeurl') result.youtubeUrl = value;
      else if (key === 'notes') result.notes = value;
    }
  }
  return result;
}

export function SongEditor({ song }: SongEditorProps) {
  const router = useRouter();
  const create = useSongStore((s) => s.create);
  const update = useSongStore((s) => s.update);
  const settings = useSettingsStore((s) => s.settings);

  const [form, setForm] = useState<CreateSongInput>(song ? { ...song } : defaultSong);
  const [metaText, setMetaText] = useState(stringifyMeta(song ? { ...song } : defaultSong));

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedJson = useRef<string>(song ? JSON.stringify(form) : "");
  const songId = song?.id;
  const isNew = !song;

  // Autocomplete / directive helper
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      // Very basic implementation: wait for them to type /v, /c, etc.
      // A more complete implementation would use a floating dropdown.
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    let val = target.value;
    const cursorStart = target.selectionStart;
    const textareaScrollTop = target.scrollTop;
    const scrollParent = target.closest('.overflow-y-auto');
    const parentScrollTop = scrollParent ? scrollParent.scrollTop : 0;
    
    let matched = false;
    let cursorOffset = 0;

    val = val.replace(/(^|\n)\/(verse|v|chorus|c|bridge|b)(?=$|\n)/gi, (match, p1, p2, offset) => {
      matched = true;
      let tag = "verse";
      if (/^(chorus|c)$/i.test(p2)) tag = "chorus";
      if (/^(bridge|b)$/i.test(p2)) tag = "bridge";
      
      const replacement = `${p1}{start_of_${tag}}\n\n{end_of_${tag}}`;
      if (cursorStart >= offset && cursorStart <= offset + match.length) {
        cursorOffset = offset + p1.length + `{start_of_${tag}}\n`.length;
      }
      return replacement;
    });

    setForm({ ...form, content: val });

    if (matched && cursorOffset > 0) {
      setTimeout(() => {
        target.setSelectionRange(cursorOffset, cursorOffset);
        target.scrollTop = textareaScrollTop;
        if (scrollParent) scrollParent.scrollTop = parentScrollTop;
      }, 0);
    }
  };

  const insertDirective = (type: string) => {
    const textToInsert = `{start_of_${type}}\n\n{end_of_${type}}\n`;
    setForm({ ...form, content: form.content + (form.content.endsWith('\n') || !form.content ? '' : '\n') + textToInsert });
  };

  const handleMetaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    let val = target.value;
    const cursorStart = target.selectionStart;
    const textareaScrollTop = target.scrollTop;
    const scrollParent = target.closest('.overflow-y-auto');
    const parentScrollTop = scrollParent ? scrollParent.scrollTop : 0;
    
    let matched = false;
    let cursorOffset = 0;

    const metaDirectives = ['title', 'artist', 'key', 'bpm', 'time', 'style', 'tags', 'youtube', 'notes'];
    for (const dir of metaDirectives) {
      val = val.replace(new RegExp(`(^|\\n)\\/${dir}(?=$|\\n)`, 'gi'), (match, p1, offset) => {
        matched = true;
        const replacement = `${p1}{${dir}: }`;
        if (cursorStart >= offset && cursorStart <= offset + match.length) {
          cursorOffset = offset + p1.length + `{${dir}: `.length;
        }
        return replacement;
      });
    }

    setMetaText(val);
    setForm(parseMeta(val, form));

    if (matched && cursorOffset > 0) {
      setTimeout(() => {
        target.setSelectionRange(cursorOffset, cursorOffset);
        target.scrollTop = textareaScrollTop;
        if (scrollParent) scrollParent.scrollTop = parentScrollTop;
      }, 0);
    }
  };

  const persist = useCallback(
    async (data: CreateSongInput) => {
      if (!data.title.trim() || !songId) return;
      const json = JSON.stringify(data);
      if (json === lastSavedJson.current) return;

      setSaveStatus("saving");
      await update(songId, data);
      lastSavedJson.current = json;
      setSaveStatus("saved");

      if (statusTimeout.current) clearTimeout(statusTimeout.current);
      statusTimeout.current = setTimeout(() => setSaveStatus("idle"), 2000);
    },
    [songId, update]
  );

  useEffect(() => {
    if (isNew) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void persist(form);
    }, 800);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [form, isNew, persist]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required in metadata");
      return;
    }
    if (isNew) {
      const created = await create(form);
      toast.success("Song created");
      router.push(`/songs/${created.id}/edit`);
    } else {
      await update(song!.id, form);
      lastSavedJson.current = JSON.stringify(form);
      toast.success("Saved");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Editor column */}
      <div className="flex-1 overflow-y-auto flex flex-col border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Song" : "Edit Song"}
            </h1>
            {!isNew && saveStatus !== "idle" && (
              <p className="text-xs text-muted-foreground">
                {saveStatus === "saving" ? "Saving…" : "All changes saved"}
              </p>
            )}
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <div className="flex items-center">
                <label className="text-sm font-medium">Metadata</label>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground ml-2" type="button">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm" align="start">
                    <div className="space-y-3">
                      <h4 className="font-medium leading-none">Editor Cheatsheet</h4>
                      <p className="text-muted-foreground text-xs">Type these slash commands on a new line to quickly insert directives.</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <strong className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1.5">Metadata</strong>
                          <ul className="space-y-1.5 text-xs">
                            <li><kbd className="px-1 bg-muted rounded">/title</kbd> Title</li>
                            <li><kbd className="px-1 bg-muted rounded">/artist</kbd> Artist</li>
                            <li><kbd className="px-1 bg-muted rounded">/key</kbd> Key</li>
                            <li><kbd className="px-1 bg-muted rounded">/bpm</kbd> BPM</li>
                            <li><kbd className="px-1 bg-muted rounded">/time</kbd> Time</li>
                            <li><kbd className="px-1 bg-muted rounded">/style</kbd> Style</li>
                            <li><kbd className="px-1 bg-muted rounded">/tags</kbd> Tags</li>
                            <li><kbd className="px-1 bg-muted rounded">/notes</kbd> Notes</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="block text-[10px] uppercase tracking-wider text-amber-500 mb-1.5">Content</strong>
                          <ul className="space-y-1.5 text-xs">
                            <li><kbd className="px-1 bg-muted rounded">/v</kbd> Verse</li>
                            <li><kbd className="px-1 bg-muted rounded">/c</kbd> Chorus</li>
                            <li><kbd className="px-1 bg-muted rounded">/b</kbd> Bridge</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
                Type <kbd className="px-1 bg-muted rounded">/title</kbd>, <kbd className="px-1 bg-muted rounded">/key</kbd>, etc.
              </p>
            </div>
            <Textarea
              value={metaText}
              onChange={handleMetaChange}
              placeholder="{title: What A Beautiful Name}&#10;{artist: Hillsong Worship}&#10;{key: D}"
              className="font-mono text-sm h-32"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium mb-1 block">Content</label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                Type <kbd className="px-1 bg-muted rounded">/v</kbd>, <kbd className="px-1 bg-muted rounded">/c</kbd> on a new line to insert directives.
              </p>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button type="button" variant="outline" size="sm" onClick={() => insertDirective('verse')}>Verse</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertDirective('chorus')}>Chorus</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertDirective('bridge')}>Bridge</Button>
              </div>
            </div>
            <Textarea
              value={form.content}
              onChange={handleContentChange}
              onKeyDown={handleContentKeyDown}
              placeholder="{start_of_verse}&#10;[D]You were the Word at the beginning&#10;{end_of_verse}"
              className="font-mono text-sm flex-1 min-h-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Mobile-only: collapsible accordion preview */}
      <div className="lg:hidden border-t border-border">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 transition-colors"
          onClick={() => setPreviewOpen((o) => !o)}
        >
          <span className="flex items-center gap-2">
            {previewOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Live Preview
          </span>
          <span className="text-xs font-normal">{previewOpen ? "Hide" : "Show"}</span>
        </button>
        {previewOpen && (
          <div className="overflow-y-auto max-h-[60vh] bg-muted/30 p-4">
            <ChordRenderer
              content={form.content}
              transpose={0}
              accidentalPreference={settings?.accidentalPreference}
              fontSize={19}
              chordSize={13}
              lineSpacing={1.3}
              performance
            />
          </div>
        )}
      </div>

      {/* Desktop-only: always-visible side preview panel with phone frame */}
      <div className="hidden lg:flex w-[26rem] flex-shrink-0 flex-col border-l border-border bg-muted/20">
        {/* Preview panel header */}
        {(() => {
          const previewBlocks = parseSongBlocks(form.content || "");
          const totalPreviewPages = previewBlocks.length || 1;
          const safePage = Math.min(previewPageIndex, totalPreviewPages - 1);
          const currentPreviewBlock = previewBlocks[safePage];
          return (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div>
                  <p className="text-sm font-semibold">Live Preview</p>
                  <p className="text-xs text-muted-foreground">360 × 699 • tap phone to navigate pages</p>
                </div>
                {totalPreviewPages > 1 && (
                  <span className="text-xs text-muted-foreground">{safePage + 1}/{totalPreviewPages}</span>
                )}
              </div>
              <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                <div
                  className="relative flex-shrink-0 rounded-[2rem] bg-zinc-950 text-zinc-100 shadow-2xl ring-1 ring-zinc-700 overflow-hidden"
                  style={{ width: 360, height: 699 }}
                >
                  {/* Notch strip */}
                  <div className="h-7 flex items-center justify-center bg-zinc-950">
                    <div className="w-16 h-1 rounded-full bg-zinc-800" />
                  </div>

                  {/* Page dot indicators */}
                  {totalPreviewPages > 1 && (
                    <div className="absolute top-8 left-0 right-0 z-10 flex justify-center gap-1 pointer-events-none">
                      {previewBlocks.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 rounded-full transition-all duration-200 ${
                            i === safePage ? "w-4 bg-amber-400" : "w-1.5 bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tap zones */}
                  <div className="absolute inset-0 z-10 flex" style={{ top: 28 }}>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setPreviewPageIndex(Math.max(0, safePage - 1))}
                    />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setPreviewPageIndex(Math.min(totalPreviewPages - 1, safePage + 1))}
                    />
                  </div>

                  {/* Content area */}
                  <div className="overflow-hidden px-3 pb-6" style={{ height: 699 - 28 }}>
                    {form.content ? (
                      currentPreviewBlock ? (
                        <div
                          className={`h-full ${
                            currentPreviewBlock.type === "chorus"
                              ? "border-l-2 border-amber-400/60 pl-3 bg-amber-400/5"
                              : currentPreviewBlock.type === "bridge"
                              ? "border-l-2 border-purple-400/40 pl-3 bg-purple-400/5"
                              : ""
                          }`}
                        >
                          {currentPreviewBlock.type !== "normal" && (
                            <div className={`pt-2 mb-1 text-[10px] font-bold uppercase tracking-widest ${
                              currentPreviewBlock.type === "chorus" ? "text-amber-400/80" :
                              currentPreviewBlock.type === "bridge" ? "text-purple-400/70" :
                              "text-zinc-500"
                            }`}>
                              {currentPreviewBlock.type}
                            </div>
                          )}
                          {safePage === 0 && (form.bpm || form.timeSignature) && (
                            <div className="mb-2 flex gap-3 text-[10px] font-semibold tracking-wider text-zinc-500">
                              {form.bpm && <span>{form.bpm} BPM</span>}
                              {form.timeSignature && <span className="text-amber-400/70">{form.timeSignature}</span>}
                            </div>
                          )}
                          <ChordRenderer
                            content={currentPreviewBlock.rawContent}
                            transpose={0}
                            accidentalPreference={settings?.accidentalPreference}
                            fontSize={19}
                            chordSize={13}
                            lineSpacing={1.3}
                            performance
                          />
                        </div>
                      ) : null
                    ) : (
                      <p className="text-xs text-zinc-600 mt-12 text-center">Start typing content…</p>
                    )}
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="w-20 h-1 rounded-full bg-zinc-700" />
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
