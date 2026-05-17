import type { Song, CreateSongInput } from "@/types/song";
import type { Setlist, CreateSetlistInput } from "@/types/setlist";
import type { AppSettings } from "@/types/settings";

export interface ISongRepository {
  getAll(): Promise<Song[]>;
  getById(id: string): Promise<Song | null>;
  create(song: CreateSongInput): Promise<Song>;
  update(id: string, patch: Partial<Song>): Promise<Song>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Song>;
  count(): Promise<number>;
}

export interface ISetlistRepository {
  getAll(): Promise<Setlist[]>;
  getById(id: string): Promise<Setlist | null>;
  create(setlist: CreateSetlistInput): Promise<Setlist>;
  update(id: string, patch: Partial<Setlist>): Promise<Setlist>;
  delete(id: string): Promise<void>;
}

export interface ISettingsRepository {
  get(): Promise<AppSettings>;
  update(patch: Partial<AppSettings>): Promise<AppSettings>;
}
