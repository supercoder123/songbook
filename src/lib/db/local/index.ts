import Dexie, { type Table } from "dexie";
import type { Song } from "@/types/song";
import type { SetlistItem } from "@/types/setlist";

interface LocalSetlist {
  id: string;
  name: string;
  items: SetlistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class SongbookDb extends Dexie {
  songs!: Table<Song, string>;
  setlists!: Table<LocalSetlist, string>;

  constructor() {
    super("songbook");
    this.version(1).stores({
      songs: "id, title, artist, updatedAt, favorite",
      setlists: "id, name, updatedAt",
    });
  }
}

export const localDb = new SongbookDb();
