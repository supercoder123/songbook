import { z } from "zod";

export const songSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  originalKey: z.string(),
  currentKey: z.string(),
  bpm: z.number().optional(),
  timeSignature: z.string().optional(),
  content: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  favorite: z.boolean(),
  youtubeUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.number(),
});

const setlistItemSchema = z.object({
  songId: z.string(),
  order: z.number(),
  transposeOffset: z.number().optional(),
  performanceNotes: z.string().optional(),
});

const setlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(setlistItemSchema),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const settingsSchema = z.object({
  id: z.literal("app-settings"),
  theme: z.enum(["dark", "light", "system"]),
  accidentalPreference: z.enum(["sharp", "flat", "auto"]),
  defaultFontSize: z.number(),
  defaultChordSize: z.number(),
  defaultLineSpacing: z.number(),
  defaultAutoScrollSpeed: z.number(),
  showNotesInPerformance: z.boolean(),
  sectionPaginationDefault: z.boolean(),
  fitToScreenDefault: z.boolean(),
  schemaVersion: z.number(),
});

export const backupSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  songs: z.array(songSchema),
  setlists: z.array(setlistSchema),
  settings: settingsSchema.optional(),
});

export type BackupData = z.infer<typeof backupSchema>;
export const createSongSchema = songSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  schemaVersion: true,
});
export const updateSongSchema = songSchema.partial().omit({
  id: true,
  createdAt: true,
});
