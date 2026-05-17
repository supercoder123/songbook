export interface SetlistItem {
  songId: string;
  order: number;
  transposeOffset?: number;
  performanceNotes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  items: SetlistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateSetlistInput = Omit<
  Setlist,
  "id" | "createdAt" | "updatedAt"
>;
