import Dexie, { type Table } from "dexie";
import type { Song } from "@/types/song";
import type { Setlist } from "@/types/setlist";
import type { AppSettings } from "@/types/settings";

export interface MetaRecord {
  key: string;
  value: string | number | boolean;
}

export class SongbookDatabase extends Dexie {
  songs!: Table<Song, string>;
  setlists!: Table<Setlist, string>;
  settings!: Table<AppSettings, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super("songbook");

    this.version(1).stores({
      songs: "id, title, artist, favorite, updatedAt, *tags",
      setlists: "id, name, updatedAt",
      settings: "id",
      meta: "key",
    });
  }
}

export const db = new SongbookDatabase();
