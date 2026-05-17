import guitarDb from "@tombatossals/chords-db/lib/guitar.json";
import piano from "@tombatossals/chords-db/lib/piano.json";

export interface GuitarShape {
  frets: (number | "x")[];
  fingers?: number[];
  baseFret?: number;
  barres?: number[];
}

function normalizeSuffix(quality: string): string {
  if (quality === "") return "major";
  if (quality === "m") return "minor";
  if (quality === "maj7") return "maj7";
  if (quality === "m7") return "m7";
  if (quality === "7") return "7";
  if (quality === "dim") return "dim";
  if (quality === "sus4") return "sus4";
  if (quality === "sus2") return "sus2";
  if (quality === "aug") return "aug";
  // fallback for unsupported ones, could add more mappings
  return quality;
}

export function getGuitarShape(chord: string): GuitarShape | null {
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) return null;
  const root = rootMatch[1].replace("b", "b"); // the db uses "b" or "sharp"? Wait.

  // Let's check how the DB stores keys. It usually stores C, Csharp, Db?
  // Let me map it.
  const dbKeyMap: Record<string, string> = {
    "C": "C", "C#": "Csharp", "Db": "Db", "D": "D", "D#": "Dsharp", "Eb": "Eb",
    "E": "E", "F": "F", "F#": "Fsharp", "Gb": "Gb", "G": "G", "G#": "Gsharp",
    "Ab": "Ab", "A": "A", "A#": "Asharp", "Bb": "Bb", "B": "B"
  };

  const key = dbKeyMap[root];
  if (!key) return null;

  const quality = chord.slice(root.length);
  const suffix = normalizeSuffix(quality);

  const keyChords = (guitarDb.chords as Record<string, any[]>)[key];
  if (!keyChords) return null;

  const match = keyChords.find(c => c.suffix === suffix || c.suffix === quality);
  if (!match || !match.positions || match.positions.length === 0) return null;

  const pos = match.positions[0]; // first position is usually the easiest/open chord
  return {
    frets: pos.frets.map((f: number) => f === -1 ? "x" : f),
    fingers: pos.fingers,
    baseFret: pos.baseFret,
    barres: pos.barres,
  };
}

export function renderGuitarSvg(chord: string, width = 120, height = 140): string {
  const shape = getGuitarShape(chord);
  const strings = 6;
  const fretsOnBoard = 5;
  const padding = 16;
  const fretWidth = (width - padding * 2) / fretsOnBoard;
  const stringGap = (height - padding * 2) / (strings - 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="transparent"/>`;

  for (let s = 0; s < strings; s++) {
    const x1 = padding;
    const x2 = width - padding;
    const y = padding + s * stringGap;
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="currentColor" stroke-width="1"/>`;
  }

  for (let f = 0; f <= fretsOnBoard; f++) {
    const x = padding + f * fretWidth;
    svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="currentColor" stroke-width="${f === 0 ? 2 : 1}"/>`;
  }

  if (!shape) {
    svg += `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="currentColor">${chord}</text>`;
    svg += `</svg>`;
    return svg;
  }

  // Draw barre if exists
  if (shape.barres && shape.barres.length > 0) {
    shape.barres.forEach(barreFret => {
      const base = shape.baseFret ?? 1;
      const displayFret = barreFret - base + 1;
      if (displayFret >= 1 && displayFret <= fretsOnBoard) {
        const x = padding + (displayFret - 0.5) * fretWidth;
        const minString = shape.frets.findIndex(f => f !== "x");
        const maxString = shape.frets.findLastIndex(f => f !== "x");
        if (minString !== -1 && maxString !== -1) {
          const y1 = padding + minString * stringGap;
          const y2 = padding + maxString * stringGap;
          svg += `<rect x="${x - 4}" y="${y1 - 4}" width="8" height="${y2 - y1 + 8}" rx="4" fill="currentColor" opacity="0.3"/>`;
        }
      }
    });
  }

  shape.frets.forEach((fret, stringIndex) => {
    const y = padding + stringIndex * stringGap;
    if (fret === "x") {
      svg += `<text x="${padding - 8}" y="${y + 4}" font-size="10" fill="currentColor">×</text>`;
    } else if (fret === 0) {
      svg += `<circle cx="${padding - 6}" cy="${y}" r="3" fill="none" stroke="currentColor"/>`;
    } else {
      const base = shape.baseFret ?? 1;
      const displayFret = typeof fret === "number" ? fret - base + 1 : 1;
      const x = padding + (displayFret - 0.5) * fretWidth;
      svg += `<circle cx="${x}" cy="${y}" r="5" fill="currentColor"/>`;
    }
  });

  // Draw base fret number if > 1
  if ((shape.baseFret ?? 1) > 1) {
    svg += `<text x="${padding - 10}" y="${padding + 8}" font-size="10" fill="currentColor">${shape.baseFret}fr</text>`;
  }

  svg += `<text x="${width / 2}" y="12" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">${chord}</text>`;
  svg += `</svg>`;
  return svg;
}
