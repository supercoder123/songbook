import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import type { SetlistItem } from "@/types/setlist";
import type { AppSettings } from "@/types/settings";


export const songs = pgTable("songs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  originalKey: varchar("original_key", { length: 16 }).notNull(),
  currentKey: varchar("current_key", { length: 16 }).notNull(),
  bpm: integer("bpm"),
  timeSignature: varchar("time_signature", { length: 16 }),
  content: text("content").notNull(),
  notes: text("notes").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  favorite: boolean("favorite").notNull().default(false),
  youtubeUrl: varchar("youtube_url", { length: 2048 }),
  createdAt: varchar("created_at", { length: 32 }).notNull(),
  updatedAt: varchar("updated_at", { length: 32 }).notNull(),
  schemaVersion: integer("schema_version").notNull().default(1),
});

export const setlists = pgTable("setlists", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  items: jsonb("items").$type<SetlistItem[]>().notNull(),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 32 }).notNull(),
  updatedAt: varchar("updated_at", { length: 32 }).notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  data: jsonb("data").$type<AppSettings>().notNull(),
  updatedAt: varchar("updated_at", { length: 32 }).notNull(),
});

export const meta = pgTable("meta", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: varchar("value", { length: 2048 }).notNull(),
});
