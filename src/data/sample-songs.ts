import { v4 as uuidv4 } from "uuid";
import type { CreateSongInput } from "@/types/song";
import type { CreateSetlistInput } from "@/types/setlist";

export const SAMPLE_SONGS: CreateSongInput[] = [
  {
    title: "Way Maker",
    artist: "Sinach",
    originalKey: "D",
    currentKey: "D",
    bpm: 68,
    timeSignature: "4/4",
    tags: ["worship", "contemporary"],
    favorite: true,
    youtubeUrl: "https://www.youtube.com/watch?v=dO-Q3ub46OM",
    notes: "Repeat chorus twice. Build dynamically on final chorus.",
      content: `{start_of_verse}\n[D]You are here, moving in our midst\n[D]I worship You, I worship You\n{end_of_verse}\n{start_of_chorus}\n[G]Way maker, miracle worker\n[Em]Promise keeper, light in the darkness\n[Bm]My God, [A]that is who You are\n{end_of_chorus}\n{start_of_bridge}\n[G]Even when I don't see it, You're working\n[Em]Even when I don't feel it, You're working\n[Bm]You never stop, You never stop [A]working\n{end_of_bridge}`
  },
  {
    title: "Goodness of God",
    artist: "Bethel Music",
    originalKey: "G",
    currentKey: "G",
    bpm: 72,
    timeSignature: "4/4",
    tags: ["worship", "contemporary"],
    favorite: false,
    notes: "Soft piano intro. Key change optional after bridge.",
    content: `{start_of_verse}\n[G]I love You, Lord, for Your [C]mercy never [G]fails\n[Em]I've been held in Your [C]hands\n{end_of_verse}\n{start_of_chorus}\n[G]All my life You have been [C]faithful\n[Em]All my life You have been [D]so, so [C]good\n{end_of_chorus}`
  },
  {
    title: "Gratitude",
    artist: "Brandon Lake",
    originalKey: "D",
    currentKey: "D",
    bpm: 140,
    timeSignature: "4/4",
    tags: ["worship", "contemporary"],
    favorite: false,
    notes: "High energy. Watch tempo on chorus.",
    content: `{start_of_verse}\n[D]All my words fall [G]short\n[Bm]I got nothing [A]left\n{end_of_verse}\n{start_of_chorus}\n[G]Thank You for [D]crossing the [A]grave\n[Bm]Thank You that [G]nothing could [A]separate\n{end_of_chorus}`
  },
  {
    title: "10,000 Reasons (Bless the Lord)",
    artist: "Matt Redman",
    originalKey: "G",
    currentKey: "G",
    bpm: 74,
    timeSignature: "4/4",
    tags: ["worship", "hymn"],
    favorite: true,
    notes: "Great for opening worship. Acoustic works well.",
    content: `{start_of_verse}\n[G]Bless the Lord, O my [C]soul, O my [G]soul\n[Em]Worship His holy [C]name\n{end_of_verse}\n{start_of_chorus}\n[C]Bless the Lord, O my [G]soul, O my [D]soul\n[Em]Worship His holy [C]name\n{end_of_chorus}`
  },
  {
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    originalKey: "C",
    currentKey: "C",
    bpm: 80,
    timeSignature: "4/4",
    tags: ["worship", "contemporary"],
    favorite: false,
    notes: "Congregational song. Keep tempo steady.",
    content: `{start_of_verse}\n[C]The splendor of the [F]King, clothed in [C]majesty\n[Am]Let all the earth re[F]joice\n{end_of_verse}\n{start_of_chorus}\n[C]How great is our God, sing with [F]me\n[Am]How great is our God, all will [F]see\n{end_of_chorus}`
  },
];

export function getSampleSetlist(songIds: string[]): CreateSetlistInput {
  return {
    name: "Sunday Worship Set",
    notes: "Morning service setlist",
    items: songIds.slice(0, 3).map((songId, index) => ({
      songId,
      order: index,
      performanceNotes:
        index === 0
          ? "Soft piano intro"
          : index === 1
            ? "Build energy"
            : "Key change after bridge",
    })),
  };
}
