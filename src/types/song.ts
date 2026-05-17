
export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  currentKey: string;
  bpm?: number;
  timeSignature?: string;
  content: string;
  notes: string;
  tags: string[];
  favorite: boolean;
  youtubeUrl?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export type CreateSongInput = Omit<
  Song,
  "id" | "createdAt" | "updatedAt" | "schemaVersion"
>;
